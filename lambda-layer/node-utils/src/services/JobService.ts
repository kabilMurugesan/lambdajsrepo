import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IJobRepository } from '../interfaces/repo/IJobRepository';
import {
  ConfirmJobRequest,
  EditJobRequest,
  SaveJobRequest,
  guardPunchTimeRequest,
} from '../dto/JobDTO';
import { IJobService } from '../interfaces/services/IJobService';
import { Job } from '../entities/Job';
import moment from 'moment-timezone';
import { GlobalConstants } from '../constants/constants';
// import { find } from 'geo-tz';
import { SaveJobGuardsRequest } from '../dto/AddingJobGuards';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
import { NotFoundException } from '../shared/errors/all.exceptions';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
// import { find } from 'geo-tz';

@injectable()
export class JobService implements IJobService {
  constructor(
    @inject(TYPES.IJobRepository)
    private readonly JobRepository: IJobRepository,
    @inject(TYPES.IPaymentAccountsRepository)
    private readonly paymentAccountsRepository: IPaymentAccountsRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.INotificationRepository)
    private readonly NotificationRepository: INotificationRepository,
    @inject(TYPES.IEmailService)
    private readonly emailService: IEmailService,
    @inject(TYPES.IPushService)
    private readonly pushService: IPushService,
    private readonly globalConstants = GlobalConstants
  ) { }

  async saveJob(event: any, saveJobPayload: SaveJobRequest): Promise<Job> {
    const user = await this.authService.decodeJwt(event);
    const saveJob: Job = await this.JobRepository.saveJob(user, saveJobPayload);
    return saveJob;
  }

  async editJob(event: any, editJobPayload: EditJobRequest): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const saveJob: Job = await this.JobRepository.editJob(user, editJobPayload);
    return saveJob;
  }

  async getJobSummary(jobId: any): Promise<Job[]> {
    return await this.JobRepository.getJobSummary(jobId);
  }

  async deleteJob(jobId: any, status: any): Promise<any> {
    return await this.JobRepository.deleteJob(jobId, status);
  }

  async saveJobGuard(
    event: any,
    saveJobPayload: SaveJobGuardsRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const saveJobGuard: any = await this.JobRepository.saveJobGuard(
      user,
      saveJobPayload
    );
    return saveJobGuard;
  }

  async guardPunchTime(
    event: any,
    guardPunchTimeRequest: guardPunchTimeRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const saveJobGuard: any = await this.JobRepository.guardPunchTime(
      user,
      guardPunchTimeRequest
    );
    if (saveJobGuard.data = "" || saveJobGuard.message) {
      return saveJobGuard
    }
    console.log(saveJobGuard);

    if (saveJobGuard.isAlreadyPunched == false || saveJobGuard.isAlreadyPunched == "") {
      await this.sendJobStatusNotification(saveJobGuard);
    }
    if (saveJobGuard.isAlreadyPunched != false || saveJobGuard.isGuardWithInRadius == false) {
      await this.sendJobStatusNotification(saveJobGuard);
    }

    return saveJobGuard;
  }

  private async sendJobStatusNotification(saveJobGuard: any) {

    let pushStatus = 'Guard Arrived!!';
    let message = `${saveJobGuard.guardName} has checked in your job #${saveJobGuard.jobResponse.jobRefId} as he reached out the job venue`

    if (saveJobGuard.isGuardWithInRadius == false && saveJobGuard.isAlreadyPunched == true) {
      pushStatus = 'Attention Please!!'
      message = `${saveJobGuard.guardName} is not at the job venue now.Watch out and check on the same`
    }

    let notificationDetails =
      await this.NotificationRepository.saveNotification(
        saveJobGuard.jobResponse.userId,
        'PUSH',
        `FIDO - Job ${pushStatus}`,
        message,
        'JOB_DETAIL',
        saveJobGuard.jobResponse.id
      );
    let returnMsg = await this.pushService.sendPush(
      `FIDO - Job ${pushStatus}`,
      message,
      [saveJobGuard.jobResponse.userId],
      { jobId: saveJobGuard.jobResponse.jobRefId },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }

  async confirmJob(
    event: any,
    confirmJobPayload: ConfirmJobRequest
  ): Promise<Job> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);

    if (!userStripeDetails) {
      throw new NotFoundException(
        'Stripe customer account not created for this user!'
      );
    }
    const customerDefaultPaymentDetails =
      await this.JobRepository.getCustomerPaymentDetails(userId);
    if (
      !customerDefaultPaymentDetails ||
      customerDefaultPaymentDetails.length === 0
    ) {
      throw new NotFoundException(
        'Stripe payment method not created for this user!'
      );
    }

    const jobDetails = await this.JobRepository.getJobGuards(confirmJobPayload);
    if (jobDetails && jobDetails.guards && jobDetails.guards.length > 0) {
      const { jobName, jobTime, jobVenue } = this.extractJobDetails(jobDetails);

      await Promise.all(
        jobDetails.guards.map((jobGuard: any) =>
          Promise.all([
            this.sendGuardNotification(
              jobGuard,
              jobName,
              jobTime,
              jobVenue,
              jobDetails.id,
              jobDetails.jobRefId,
              jobDetails.createdName
            ),
          ])
        )
      );
      // await this.sendAdminNotification(jobName, jobDetails.id);

      delete jobDetails.guards;
      return jobDetails;
    }
    return jobDetails;
  }
  private extractJobDetails(jobDetails: any) {
    let jobName = `${jobDetails.jobName}`;
    if (jobDetails.bookingReason) {
      jobName = `${jobName}(${jobDetails.bookingReason})`;
    }
    const jobStartDate = this.formatDate(jobDetails.startDate);
    const jobEndDate = this.formatDate(jobDetails.endDate);
    // const timezoneName = this.getTimezoneName(
    //   jobDetails.jobVenueLocationCoordinates
    // );
    const jobTime = this.generateJobTime(
      jobDetails.startDate,
      jobDetails.endDate
    );
    const jobVenue = jobDetails.jobVenue;

    return {
      jobName,
      jobStartDate,
      jobEndDate,
      timezoneName: jobDetails.timezoneName,
      jobTime,
      jobVenue,
    };
  }

  private formatDate(dateString: string) {
    return moment(dateString, 'YYYY-MM-DD HH:mm:ss').format(
      'MM/DD/YYYY h:mm A'
    );
  }

  // private getTimezoneName(coordinates: string) {
  //   const [latitude, longitude] = coordinates.split(',').map(Number);
  //   const timezoneId = find(latitude, longitude);
  //   return moment.tz(timezoneId[0]).zoneAbbr();
  // }

  // private generateJobTime(
  //   startDate: string,
  //   endDate: string,
  //   timezoneName: string
  // ) {
  //   if (
  //     moment(startDate, 'YYYY-MM-DD HH:mm:ss').isSame(
  //       moment(endDate, 'YYYY-MM-DD HH:mm:ss'),
  //       'day'
  //     )
  //   ) {
  //     return `${moment(startDate, 'YYYY-MM-DD HH:mm:ss').format(
  //       'MM/DD/YYYY h:mm A'
  //     )} - ${moment(endDate, 'YYYY-MM-DD HH:mm:ss').format(
  //       'h:mm A'
  //     )} (${timezoneName})`;
  //   } else {
  //     return `${moment(startDate, 'YYYY-MM-DD HH:mm:ss').format(
  //       'MM/DD/YYYY h:mm A'
  //     )}(${timezoneName}) - ${moment(endDate, 'YYYY-MM-DD HH:mm:ss').format(
  //       'MM/DD/YYYY h:mm A'
  //     )}(${timezoneName})`;
  //   }
  // }

  private generateJobTime(startDate: string, endDate: string) {
    if (moment(startDate).isSame(moment(endDate), 'day')) {
      return `${moment(startDate).format('MM/DD/YYYY')}`;
    } else {
      return `${moment(startDate).format('MM/DD/YYYY')} - ${moment(
        endDate
      ).format('MM/DD/YYYY')}`;
    }
  }

  private async sendGuardNotification(
    jobGuard: any,
    jobName: string,
    jobTime: string,
    jobVenue: string,
    jobId: string,
    jobRefId: any,
    createdName: any
  ) {
    const receiverName = jobGuard.first_name + ' ' + jobGuard.last_name;
    const receiverEmail = jobGuard.email;

    let pushStatus = 'Job Received!!';
    let message = `${createdName} has assigned a job #${jobRefId} to yourself.Are you interested in accepting it?`
    let adminMessage = `${createdName} has assigned a job #${jobRefId} to ${receiverName}`
    await this.sendAdminNotification(jobName, jobId, adminMessage, pushStatus);
    await this.emailService.sendEmail(
      this.globalConstants.EMAIL_TEMPLATE.GUARD_NEW_JOB_NOTIFICATION,
      receiverEmail,
      { receiverName, jobName, jobTime, jobVenue }
    );
    let notificationDetails =
      await this.NotificationRepository.saveNotification(
        jobGuard.user_id,
        'PUSH',
        pushStatus,
        message,
        'JOB_DETAIL',
        jobId
      );
    let returnMsg = await this.pushService.sendPush(
      pushStatus,
      message,
      [jobGuard.user_id],
      { jobRefId },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }

  private async sendAdminNotification(jobName: string, jobId: string, message: string, pushStatus: string) {
    // Send notification to Admin
    let notificationDetails =
      await this.NotificationRepository.saveNotification(
        this.globalConstants.ADMIN_USER_ID,
        'PUSH',
        pushStatus,
        message,
        'JOB_DETAIL',
        jobId
      );
    let returnMsg = await this.pushService.sendPush(
      pushStatus,
      message,
      [this.globalConstants.ADMIN_USER_ID],
      { jobId },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }
}
