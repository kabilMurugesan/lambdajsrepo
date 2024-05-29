import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IJobRepository } from '../interfaces/repo/IJobRepository';
import {
  ConfirmJobRequest,
  EditJobRequest,
  SaveJobRequest,
  guardPunchTimeRequest,
} from '../dto/JobDTO';
import { Job } from '../entities/Job';
import { Configurations } from '../entities/Configurations';
import { GlobalConstants } from '../constants/constants';
import { checkList } from '../entities/CheckList';
import { JobInterest } from '../entities/JobInterest';
import { JobGuards } from '../entities/JobGuards';
import { UserProfile } from '../entities/UserProfile';
import { Payments } from '../entities/Payments';
import { SaveJobGuardsRequest } from '../dto/AddingJobGuards';
import moment from 'moment';
import { JobGuardCoordinates } from '../entities/GuardCoordinates';
import { JobDay } from '../entities/JobDays';
import { UserStripeAccounts } from '../entities/UserStripeAccounts';
import axios from 'axios';
import { externalConfig } from '../configuration/externalConfig';
import { CrimeIndexFee } from '../entities/CrimeIndexFee';
import { Like, Not } from 'typeorm';
import { TeamMembers } from '../entities/TeamMembers';
import { JobEventTypes } from '../entities/JobEventTypes';

@injectable()
export class JobRepository implements IJobRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    private readonly globalConstants = GlobalConstants
  ) {}
  private async getGeoLocationDetails(latLang: string) {
    const apiKey = externalConfig.GOOGLE_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLang}&key=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      const { results } = response.data;

      if (results && results.length > 0) {
        let municipality = '';
        for (const component of results) {
          if (
            component.types.includes('locality') &&
            component.types.includes('political')
          ) {
            municipality =
              component.address_components[0].long_name.toLowerCase();
          }
        }
        console.log('municipality', municipality);
        return municipality;
      } else {
        throw new Error(
          `Error fetching geo location information for latLang ${latLang}`
        );
      }
    } catch (error) {
      throw new Error(
        `Error fetching geo location information: ${error.message}`
      );
    }
  }

  private async calculateDistance(
    lat1: any,
    lon1: any,
    lat2: any,
    lon2: any
  ): Promise<any> {
    const earthRadius = 6371; // Radius of the Earth in kilometers

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance;
  }
  private async getDateTimeByLatLng(
    latitude: any,
    longitude: any
  ): Promise<any> {
    const apiKey = externalConfig.GOOGLE_API_KEY;
    const timestamp = Date.now();
    const timestampString = timestamp.toString();
    const formattedTimestamp = timestampString.substring(0, 10);

    const geocodingResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude}%2C${longitude}&timestamp=${formattedTimestamp}&key=${apiKey}`
    );
    // const location = geocodingResponse.data.features[0].properties;
    // Get the time zone name from the location data
    if (geocodingResponse.status === 200) {
      // Get the time zone name from the location data
      return geocodingResponse.data.timeZoneName;
    } else {
      console.error('Error fetching time zone data');
    }
  }

  private async isOutsideRadius(
    centerLat: any,
    centerLon: any,
    pointLat: any,
    pointLon: any,
    radius: any
  ): Promise<any> {
    const distance = await this.calculateDistance(
      centerLat,
      centerLon,
      pointLat,
      pointLon
    );
    return distance > radius;
  }

  async saveJob(user: any, saveJobPayload: SaveJobRequest): Promise<any> {
    // const totalJobDays: any = await this.getTotalJobDays(saveJobPayload);
    // if (totalJobDays < 1) {
    //   throw new Error(
    //     'The selected weekday(s) must fall within the selected start time and end time.'
    //   );
    // }

    const userId = user.id;
    const repo = await this.database.getRepository(Job);
    const checklist = await this.database.getRepository(checkList);
    const jobOccurenceDays = await this.database.getRepository(JobDay);
    const jobs = await repo.find({
      select: ['jobRefId'],
      order: { jobRefId: 'DESC' },
      take: 1,
    });
    const coordinates = saveJobPayload.jobVenueLocationCoordinates;
    // const coordinates = saveJobPayload.jobVenueLocationCoordinates;
    // const [latitude, longitude] = coordinates.split(',');
    const [latitude, longitude] = coordinates
      .split(',')
      .map((location) => parseFloat(location.trim()));
    console.log(latitude, longitude);
    let timeZoneName;
    try {
      timeZoneName = await this.getDateTimeByLatLng(latitude, longitude);
    } catch (e) {
      return e;
    }

    const jobRefId = jobs.length > 0 ? parseInt(jobs[0].jobRefId) + 1 : 1;
    const insertedJob = await repo.insert({
      userId,
      jobRefId,
      jobName: saveJobPayload.jobName,
      timeZoneName,
      guardCoverageId: saveJobPayload.guardCoverageId,
      guardSecurityServiceId: saveJobPayload.guardSecurityServiceId,
      noOfGuards: saveJobPayload.noOfGuards,
      bookingReason: saveJobPayload.bookingReason,
      startDate: saveJobPayload.startDate,
      endDate: saveJobPayload.endDate,
      jobVenue: saveJobPayload.jobVenue,
      jobVenueLocationCoordinates: saveJobPayload.jobVenueLocationCoordinates,
      // jobVenueRadius: saveJobPayload.jobVenueRadius,
      createdOn: new Date(),
      updatedOn: new Date(),
      updatedBy: this.globalConstants.SYS_ADMIN_GUID,
      createdBy: this.globalConstants.SYS_ADMIN_GUID,
    });

    const generatedMaps = insertedJob.generatedMaps;
    if (generatedMaps.length === 0) {
      throw new Error('Auto-generated ID not found');
    }

    const generatedId = await generatedMaps[0].id;

    const insertPromises = saveJobPayload?.checkList?.map(async (savejob) => {
      await checklist.insert({
        userId: userId,
        date: savejob.date,
        time: savejob.time,
        description: savejob.description,
        jobId: generatedId,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      });
    });
    const JobOccurenceDays = saveJobPayload?.jobOccurenceDays?.map(
      async (savejob) => {
        await jobOccurenceDays.insert({
          jobId: generatedId,
          startTime: savejob.startTime,
          endTime: savejob.endTime,
          day: savejob.day,
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
          createdBy: this.globalConstants.SYS_ADMIN_GUID,
          updatedOn: new Date(),
          createdOn: new Date(),
        });
      }
    );

    await Promise.all(insertPromises);
    await Promise.all(JobOccurenceDays);

    //Added job Events
    const eventTypes = saveJobPayload.guardServiceId;
    const jobEventTypesRepo = await this.database.getRepository(JobEventTypes);
    // await jobEventTypesRepo.delete({ jobId: generatedId });
    const createJobEventTypes = eventTypes?.map(async (eventId) => {
      await jobEventTypesRepo.insert({
        jobId: generatedId,
        jobInterestId: eventId,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      });
    });
    await Promise.all(createJobEventTypes);
    const insertedJobList = await repo.find({ where: { id: generatedId } });
    const insertedCheckList = await checklist.find({
      where: { jobId: generatedId },
    });
    const insertJobOccurence = await jobOccurenceDays.find({
      where: { jobId: generatedId },
    });
    return { insertedJobList, insertJobOccurence, insertedCheckList };
  }

  // private async getTotalJobDays(saveJobPayload: any): Promise<any> {
  //   const targetDays = saveJobPayload.jobOccurenceDays;
  //   if (!targetDays || targetDays.length === 0) {
  //     throw new Error('Job days not found for this job');
  //   }

  //   const [jobStartDate, jobEndDate] = [
  //     saveJobPayload.startDate,
  //     saveJobPayload.endDate,
  //   ].map((time) => moment(time).format('YYYY-MM-DD'));

  //   const targetDaysArray = targetDays.map((targetDay: any) => targetDay.day);
  //   return await this.countMatchingDaysBetween(
  //     jobStartDate,
  //     jobEndDate,
  //     targetDaysArray
  //   );
  // }

  async editJob(user: any, editJobPayload: EditJobRequest): Promise<any> {
    const userId = user.id;
    const repo = await this.database.getRepository(Job);
    const checklist = await this.database.getRepository(checkList);
    const jobOccurenceDayss = await this.database.getRepository(JobDay);

    const JobList: any = await repo.find({
      where: { id: editJobPayload.jobId },
    });
    if (!JobList || JobList == '') {
      return { data: '', message: 'Invalid job details.' };
    }
    if (
      editJobPayload &&
      editJobPayload.jobOccurenceDays &&
      editJobPayload?.jobOccurenceDays.length > 0
    ) {
      const alreadyExists = await jobOccurenceDayss.find({
        where: { jobId: editJobPayload.jobId },
      });
      if (alreadyExists) {
        await jobOccurenceDayss.delete({ jobId: editJobPayload.jobId });
      }
    }
    const JobOccurenceDays = editJobPayload?.jobOccurenceDays?.map(
      async (savejob) => {
        await jobOccurenceDayss.insert({
          jobId: editJobPayload.jobId,
          startTime: savejob.startTime,
          endTime: savejob.endTime,
          day: savejob.day,
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
          createdBy: this.globalConstants.SYS_ADMIN_GUID,
          updatedOn: new Date(),
          createdOn: new Date(),
        });
      }
    );
    if (
      editJobPayload &&
      editJobPayload?.checkList &&
      editJobPayload?.checkList?.length > 0
    ) {
      const checkListLength = await checklist.findOne({
        where: { jobId: editJobPayload.jobId },
      });

      if (checkListLength !== null && checkListLength !== undefined) {
        try {
          await checklist.delete({ jobId: editJobPayload.jobId });
        } catch (error) {
          console.error('Error deleting checklist:', error);
        }
      }
      const insertPromises =
        editJobPayload &&
        editJobPayload?.checkList &&
        editJobPayload?.checkList?.map(async (savejob) => {
          await checklist.insert(
            // { jobId: editJobPayload.jobId, userId: userId },
            {
              userId: userId,
              date: savejob.date,
              time: savejob.time,
              description: savejob.description,
              jobId: editJobPayload.jobId,
              updatedBy: this.globalConstants.SYS_ADMIN_GUID,
              createdBy: this.globalConstants.SYS_ADMIN_GUID,
              updatedOn: new Date(),
              createdOn: new Date(),
            }
          );
        });
      await Promise.all(insertPromises);
      // @ts-ignore
      delete editJobPayload.checkList;
    }
    if (
      editJobPayload &&
      editJobPayload.jobOccurenceDays &&
      editJobPayload?.jobOccurenceDays.length > 0
    ) {
      await Promise.all(JobOccurenceDays);
      // @ts-ignore
      delete editJobPayload.jobOccurenceDays;
    }

    const jobToUpdate: any = {};
    for (const [key, value] of Object.entries(editJobPayload)) {
      if (key !== 'jobId' && key !== 'guardServiceId') {
        jobToUpdate[key] = value;
      }
    }
    await repo.update(
      { id: editJobPayload.jobId, userId: userId },
      jobToUpdate
    );

    //Added job Events

    const eventTypes = editJobPayload.guardServiceId;
    const jobEventTypesRepo = await this.database.getRepository(JobEventTypes);
    if (editJobPayload && editJobPayload.guardServiceId) {
      await jobEventTypesRepo.delete({ jobId: editJobPayload.jobId });
    }

    const createJobEventTypes = eventTypes?.map(async (eventId) => {
      await jobEventTypesRepo.insert({
        jobId: editJobPayload.jobId,
        jobInterestId: eventId,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      });
    });
    if (editJobPayload && editJobPayload.guardServiceId) {
      await Promise.all(createJobEventTypes);
    }
    const insertedJobList = await repo.find({
      where: { id: editJobPayload.jobId },
    });
    const insertJobOccurence = await jobOccurenceDayss.find({
      where: { jobId: editJobPayload.jobId },
    });
    if (editJobPayload?.checkList?.length > 0) {
      const insertedCheckList = await checklist.find({
        where: { jobId: editJobPayload.jobId },
      });
      return { insertedJobList, insertJobOccurence, insertedCheckList };
    }

    let insertedCheckList = '';
    return { insertedJobList, insertJobOccurence, insertedCheckList };
  }

  private async getJobInterestDetails(jobInterestId: any): Promise<any> {
    const jobInterestRepo = await this.database.getRepository(JobInterest);
    const guardInterest = await jobInterestRepo.findOneBy({
      id: jobInterestId,
    });
    return guardInterest.interestName;
  }

  private async getJobServiceTypeDetails(
    jobId: string,
    interestType: any
  ): Promise<string> {
    const jobInterestRepo = await this.database.getRepository(JobInterest);

    const jobInterests = await jobInterestRepo
      .createQueryBuilder('ji')
      .select('ji.interest_name', 'interest_name')
      .innerJoin(JobEventTypes, 'jet', 'jet.job_interest_id = ji.id')
      .where('jet.job_id = :jobId', { jobId })
      .andWhere('ji.interest_type = :interestType', { interestType })
      .getRawMany<{ interest_name: string }>();

    // Extract job interest names and join them into a comma-separated string
    const jobInterestNames: string = jobInterests
      .map((interest) => interest.interest_name)
      .join(', ');

    console.log(jobInterestNames);
    return jobInterestNames;
  }

  async getJobDetails(jobId: string): Promise<any> {
    const repo = await this.database.getRepository(Job);
    return await repo.findOneBy({
      id: jobId,
    });
  }

  async deleteJob(jobId: string, status: any): Promise<any> {
    const repo = await this.database.getRepository(Job);
    if (status === 'delete') {
      const deleteJob = await repo.update(
        {
          id: jobId,
        },
        { isJobDeletedByAdmin: true }
      );
      return deleteJob;
    }
  }

  async savePayment(paymentData: any): Promise<any> {
    const repo = await this.database.getRepository(Payments);
    return await repo.insert(paymentData);
  }

  private async getJobGuardsNames(jobId: any): Promise<any> {
    const jobGuardsRepo = await this.database.getRepository(JobGuards);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const jobGuards = await jobGuardsRepo.find({ where: { jobId } });

    const profileNames = await Promise.all(
      jobGuards &&
        jobGuards.map(async (jobGuard) => {
          const user = await userProfileRepo.findOne({
            where: { userId: jobGuard.userId },
          });
          if (user && user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
          }
          return null;
        })
    );

    // Filter out any null values and join the profile names with commas
    const filteredProfileNames = profileNames
      .filter((profileName) => profileName !== null)
      .join(', ');

    return filteredProfileNames;
  }

  private async getJobGuardsDetails(jobId: any): Promise<any> {
    const jobGuardsRepo = await this.database.getRepository(JobGuards);

    const jobGuards = await jobGuardsRepo
      .createQueryBuilder('jobGuards')
      .select(['user_profile.*', 'user.*'])
      .innerJoin(
        'user_profile',
        'user_profile',
        'user_profile.user_id = jobGuards.user_id'
      )
      .leftJoinAndSelect(
        'user_profile.state',
        'state',
        'user_profile.srbStateId != "" AND user_profile.srbStateId IS NOT NULL'
      )
      .innerJoin('user', 'user', 'user.id = jobGuards.user_id')
      .where('jobGuards.job_id = :jobId', { jobId })
      .getRawMany();

    return jobGuards;
  }

  async countMatchingDaysBetween(
    startDate: string,
    endDate: string,
    targetDays: string[]
  ): Promise<number> {
    console.log('startDate', startDate);
    console.log('endDate', endDate);
    let current = moment(startDate);
    const end = moment(endDate);
    console.log('current', current);
    console.log('end', end);

    let matchingDaysCount = 0;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const currentDay = current.format('ddd'); // Get the day abbreviation (e.g., Mon, Tue)

      console.log('currentDay', currentDay);
      console.log(targetDays.includes(currentDay));

      // Check if the current day is in the target days array
      if (targetDays.includes(currentDay)) {
        matchingDaysCount++;
      }

      // Move to the next day
      current.add(1, 'day');
    }

    return matchingDaysCount;
  }

  // Function to calculate the time difference as a float
  async getTimeDifferenceInHours(
    startDate: any,
    endDate: any
  ): Promise<number> {
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    startDate.setSeconds(0, 0);
    endDate.setSeconds(0, 0);

    console.log('startDate1', startDate);
    console.log('endDate1', endDate);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Math.abs(endDate - startDate);

    // Calculate total hours
    const totalHours = differenceInMilliseconds / (1000 * 60 * 60);

    // Round total hours to two decimal places
    const roundedTotalHours: any = totalHours.toFixed(2);
    return roundedTotalHours;
  }

  async getJobSummary(jobId: any): Promise<Job[]> {
    const repo = await this.database.getRepository(Job);
    const jobGuardsRepo = await this.database.getRepository(JobDay);

    const jobStartDate = await jobGuardsRepo.findOneBy({
      jobId: jobId,
    });
    const jobDetails = await repo.findOneBy({
      id: jobId,
    });
    jobDetails.startTime = jobStartDate.startTime;
    jobDetails.guardCoverage = await this.getJobInterestDetails(
      jobDetails.guardCoverageId
    );
    jobDetails.guardService = await this.getJobServiceTypeDetails(jobId, 2);
    jobDetails.guardSecurityService = await this.getJobInterestDetails(
      jobDetails.guardSecurityServiceId
    );

    jobDetails.guards = await this.getJobGuardsNames(jobId);
    const {
      totalJobHours,
      totalCost,
      startDateTime,
      endDateTime,
      additionalAmount,
    } = await this.getJobDurationCostDetails(jobDetails, jobId);

    console.log('totalJobHours', totalJobHours);
    console.log('totalCost', totalCost);

    jobDetails.jobCost = parseFloat(totalCost);

    const municipality = await this.getGeoLocationDetails(
      jobDetails.jobVenueLocationCoordinates
    );
    jobDetails.crimeRateCommissionPercentage =
      await this.getCrimeRateCommissionPercentage(municipality);

    // Extracting the hours and minutes from the decimal representation
    let hours = Math.floor(totalJobHours); // Extracting the whole hours
    let minutes = Math.round((totalJobHours - hours) * 60); // Converting the remaining decimal to minutes

    // If the minutes equal 60, adjust the hours and set the minutes to zero
    if (minutes === 60) {
      hours++;
      minutes = 0;
    }

    // Creating a string representation in hours and minutes
    let timeString = `${hours} hrs`;
    if (minutes > 0) {
      timeString += ` ${minutes} min`;
    }
    jobDetails.totalJobHours = timeString;
    const configRepo = await this.database.getRepository(Configurations);
    const configDetails = await configRepo.find({ take: 1 });
    jobDetails.commissionFeePercentage = parseFloat(
      configDetails[0].commissionFeePercentage
    );
    jobDetails.stripeTransactionFeePercentage = parseFloat(
      configDetails[0].stripeTransactionFeePercentage
    );

    console.log('jobCost', jobDetails.jobCost);

    // Calculating crime index commission cost
    jobDetails.crimeRateCommissionCost = parseFloat(
      (
        (jobDetails.jobCost * jobDetails.crimeRateCommissionPercentage) /
        100
      ).toFixed(2)
    );

    console.log('crimeRateCommissionCost', jobDetails.crimeRateCommissionCost);

    jobDetails.totalCost = parseFloat(
      jobDetails.jobCost + jobDetails.crimeRateCommissionCost
    );

    console.log('jobCostAfterCrimeRate', jobDetails.totalCost);

    // let additionalAmount = 0;
    // if (totalJobHours < 4) {
    //   console.log('totalJobHours', totalJobHours);
    //   const remainingBillingHours = 4 - totalJobHours;
    //   console.log('remainingBillingHours', remainingBillingHours);
    //   console.log('totalCost', jobDetails.totalCost);
    //   let hourlyRate = jobDetails.totalCost / totalJobHours;
    //   console.log('hourlyRate', hourlyRate);
    //   if (isNaN(hourlyRate)) {
    //     hourlyRate = 0;
    //   }
    //   additionalAmount = remainingBillingHours * hourlyRate;
    //   console.log('additionalAmount', additionalAmount);
    //   jobDetails.totalCost = parseFloat(
    //     jobDetails.totalCost + additionalAmount
    //   ).toFixed(2);
    // }

    console.log('totalCost', jobDetails.totalCost);

    // Calculating transaction cost
    jobDetails.commissionCost = parseFloat(
      (
        (jobDetails.totalCost * jobDetails.commissionFeePercentage) /
        100
      ).toFixed(2)
    );
    console.log('commissionCost', jobDetails.commissionCost);

    // Calculating transaction cost
    jobDetails.transactionCost = parseFloat(
      (
        (jobDetails.totalCost * jobDetails.stripeTransactionFeePercentage) /
        100
      ).toFixed(2)
    );
    console.log('transactionCost', jobDetails.transactionCost);

    const totalTransactionCost = parseFloat(
      jobDetails.commissionCost + jobDetails.transactionCost
    ).toFixed(2);

    console.log('totalTransactionCost', totalTransactionCost);

    jobDetails.totalCost =
      parseFloat(jobDetails.totalCost) + parseFloat(totalTransactionCost);

    console.log('totalCost', jobDetails.totalCost);
    jobDetails.totalCost = parseFloat(jobDetails.totalCost).toFixed(2);

    if (isNaN(jobDetails.totalCost)) {
      jobDetails.totalCost = 0;
    }

    console.log('totalCost', jobDetails.totalCost);
    const jobObj = {
      jobCost: jobDetails.jobCost,
      commissionFeePercentage: jobDetails.commissionFeePercentage,
      commissionCost: jobDetails.commissionCost,
      stripeTransactionFeePercentage: jobDetails.stripeTransactionFeePercentage,
      transactionCost: jobDetails.transactionCost,
      totalCost: jobDetails.totalCost,
      crimeRateCommissionPercentage: jobDetails.crimeRateCommissionPercentage,
      crimeRateCommissionCost: jobDetails.crimeRateCommissionCost,
      minimumTimeExtraCost: additionalAmount,
    };

    jobDetails.startDate = moment(startDateTime, 'YYYY-MM-DD hh:mm A').format(
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
    );

    jobDetails.endDate = moment(endDateTime, 'YYYY-MM-DD hh:mm A').format(
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
    );

    await repo.update({ id: jobId }, jobObj);
    jobDetails.stripeTransactionFeePercentage = parseFloat(
      jobDetails.stripeTransactionFeePercentage +
        jobDetails.commissionFeePercentage
    ).toFixed(2);
    jobDetails.transactionCost = totalTransactionCost;
    jobDetails.jobCost = parseFloat(jobDetails.jobCost).toFixed(2);
    return jobDetails;
  }

  async getJobDurationCostDetails(jobDetails: any, jobId: any): Promise<any> {
    let additionalAmount = 0;
    const jobDayRepo = await this.database.getRepository(JobDay);
    const targetDays = await jobDayRepo
      .createQueryBuilder('jobDay')
      .where('jobDay.job_id = :jobId', { jobId })
      .getMany();

    if (!targetDays) {
      throw new Error('Job days not found for this job');
    }

    const { startTime, endTime } = targetDays[0];

    const [jobStartDate, jobEndDate] = [
      jobDetails.startDate,
      jobDetails.endDate,
    ].map((time) => moment(time).format('YYYY-MM-DD'));

    console.log('jobStartDate', jobStartDate);
    console.log('jobEndDate', jobEndDate);

    const startDate = new Date(jobStartDate);
    const endDate = new Date(jobEndDate);

    if (endDate < startDate) {
      throw new Error(
        'The job end date cannot be earlier than the start date. Please provide valid dates.'
      );
    }

    const targetDaysArray = targetDays.map((targetDay) => targetDay.day);
    console.log('targetDaysArray', targetDaysArray);
    let totalJobDays = 1;
    if (jobDetails.guardCoverageId == '8e0ca92d-3da6-4fc1-b1d1-61b7a06e4a5d') {
      totalJobDays = 1;
    } else {
      totalJobDays = await this.countMatchingDaysBetween(
        jobStartDate,
        jobEndDate,
        targetDaysArray
      );
    }
    console.log('totalJobDays', totalJobDays);

    console.log('startTime', startTime);
    console.log('endTime', endTime);

    const [startMoment, endMoment] = [startTime, endTime].map((time) =>
      moment(time).tz('UTC').startOf('minute')
    );

    console.log('startMoment', startMoment);
    console.log('endMoment', endMoment);

    const [jobStartTime, jobEndTime] = [startMoment, endMoment].map((moment) =>
      moment.format('hh:mm A')
    );

    const perDayHours: any = await this.getTimeDifferenceInHours(
      startTime,
      endTime
    );

    console.log('perDayHours', perDayHours);

    let totalJobHours = parseFloat(perDayHours);

    if (totalJobDays > 1) {
      totalJobHours = parseFloat((totalJobDays * perDayHours).toFixed(2));
    }

    let totalCost = 0;
    let isJobWithIn72Hours = false;
    const jobGuards = await this.getJobGuardsDetails(jobId);
    const jobGuardsRepo = await this.database.getRepository(JobGuards);

    const currentTime = moment().utc();
    let startDateTime: any = jobStartDate + ' ' + jobStartTime;
    let endDateTime: any = jobEndDate + ' ' + jobEndTime;
    if (jobDetails.guardCoverageId == '8e0ca92d-3da6-4fc1-b1d1-61b7a06e4a5d') {
      const [SingleJobStartDate, SingleJobEndDate] = [startTime, endTime].map(
        (time) => moment(time).format('YYYY-MM-DD')
      );
      startDateTime = SingleJobStartDate + ' ' + jobStartTime;
      endDateTime = SingleJobEndDate + ' ' + jobEndTime;
    }
    // startDateTime = moment(startDateTime).utc();
    // endDateTime = moment(endDateTime).utc();
    const hoursDifference = currentTime.diff(startDateTime, 'hours');
    console.log('hoursDifference', Math.abs(hoursDifference));

    // Check if the difference is within 72 hours
    if (Math.abs(hoursDifference) <= 72) {
      isJobWithIn72Hours = true;
      console.log('The time difference is within 72 hours.');
    }
    const teamIdCheck = await jobGuardsRepo.findOne({
      where: { jobId: jobId, teamId: Not(null) },
    });
    const TeamMembersrepo = await this.database.getRepository(TeamMembers);
    let checkIsTeamLead = {};
    if (teamIdCheck) {
      checkIsTeamLead = await TeamMembersrepo.findOne({
        where: { teamId: teamIdCheck.teamId, isLead: true },
      });
    }
    await Promise.all(
      jobGuards?.map(async (userProfile: any) => {
        if (checkIsTeamLead) {
          let userJobRatePerHour = userProfile.guard_job_rate;
          console.log('userJobRatePerHour1', userJobRatePerHour);
          if (isJobWithIn72Hours) {
            userJobRatePerHour = userJobRatePerHour * 1.5;
          }
          userJobRatePerHour = parseFloat(userJobRatePerHour);
          console.log('userJobRatePerHour2', userJobRatePerHour);
          let remainingBillingHours = 0;
          let guardTotalJobHours = totalJobHours;
          if (totalJobHours < 4) {
            remainingBillingHours = 4 - totalJobHours;
            guardTotalJobHours = 4;
            totalCost += userJobRatePerHour * guardTotalJobHours;
            additionalAmount += userJobRatePerHour * remainingBillingHours;
          } else {
            totalCost += userJobRatePerHour * totalJobHours;
          }
          // update to job guards table
          await jobGuardsRepo.update(
            { jobId: jobId, userId: userProfile.user_id },
            {
              jobOrgCostPerHour: userProfile.guard_job_rate,
              jobCostPerHour: userJobRatePerHour,
              totalJobHours: totalJobHours,
              totalJobAmount: userJobRatePerHour * guardTotalJobHours,
              transferStatus: 0,
            }
          );
        } else {
          let userJobRatePerHour = userProfile.guard_job_rate;
          console.log('userJobRatePerHour1', userJobRatePerHour);
          if (isJobWithIn72Hours) {
            userJobRatePerHour = userJobRatePerHour * 1.5;
          }
          userJobRatePerHour = parseFloat(userJobRatePerHour);
          console.log('userJobRatePerHour2', userJobRatePerHour);
          let remainingBillingHours = 0;
          let guardTotalJobHours = totalJobHours;
          if (totalJobHours < 4) {
            remainingBillingHours = 4 - totalJobHours;
            guardTotalJobHours = 4;
            totalCost += userJobRatePerHour * guardTotalJobHours;
            additionalAmount += userJobRatePerHour * remainingBillingHours;
          } else {
            totalCost += userJobRatePerHour * totalJobHours;
          }
          // update to job guards table
          await jobGuardsRepo.update(
            { jobId: jobId, userId: userProfile.user_id },
            {
              jobOrgCostPerHour: userProfile.guard_job_rate,
              jobCostPerHour: userJobRatePerHour,
              totalJobHours: totalJobHours,
              totalJobAmount: userJobRatePerHour * guardTotalJobHours,
              transferStatus: 0,
            }
          );
        }
      })
    );

    return {
      totalJobHours,
      totalCost,
      startDateTime,
      endDateTime,
      additionalAmount,
    };
  }

  async getCustomerPaymentDetails(userId: any): Promise<any> {
    const repo = await this.database.getRepository(UserStripeAccounts);
    return await repo.findOneBy({ userId, isPrimary: 1 });
  }

  async updatePaymentStatus(
    paymentDtls: any,
    userId: string,
    jobId: string
  ): Promise<any> {
    const repo = await this.database.getRepository(Job);
    return await repo.update(
      {
        userId,
        id: jobId,
      },
      paymentDtls
    );
  }

  async getJobGuards(confirmJobPayload: ConfirmJobRequest): Promise<any> {
    const jobId = confirmJobPayload.jobId;
    const repo = await this.database.getRepository(Job);
    const userRepo = await this.database.getRepository(UserProfile);
    await repo.update(
      { id: confirmJobPayload.jobId },
      {
        isJobCreated: true,
      }
    );

    const response = await repo.findOneBy({
      id: jobId,
    });
    const userName = await userRepo.findOne({
      where: { userId: response.userId },
    });
    response.guards = await this.getJobGuardsDetails(jobId);
    response.createdName = userName.firstName + ' ' + userName.lastName;
    return response;
  }

  async getCrimeRateCommissionPercentage(municipality: string): Promise<any> {
    let crimeIndexFee = this.globalConstants.DEFAULT_CRIME_INDEX_FEE;
    const repo = await this.database.getRepository(CrimeIndexFee);
    console.log('municipality', municipality);
    const response = await repo.findOne({
      where: {
        municipality: Like(`%${municipality}%`),
      },
    });
    if (response && response.crimeIndexFee && response.crimeIndexFee !== null) {
      crimeIndexFee = response.crimeIndexFee;
    }
    console.log('crimeIndexFee', crimeIndexFee);
    return crimeIndexFee;
  }

  async saveJobGuard(
    user: any,
    saveJobPayload: SaveJobGuardsRequest
  ): Promise<any> {
    // const userId = user.id;
    const repo = await this.database.getRepository(Job);
    const guardJobRepo = await this.database.getRepository(JobGuards);

    const isAlreadyExist = await guardJobRepo.findOneBy({
      jobId: saveJobPayload.jobId,
    });
    if (isAlreadyExist && isAlreadyExist != '') {
      await guardJobRepo.delete({ jobId: saveJobPayload.jobId });
    }
    const insertPromises = saveJobPayload?.jobGuards?.map(async (savejob) => {
      const jobGuardData: any = {
        jobId: saveJobPayload.jobId,
        userId: savejob.guardId,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      };
      if (savejob.teamId !== '' && savejob.teamId !== null) {
        jobGuardData.teamId = savejob.teamId;
      }
      await guardJobRepo.insert(jobGuardData);
    });
    await Promise.all(insertPromises);
    await repo.update(
      { id: saveJobPayload.jobId },
      {
        isGuardAdded: true,
      }
    );
    const insertJob = await guardJobRepo.findAndCountBy({
      jobId: saveJobPayload.jobId,
    });
    return insertJob;
  }

  async guardPunchTime(
    user: any,
    guardPunchTimeRequestload: guardPunchTimeRequest
  ): Promise<any> {
    const userId = user.id;
    const newTime = moment.utc().format('mm-dd-yyyy');
    const guardJobRepo = await this.database.getRepository(JobGuards);

    const userProfileRepo = await this.database.getRepository(UserProfile);
    const guardCoordinateRepo = await this.database.getRepository(
      JobGuardCoordinates
    );
    const jobRepo = await this.database.getRepository(Job);
    const jobResponse = await jobRepo.findOne({
      where: {
        id: guardPunchTimeRequestload.jobId,
      },
    });
    const coordinates = jobResponse.jobVenueLocationCoordinates;
    const [latitude, longitude] = coordinates.split(', ');

    const guardCoor = guardPunchTimeRequestload.guardCoordinates;
    const [guardLatitude, guardLongitude] = guardCoor.split(', ');
    let guardName = '';

    const ratedTo = await userProfileRepo.findOne({
      where: { userId: userId },
    });
    guardName = ratedTo.firstName + ' ' + ratedTo.lastName;
    const isAlreadyPunched = await guardJobRepo.findOneBy({
      jobId: guardPunchTimeRequestload.jobId,
      userId: userId,
    });
    const updatedBy = this.globalConstants.SYS_ADMIN_GUID;
    const createdBy = this.globalConstants.SYS_ADMIN_GUID;
    const updatedOn = new Date();
    const createdOn = new Date();
    const isOutside = await this.isOutsideRadius(
      latitude,
      longitude,
      guardLatitude,
      guardLongitude,
      jobResponse.jobVenueRadius
    );
    if (isOutside == true) {
      return {
        data: '',
        message: 'Please punchIn time after reaching the job coordinates.',
      };
    }
    if (isAlreadyPunched && isAlreadyPunched.isPunch != true) {
      await guardJobRepo.update(
        { jobId: guardPunchTimeRequestload.jobId, userId: userId },
        {
          guardInTime: new Date(),
          isPunch: true,
          updatedBy,
          createdBy,
          updatedOn,
          createdOn,
        }
      );
      await guardCoordinateRepo.insert({
        jobId: guardPunchTimeRequestload.jobId,
        userId: userId,
        teamId: guardPunchTimeRequestload.teamId,
        guardCoordinates: guardPunchTimeRequestload.guardCoordinates,
        isGuardWithInRadius: isOutside == true ? false : true,
        updatedBy,
        createdBy,
        updatedOn,
        createdOn,
      });
    } else {
      await guardJobRepo.update(
        { jobId: guardPunchTimeRequestload.jobId, userId: userId },
        {
          guardOutTime: newTime,
          isPunch: true,
          updatedBy,
          createdBy,
          updatedOn,
          createdOn,
        }
      );
      await guardCoordinateRepo.insert({
        jobId: guardPunchTimeRequestload.jobId,
        userId: userId,
        teamId: guardPunchTimeRequestload.teamId,
        guardCoordinates: guardPunchTimeRequestload.guardCoordinates,
        isGuardWithInRadius: isOutside == true ? false : true,
        updatedBy,
        createdBy,
        updatedOn,
        createdOn,
      });
    }
    const guardCoordinates = await guardJobRepo.find({
      where: {
        jobId: guardPunchTimeRequestload.jobId,
        userId: userId,
      },
    });
    const guardCoordinatesWithJobResponse = {
      guardCoordinates,
      jobResponse,
      isAlreadyPunched: isAlreadyPunched.isPunch,
      guardName: guardName,
      isGuardWithInRadius: isOutside == true ? false : true,
    };
    return guardCoordinatesWithJobResponse;
  }
}
