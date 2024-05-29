import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { Job } from '../entities/Job';
import { User } from '../entities/User';
import { JobGuards } from '../entities/JobGuards';
import { IJobListRepository } from '../interfaces/repo/IJobListRepository';
import { JobInterest } from '../entities/JobInterest';
import { checkList } from '../entities/CheckList';
import { UserProfile } from '../entities/UserProfile';
import { GlobalConstants } from '../constants/constants';
import { JobDay } from '../entities/JobDays';
import { Chats } from '../entities/Chats';
import { completedCheckList } from '../entities/CompletedCheckList';
import { JobEventTypes } from '../entities/JobEventTypes';
import { In } from 'typeorm';
// import { externalConfig } from '../configuration/externalConfig';

@injectable()
export class JobListRepository implements IJobListRepository {
  // private readonly awsData: any = externalConfig.AWS;

  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    // @inject(TYPES.IAwsService) private readonly awsService: IAwsService,
    private readonly globalConstants = GlobalConstants
  ) { }

  private async getJobInterestDetails(jobInterestId: any): Promise<any> {
    const jobInterestRepo = await this.database.getRepository(JobInterest);
    const guardInterest = await jobInterestRepo.findOneBy({
      id: jobInterestId,
    });
    return guardInterest.interestName;
  }

  private async getJobGuards(jobId: any): Promise<any> {
    const jobInterestRepo = await this.database.getRepository(JobGuards);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const checkListRepo = await this.database.getRepository(checkList);
    const jobGuards = await jobInterestRepo.findBy({
      jobId: jobId,
    });

    const interestNamesPromises = jobGuards.map(async (job) => {
      let status = 'PENDING';

      if (job.jobStatus === 1) {
        status = 'ACCEPTED';
      } else if (job.jobStatus === 2) {
        status = 'REJECTED';
      } else if (job.jobStatus === 3) {
        status = 'COMPLETED';
      }
      let User = await userProfileRepo.findOne({
        where: {
          userId: job.userId,
        },
      });
      let guardName = this.setName(User.firstName, User.lastName);
      // let profileImageUrl = '';
      // if (job.profilePhotoFileName != '' && job.profilePhotoFileName != null) {
      //   const profileImage = await this.awsService.getPreSignedUrl(
      //     `${this.awsData.profileImageFolder}/${User.profilePhotoFileName}`,
      //     900,
      //     'image'
      //   );
      //   if (profileImage != null && profileImage != '') {
      //     profileImageUrl = profileImage;
      //   } else {
      //     profileImageUrl = '';
      //   }
      // }
      const checkLists = await checkListRepo.find({
        where: {
          jobId: jobId,
        },
      });
      return { ...job, guardName, checkLists, status };
    });
    const responseWithInterestNames = await Promise.all(interestNamesPromises);

    return responseWithInterestNames;
  }
  private async calculateDuration(startTime: any, endTime: any): Promise<any> {
    if (!startTime || !endTime) {
      return 'Invalid date range';
    }

    // const parseDate = (dateString: any) => { //future use
    //   const dateRegex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;
    //   const match = dateString.match(dateRegex);

    //   if (match) {
    //     const [, year, month, day, hours, minutes, seconds, milliseconds] = match;
    //     return new Date(
    //       parseInt(year),
    //       parseInt(month) - 1,
    //       parseInt(day),
    //       parseInt(hours),
    //       parseInt(minutes),
    //       parseInt(seconds),
    //       parseInt(milliseconds)
    //     );
    //   }
    //   return null;
    // };

    const startDate = startTime;
    const endDate = endTime;
    if (!startDate || !endDate) {
      return 'Invalid date range';
    }
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const remainingMs = durationMs % (1000 * 60 * 60);
    const minutes = Math.floor(remainingMs / (1000 * 60));
    if (durationMs >= 24 * 60 * 60 * 1000) {
      // If duration is 24 hours or more, return days
      const days = Math.floor(durationMs / (24 * 60 * 60 * 1000));
      return `${days} days`;
    } else {
      // If duration is less than 24 hours, return hours and minutes
      return `${hours} hrs ${minutes} mins`;
    }
  }

  async getJobListSummary(
    user: any,
    page: any,
    pageSize: any,
    status: any,
    getJobById: any
  ): Promise<any> {
    const userRepo = await this.database.getRepository(User);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const repo = await this.database.getRepository(Job);
    const guardJobRepo = await this.database.getRepository(JobGuards);
    const checkListRepo = await this.database.getRepository(checkList);
    const jobDayRepository = await this.database.getRepository(JobDay);
    const userId = getJobById ? getJobById : user.id;
    const userResponse = await userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (userResponse.userType === 'GUARD') {
      let query = guardJobRepo
        .createQueryBuilder('JobGuards')
        .innerJoinAndSelect('JobGuards.job', 'job')
        .where('JobGuards.userId = :userId', { userId: userId })
        .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
        .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
        .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', { isJobDeletedByAdmin: false })
        .orderBy('job.createdOn', 'DESC');

      if (status !== undefined) {
        if (status === 'myjob') {
          query = query.andWhere('JobGuards.jobStatus IN (:jobStatusList)', {
            jobStatusList: [1, 3],
          });
        } else {
          query = query.andWhere('JobGuards.jobStatus = :jobStatus', {
            jobStatus: status,
          });
        }
      }
      const [results, totalCount] = await query
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

      // Map jobStatus to corresponding states (accepted, rejected, pending) and fetch interest names
      const interestNamesPromises = results.map(async (jobInterest) => {
        let status = 'PENDING';

        if (jobInterest.jobStatus === 1) {
          status = 'ACCEPTED';
        } else if (jobInterest.jobStatus === 2) {
          status = 'REJECTED';
        } else if (jobInterest.jobStatus === 3) {
          status = 'COMPLETED';
        }
        let User = await userProfileRepo.findOne({
          where: {
            userId: jobInterest.job.userId,
          },
        });
        let createdUser = this.setName(User.firstName, User.lastName);
        let profilePhotoFileName = User.profilePhotoFileName;
        const guardCoverage = await this.getJobInterestDetails(
          jobInterest.job.guardCoverageId
        );
        // const guardService = await this.getJobInterestDetails(
        //   jobInterest.job.guardServiceId
        // );
        let guardServiceArrayValue = await this.getJobServiceTypeDetails(jobInterest.job.id, 2);
        let guardServiceArray = guardServiceArrayValue.split(',');
        let guardService
        if (guardServiceArray.length > 1) {

          guardService = guardServiceArray[0].trim() + ',...';
        }
        else {
          guardService = guardServiceArray[0].trim();
        }
        const guardSecurityService = await this.getJobInterestDetails(
          jobInterest.job.guardSecurityServiceId
        );

        let totalhrs = await guardJobRepo.findOne({
          where: { jobId: jobInterest.job.id },
        });
        let totalJobHours = totalhrs.totalJobHours;

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

        const checkLists = await checkListRepo.find({
          where: {
            jobId: jobInterest.jobId,
          },
        });

        let startTimeCheck = await jobDayRepository.findOne({
          where: { jobId: jobInterest.job.id },
        });

        let startTime = startTimeCheck.startTime;
        let endTime = startTimeCheck.endTime;

        return {
          ...jobInterest,
          status,
          guardCoverage,
          guardService,
          duration: timeString,
          createdUser,
          profilePhotoFileName,
          // profileImageUrl,
          checkLists,
          startTime,
          endTime,
          guardSecurityService
        };
      });

      const responseWithInterestNames = await Promise.all(
        interestNamesPromises
      );

      return {
        results: responseWithInterestNames,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    } else {
      let query = await guardJobRepo
        .createQueryBuilder('jobGuards')
        .innerJoinAndSelect('jobGuards.job', 'job')
        .where('job.userId = :userId', { userId: userId })
        .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
        .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
        .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', { isJobDeletedByAdmin: false })
        .groupBy('jobGuards.jobId')
        .orderBy('job.createdOn', 'DESC');

      if (status !== undefined) {
        // if (status == "myjob") {
        //   query = query.andWhere('JobGuards.jobStatus NOT IN (:jobStatusList)', {
        //     jobStatusList: [1, 3],
        //   });
        // } else {
        query = query.andWhere('jobGuards.jobStatus = :jobStatus', {
          jobStatus: status,
        });
        // }
      }

      const [results, totalCount] = await query
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();
      let paginationQuery = await guardJobRepo
        .createQueryBuilder('jobGuards')
        .innerJoinAndSelect('jobGuards.job', 'job')
        .where('job.userId = :userId', { userId: userId })
        .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
        .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
        .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', { isJobDeletedByAdmin: false })
        .groupBy('jobGuards.jobId')
        .orderBy('job.createdOn', 'DESC');

      if (status !== undefined) {
        // if (status == "myjob") {
        //   query = query.andWhere('JobGuards.jobStatus NOT IN (:jobStatusList)', {
        //     jobStatusList: [1, 3],
        //   });
        // } else {
        paginationQuery = paginationQuery.andWhere(
          'jobGuards.jobStatus = :jobStatus',
          {
            jobStatus: status,
          }
        );
        // }
      }

      const [resultsize, totalCounts] = await paginationQuery.getManyAndCount();

      const groupedResultsCounts = await Object.keys(resultsize).length;

      // Map jobStatus to corresponding states (accepted, rejected, pending) and fetch interest names
      const interestNamesPromises = results.map(async (jobInterest) => {
        const [guardAccept, acceptedCount] = await guardJobRepo.findAndCount({
          where: { jobId: jobInterest.job.id, jobStatus: 1 },
        });
        const [guardPending, PendingCount] = await guardJobRepo.findAndCount({
          where: { jobId: jobInterest.job.id, jobStatus: 0 },
        });
        const [guardComplete, completedCount] = await guardJobRepo.findAndCount({
          where: { jobId: jobInterest.job.id, jobStatus: 3 },
        });
        const [guardReject, rejectedCount] = await guardJobRepo.findAndCount({
          where: { jobId: jobInterest.job.id, jobStatus: 2 },
        });
        const [guardCancell, cancelledCount] = await guardJobRepo.findAndCount({
          where: { jobId: jobInterest.job.id, jobStatus: 4 },
        });
        let status = 'ACCEPTED';
        if (PendingCount != 0 && PendingCount > 0) {
          status = 'PENDING';
        }
        if (acceptedCount == jobInterest.job.noOfGuards) {
          status = 'ACCEPTED';
        } else if (completedCount == jobInterest.job.noOfGuards) {
          status = 'COMPLETED';
        } else if (rejectedCount > 0) {
          status = 'REJECTED';
        }
        if (cancelledCount > 0) {
          status = 'CANCELLED';
        }
        // let status = 'PENDING';

        // if (jobInterest.jobStatus === 1) {
        //   status = 'ACCEPTED';
        // } else if (jobInterest.jobStatus === 2) {
        //   status = 'REJECTED';
        // } else if (jobInterest.jobStatus === 3) {
        //   status = 'COMPLETED';
        // } else if (jobInterest.jobStatus === 4) {
        //   status = 'CANCELLED';
        // }
        let User = await userProfileRepo.findOne({
          where: {
            userId: jobInterest.userId,
          },
        });
        let assignedUser = this.setName(User.firstName, User.lastName);
        let profilePhotoFileName = User.profilePhotoFileName;
        const guardCoverage = await this.getJobInterestDetails(
          jobInterest.job.guardCoverageId
        );
        // const guardService = await this.getJobInterestDetails(
        //   jobInterest.job.guardServiceId
        // );
        let guardServiceArrayValue = await this.getJobServiceTypeDetails(
          jobInterest.job.id,
          2
        );
        let guardServiceArray = guardServiceArrayValue.split(',');
        let guardService;
        if (guardServiceArray.length > 1) {
          guardService = guardServiceArray[0].trim() + ',...';
        } else {
          guardService = guardServiceArray[0].trim();
        }
        const guardSecurityService = await this.getJobInterestDetails(
          jobInterest.job.guardSecurityServiceId
        );
        // const duration = await this.calculateDuration(
        //   jobInterest.job.startDate,
        //   jobInterest.job.endDate
        // );
        let totalhrs = await guardJobRepo.findOne({
          where: { jobId: jobInterest.job.id },
        });
        let totalJobHours = totalhrs.totalJobHours;

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
        const checkLists = await checkListRepo.find({
          where: {
            jobId: jobInterest.jobId,
          },
        });
        let startTimeCheck = await jobDayRepository.findOne({
          where: { jobId: jobInterest.job.id },
        });

        let startTime = startTimeCheck.startTime;
        return {
          ...jobInterest,
          status,
          guardCoverage,
          guardService,
          duration: timeString,
          assignedUser,
          profilePhotoFileName,
          // profileImageUrl,
          checkLists,
          startTime,
          guardSecurityService,
        };
      });

      const responseWithInterestNames = await Promise.all(
        interestNamesPromises
      );

      return {
        results: responseWithInterestNames,
        totalCount: groupedResultsCounts,
        totalPages: Math.ceil(groupedResultsCounts / pageSize),
        currentPage: page,
      };
    }
  }

  async getJobDetailsById(user: any, jobId: any): Promise<any> {
    const userRepo = await this.database.getRepository(User);
    const repo = await this.database.getRepository(Job);
    const guardJobRepo = await this.database.getRepository(JobGuards);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const checkListRepo = await this.database.getRepository(checkList);
    const userId = user.id;

    const userResponse = await userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (userResponse.userType === 'GUARD') {
      let query = guardJobRepo
        .createQueryBuilder('jobGuards')
        .innerJoinAndSelect('jobGuards.job', 'job')
        .where('jobGuards.jobId = :jobId', { jobId: jobId })
        .andWhere('jobGuards.userId = :userId', { userId: userId })
        .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
        .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true });
      const response = await query.getOne();
      let status = 'PENDING';
      if (response.jobStatus === 1) {
        status = 'ACCEPTED';
      } else if (response.jobStatus === 2) {
        status = 'REJECTED';
      } else if (response.jobStatus === 3) {
        status = 'COMPLETED';
      }
      let User = await userProfileRepo.findOne({
        where: {
          userId: response.job.userId,
        },
      });
      let createdUser = this.setName(User.firstName, User.lastName);
      const guardCoverage = await this.getJobInterestDetails(
        response.job.guardCoverageId
      );
      // const guardService = await this.getJobInterestDetails(
      //   response.job.guardServiceId
      // );
      let guardServiceArrayValue = await this.getJobServiceTypeDetails(
        response.job.id,
        2
      );
      let guardServiceArray = guardServiceArrayValue.split(',');
      let guardService;
      if (guardServiceArray.length > 1) {
        guardService = guardServiceArray[0].trim() + ',...';
      } else {
        guardService = guardServiceArray[0].trim();
      }
      const guardSecurityService = await this.getJobInterestDetails(
        response.job.guardSecurityServiceId
      );
      // const duration = await this.calculateDuration(
      //   response.job.startDate,
      //   response.job.endDate
      // );
      let totalhrs = await guardJobRepo.findOne({
        where: { jobId: response.job.id },
      });
      let totalJobHours = totalhrs.totalJobHours;

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
      const checkLists = await checkListRepo.find({
        where: {
          jobId: jobId,
        },
      });
      return {
        ...response,
        status,
        guardCoverage,
        guardService,
        duration: timeString,
        checkLists,
        createdUser,
        guardSecurityService,
      };
    }
    if (userResponse.userType === 'CUSTOMER') {
      let query = repo
        .createQueryBuilder('job')
        .where('job.id = :id', { id: jobId });
      const response = await query.getOne();
      const guardCoverage = await this.getJobInterestDetails(
        response.guardCoverageId
      );
      const guardService = await this.getJobInterestDetails(
        response.guardServiceId
      );
      const guardSecurityService = await this.getJobInterestDetails(
        response.guardSecurityServiceId
      );
      // const duration = await this.calculateDuration(
      //   response.startDate,
      //   response.endDate
      // );

      let totalhrs = await guardJobRepo.findOne({
        where: { jobId: response.id },
      });
      let totalJobHours = totalhrs.totalJobHours;

      // Extracting the hours and minutes from the decimal representation
      let hours = Math.floor(totalJobHours); // Extracting the whole hours
      let minutes = Math.round((totalJobHours - hours) * 60); // Converting the remaining decimal to minutes

      // If the minutes equal 60, adjust the hours and set the minutes to zero
      if (minutes === 60) {
        hours++;
        minutes = 0;
      }

      // Creating a string representation in hours and minutes
      let timeString = `${hours} hrs `;
      if (minutes > 0) {
        timeString += ` ${minutes} min`;
      }

      const checkLists = await checkListRepo.find({
        where: {
          jobId: jobId,
        },
      });
      return {
        ...response,
        guardCoverage,
        guardService,
        duration: timeString,
        checkLists,
        guardSecurityService,
      };
    }
  }

  async updateGuardJobStatus(
    user: any,
    updateGuardJobStatusPayload: any
  ): Promise<any> {
    const userId = user.id;
    const jobRepo = await this.database.getRepository(Job);
    const jobGuardRepo = await this.database.getRepository(JobGuards);
    const guardNameRepo = await this.database.getRepository(UserProfile);
    const userRepo = await this.database.getRepository(User);
    const completedCheckListRepo = await this.database.getRepository(
      completedCheckList
    );
    const checkListRepo = await this.database.getRepository(checkList);
    // const guardCompanyId = await jobGuardRepo.findOne({
    //   where: { jobId: updateGuardJobStatusPayload.jobId },
    // });
    const guardName = await guardNameRepo.findOne({
      where: { userId: userId },
    });
    // const userType = await userRepo.findOne({
    //   where: { userId: userId },
    // });

    const fullName = this.setName(guardName.firstName, guardName.lastName);
    // const teamId = guardCompanyId?.teamId || '';
    let paymentStatus = false;
    const jobGuardResponse = await jobGuardRepo.findAndCount({
      where: { jobId: updateGuardJobStatusPayload.jobId, jobStatus: 1 },
    });
    const jobResponse = await jobRepo.findOne({
      where: { id: updateGuardJobStatusPayload.jobId },
    });
    const [job, jobCount] = jobGuardResponse;

    if (updateGuardJobStatusPayload.status == 3) {
      const checkLists = await checkListRepo.find({
        where: {
          jobId: updateGuardJobStatusPayload.jobId,
        },
        select: ['id'],
      });
      // Extract the IDs from checkLists
      const checkListIds = checkLists.map((checkList) => checkList.id);

      const allMatch = await Promise.all(checkListIds);
      const completedCheckLists = await completedCheckListRepo.find({
        where: {
          checkListId: In(allMatch),
          userId: userId,
        },
      });
      if (completedCheckLists.length != checkLists.length) {
        return {
          data: '',
          message:
            'Please complete  all the checklist before completing the job.',
        };
      }
    }
    if (
      jobCount === 0 ||
      jobResponse.jobCost == '' ||
      jobResponse.jobCost == null
    ) {
      paymentStatus = true;
    }
    let response: any;
    if (updateGuardJobStatusPayload.status == 4) {
      console.log('status4');

      response = await jobGuardRepo.update(
        {
          jobId: updateGuardJobStatusPayload.jobId,
        },
        {
          jobStatus: updateGuardJobStatusPayload.status,
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
          createdBy: this.globalConstants.SYS_ADMIN_GUID,
          updatedOn: new Date(),
          createdOn: new Date(),
        }
      );
    } else {
      response = await jobGuardRepo.update(
        {
          userId,
          jobId: updateGuardJobStatusPayload.jobId,
        },
        {
          jobStatus: updateGuardJobStatusPayload.status,
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
          createdBy: this.globalConstants.SYS_ADMIN_GUID,
          jobCompletedDate: new Date(),
          updatedOn: new Date(),
          createdOn: new Date(),
        }
      );
    }

    const jobStatusResponse = await jobRepo.findOne({
      where: { id: updateGuardJobStatusPayload.jobId },
    });
    response.name = fullName;
    response.paymentStatus = paymentStatus;
    response.jobStatusResponse = jobStatusResponse;
    return response;

    //     if (updateGuardJobStatusPayload.status == 2) {
    //       const rawQuery = `
    //       SELECT u.*,up2.*,s.name as state_name
    // FROM user u
    // join user_profile up2 on u.id =up2.user_id
    // join state s on up2.state_id =s.id
    // WHERE u.id IN (
    //     SELECT
    //         uad.user_id
    //     FROM job j
    //     LEFT JOIN job_day jd ON j.id = jd.job_id
    //     LEFT JOIN user_availability_day uad ON jd.day = uad.weekday
    //     LEFT JOIN user_availability_date uad2 ON uad2.user_availability_id = uad.id
    //     LEFT JOIN user u ON u.id = uad.user_id
    //     LEFT JOIN user_profile up ON up.user_id = u.id
    //     LEFT JOIN guard_job_interest gji ON j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id
    //     LEFT JOIN guard_job_interest gji1 ON j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id
    //     JOIN team_members tm ON tm.user_id = uad.user_id
    //     JOIN team t ON t.id = tm.team_id
    //     join job_guards jg on jg.user_id=tm.user_id
    //     join job_guards jg2 on jg2.job_id='${updateGuardJobStatusPayload.jobId}'
    //     WHERE j.id = '${updateGuardJobStatusPayload.jobId}' and t.id='${teamId}' and jg.user_id !=uad.user_id
    //     AND uad.user_id IS NOT NULL
    //     AND tm.user_id IS NOT NULL
    //     AND t.id IS NOT NULL
    //  AND TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR)) BETWEEN
    //                 TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR)) AND
    //                 TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR))
    //             AND TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR)) BETWEEN
    //                 TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR)) AND
    //                 TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR))
    //     GROUP BY uad.user_id
    //     HAVING COUNT(DISTINCT uad.weekday) = (
    //         SELECT COUNT(DISTINCT jd_sub.day)
    //         FROM job_day jd_sub
    //         WHERE jd_sub.job_id = '${updateGuardJobStatusPayload.jobId}'
    //     )
    // )AND CONCAT(up2.first_name, ' ', up2.last_name) LIKE '%%'
    //     `;

    //       const response: any = await (
    //         await this.database.createQueryRunner()
    //       ).manager.query(rawQuery);
    //       response.paymentStatus = paymentStatus;
    //       return response;
    //     }
  }

  private setName(firstName: any, lastName: any) {
    let fullName = '-';

    if (firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    } else if (firstName) {
      fullName = firstName;
    } else if (lastName) {
      fullName = lastName;
    }

    return fullName;
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
}
