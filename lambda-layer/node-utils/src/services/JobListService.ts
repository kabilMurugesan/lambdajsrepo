import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IJobListService } from '../interfaces/services/IJobListService';
import { IJobListRepository } from '../interfaces/repo/IJobListRepository';
// import { GlobalConstants } from '../constants/constants';
// import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
import { NotFoundException } from '../shared/errors/all.exceptions';
import { IJobRepository } from '../interfaces/repo/IJobRepository';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
import { GlobalConstants } from '../constants/constants';
import { IUserProfileRepository } from '../interfaces/repo/IUserProfileRepository';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { JobGuards } from '../entities/JobGuards';

@injectable()
export class JobListService implements IJobListService {
  constructor(
    @inject(TYPES.IDatabaseService)
    private readonly database: IDatabaseService,
    @inject(TYPES.IJobRepository)
    private readonly JobRepository: IJobRepository,
    @inject(TYPES.IJobListRepository)
    private readonly JobListRepository: IJobListRepository,
    @inject(TYPES.IUserProfileRepository)
    private readonly userProfileRepository: IUserProfileRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IPaymentAccountsRepository)
    private readonly paymentAccountsRepository: IPaymentAccountsRepository,
    @inject(TYPES.IStripeService)
    private readonly stripeService: IStripeService,
    @inject(TYPES.INotificationRepository)
    private readonly NotificationRepository: INotificationRepository,
    @inject(TYPES.IEmailService)
    private readonly emailService: IEmailService,
    @inject(TYPES.IPushService)
    private readonly pushService: IPushService,
    private readonly globalConstants = GlobalConstants
  ) { }

  async getJobListSummary(
    event: any,
    page: any,
    pageSize: any,
    status: any,
    getJobById: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    return await this.JobListRepository.getJobListSummary(
      user,
      page,
      pageSize,
      status,
      getJobById
    );
  }
  async getJobDetailsById(event: any, jobId: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    return await this.JobListRepository.getJobDetailsById(user, jobId);
  }
  private async updatePaymentStatus(
    paymentDtls: any,
    userId: any,
    jobId: any,
    paymentCharge: any,
    jobDetails: any,
    paymentStatus: any
  ): Promise<any> {
    const updatePaymentStatus = await this.JobRepository.updatePaymentStatus(
      paymentDtls,
      userId,
      jobId
    );

    if (updatePaymentStatus) {
      const payments = await this.paymentAccountsRepository.getAllPayments();
      const transactionId =
        payments.length > 0 ? parseInt(payments[0].transactionId) + 1 : 1;
      const paymentData = {
        jobId,
        transactionId,
        stripeChargeId: paymentCharge.id,
        amount: jobDetails.totalCost,
        paymentType: paymentCharge.payment_method_details.type,
        userId,
        txnType: 'charge',
        paymentMethod:
          paymentCharge.payment_method_details.type === 'card'
            ? paymentCharge.payment_method
            : paymentCharge.source.id,
        last4: paymentDtls.last4,
        brandBank:
          paymentCharge.payment_method_details.type === 'card'
            ? paymentCharge.source.brand
            : paymentCharge.source.bank_name,
        paymentStatus,
        createdOn: new Date(),
        updatedOn: new Date(),
        updatedBy: userId,
        createdBy: userId,
      };

      const createPaymentStatus = await this.JobRepository.savePayment(
        paymentData
      );
      if (createPaymentStatus) {
        const response: any = {
          updated: true,
          status: paymentCharge.status,
          message: 'succeeded',
        };
        return response;
      }
    }
  }

  async createJobChargeFromCustomer(jobDetails: any) {
    const userId = jobDetails.userId;
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

    const amountInCents = Math.round(parseFloat(jobDetails.totalCost) * 100);

    const paymentCharge = await this.stripeService.createCharge({
      amount: amountInCents,
      currency: 'usd',
      description: `Payment for ${jobDetails.jobName}(${jobDetails.bookingReason})`,
      customer: userStripeDetails.stripeCustomerId,
      source: customerDefaultPaymentDetails.stripeAccountId,
      metadata: { jobId: jobDetails.id, userId: jobDetails.userId },
    });

    console.log('paymentCharge', paymentCharge);

    if (
      paymentCharge &&
      ['succeeded', 'pending'].includes(paymentCharge.status)
    ) {
      const paymentStatus = 1;
      const paymentDtls = {
        paymentStatus,
        paymentChargeStatus: paymentCharge.status,
        paymentChargeId: paymentCharge.id,
        balanceTransactionId: paymentCharge.balance_transaction,
        paymentType: paymentCharge.payment_method_details.type,
        captureStatus: paymentCharge.captured,
        paidStatus: paymentCharge.paid,
        stripeChargeId: paymentCharge.id,
        transactionDate: new Date(),
        last4:
          paymentCharge.payment_method_details.type === 'card'
            ? paymentCharge.payment_method_details.card.last4
            : paymentCharge.source.last4,
        paymentSource:
          paymentCharge.payment_method_details.type === 'card'
            ? paymentCharge.payment_method_details.card.funding
            : paymentCharge.source.object,
        paymentMethod:
          paymentCharge.payment_method_details.type === 'card'
            ? paymentCharge.payment_method
            : paymentCharge.source.id,
      };

      const paymentResponse = await this.updatePaymentStatus(
        paymentDtls,
        userId,
        jobDetails.id,
        paymentCharge,
        jobDetails,
        paymentStatus
      );
      const customerId = jobDetails.userId;
      console.log(customerId);
      const userDetails = await this.userProfileRepository.getUserDetails(
        customerId
      );

      console.log('userDetails', userDetails);

      await this.sendNotificationToCustomer(userDetails, jobDetails);
      return paymentResponse;
      //send push and email notification to customer, that payment is debited from his  account
    } else {
      throw new NotFoundException('Stripe payment failed for this user!');
    }
  }

  private async sendNotificationToCustomer(userDetails: any, jobDetails: any) {
    const jobAmt = parseFloat(jobDetails.totalCost).toFixed(2);
    const jobRefId = jobDetails.jobRefId;
    const receiverName = userDetails.firstName + ' ' + userDetails.lastName;
    console.log(receiverName);
    let message = `Amount has been charged for the job #${jobRefId}`;
    const receiverEmail = userDetails.email;
    console.log(receiverEmail);
    await this.emailService.sendEmail(
      this.globalConstants.EMAIL_TEMPLATE.CUSTOMER_CHARGE_NOTIFICATION,
      receiverEmail,
      { receiverName, jobAmt, jobRefId }
    );
    let notificationDetails =
      await this.NotificationRepository.saveNotification(
        userDetails.userId,
        'PUSH',
        'FIDO - Amount Charged',
        message,
        'JOB_DETAIL',
        jobDetails.id
      );
    let returnMsg = await this.pushService.sendPush(
      'FIDO - Amount Charged',
      message,
      [userDetails.userId],
      { jobId: jobDetails.id },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );

    // Send notification to Admin
    notificationDetails = await this.NotificationRepository.saveNotification(
      this.globalConstants.ADMIN_USER_ID,
      'PUSH',
      'FIDO - Amount Charged',
      message,
      'JOB_DETAIL',
      jobDetails.id
    );
    returnMsg = await this.pushService.sendPush(
      'FIDO - Amount Charged',
      message,
      [this.globalConstants.ADMIN_USER_ID],
      { jobId: jobDetails.id },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }

  async updatePaymentWebhookDetails(webhookResponse: any): Promise<any> {
    if (webhookResponse && webhookResponse !== null && webhookResponse !== '') {
      const userId = webhookResponse.data.object.metadata.userId;
      const jobId = webhookResponse.data.object.metadata.jobId;

      const paymentDtls = {
        paymentChargeStatus: webhookResponse.data.object.status,
        paymentChargeId: webhookResponse.data.object.id,
        captureStatus: webhookResponse.data.object.captured,
        paidStatus: webhookResponse.data.object.paid,
        stripeChargeId: webhookResponse.data.object.id,
        transactionDate: new Date(),
      };
      await this.JobRepository.updatePaymentStatus(paymentDtls, userId, jobId);
    }
  }

  async checkConnectedAccount(stripeAccountId: string): Promise<any> {
    const getConnectedAccDtls = await this.stripeService.retrieveAccountDetails(
      stripeAccountId
    );
    if (
      getConnectedAccDtls &&
      (getConnectedAccDtls.payouts_enabled === false ||
        getConnectedAccDtls.capabilities.transfers === 'inactive' ||
        getConnectedAccDtls.capabilities.card_payments === 'inactive')
    ) {
      return false;
    }
    if (getConnectedAccDtls && getConnectedAccDtls.payouts_enabled === true) {
      const bankAccList = await this.stripeService.listExternalAccounts(
        stripeAccountId,
        {
          object: 'bank_account',
        }
      );

      if (bankAccList && bankAccList.data.length > 0) {
        return true;
      }

      const cardList = await this.stripeService.listExternalAccounts(
        stripeAccountId,
        {
          object: 'card',
        }
      );
      if (cardList && cardList.data.length > 0) {
        return true;
      }
    }

    return false;
  }

  async updateGuardJobStatus(
    event: any,
    updateGuardJobStatusPayload: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    let jobId = updateGuardJobStatusPayload.jobId
    const jobDetails = await this.JobRepository.getJobDetails(
      updateGuardJobStatusPayload.jobId
    );

    if (
      updateGuardJobStatusPayload.status === 1 &&
      jobDetails.paymentStatus === 0
    ) {
      const userStripeDetails =
        await this.paymentAccountsRepository.getUserStripeDetails(userId);

      if (!userStripeDetails || userStripeDetails.stripeAccountId === null) {
        throw new NotFoundException(
          'Stripe account not created for this user!'
        );
      }

      const isAccountCreationCompleted = await this.checkConnectedAccount(
        userStripeDetails.stripeAccountId
      );

      if (!isAccountCreationCompleted) {
        throw new NotFoundException(
          'Stripe account not created/verified for this user!'
        );
      }
      await this.createJobChargeFromCustomer(jobDetails);
    }
    let jobGuards: any
    if (updateGuardJobStatusPayload.status === 4) {
      const jobGuardsRepo = await this.database.getRepository(JobGuards);

      jobGuards = await jobGuardsRepo
        .createQueryBuilder('jobGuards')
        .select('jobGuards.userId')
        .where('jobGuards.jobId = :jobId', { jobId })
        .andWhere('jobGuards.jobStatus=:jobStatus', { jobStatus: 1 })
        .getRawMany();
    }
    const updateJob = await this.JobListRepository.updateGuardJobStatus(
      user,
      updateGuardJobStatusPayload
    );
    if (updateJob.data = "" || updateJob.message) {
      return updateJob
    }
    let guardUserId = ""

    if (updateGuardJobStatusPayload.status != 4) {
      await this.sendJobStatusNotification(
        updateGuardJobStatusPayload,
        updateJob,
        guardUserId
      );
    } else {
      if (jobGuards.length > 0) {
        const insertPromises =
          jobGuards?.map(async (user: any) => {
            let guardUserId = user.jobGuards_user_id;
            await this.sendJobStatusNotification(
              updateGuardJobStatusPayload,
              updateJob,
              guardUserId
            );
          });
        await Promise.all(insertPromises);
      }

    }
    // if (
    //   (updateGuardJobStatusPayload.status =
    //     1 && updateJob.paymentStatus === true)
    // ) {
    //   const jobDetails = await this.jobListService.getJobDetailsById(
    //     user,
    //     updateGuardJobStatusPayload.jobId
    //   );
    //   const userId = jobDetails.job.userId;
    //   const userStripeDetails =
    //     await this.paymentAccountsRepository.getUserStripeDetails(userId);

    //   if (!userStripeDetails || userStripeDetails.stripeAccountId === null) {
    //     throw new NotFoundException(
    //       'Stripe account not created for this user!'
    //     );
    //   }

    //   if (jobDetails.job.paymentStatus === 'PAID') {
    //     throw new NotFoundException('Payment already done for this job!');
    //   }
    //   const customerDefaultPaymentDetails =
    //     await this.JobRepository.getCustomerPaymentDetails(userId);
    //   const amountInCents = Math.round(parseFloat(jobDetails.totalCost) * 100);

    //   const paymentCharge = await this.stripeService.createCharge({
    //     amount: amountInCents,
    //     currency: 'usd',
    //     description: `Payment for ${jobDetails.jobName}(${jobDetails.bookingReason})`,
    //     customer: userStripeDetails.stripeCustomerId,
    //     source: customerDefaultPaymentDetails.stripeAccountId,
    //   });
    //   if (
    //     paymentCharge &&
    //     ['succeeded', 'pending'].includes(paymentCharge.status)
    //   ) {
    //     const paymentStatus = 1;
    //     const paymentDtls = {
    //       paymentStatus,
    //       paymentType: paymentCharge.payment_method_details.type,
    //       stripeChargeId: paymentCharge.id,
    //       transactionDate: new Date(),
    //       last4:
    //         paymentCharge.payment_method_details.type === 'card'
    //           ? paymentCharge.payment_method_details.card.last4
    //           : paymentCharge.source.last4,
    //       paymentSource:
    //         paymentCharge.payment_method_details.type === 'card'
    //           ? paymentCharge.payment_method_details.card.funding
    //           : paymentCharge.source.object,
    //       paymentMethod:
    //         paymentCharge.payment_method_details.type === 'card'
    //           ? paymentCharge.payment_method
    //           : paymentCharge.source.id,
    //     };
    //     return await this.updatePaymentStatus(
    //       paymentDtls,
    //       userId,
    //       jobDetails.job.jobId,
    //       paymentCharge,
    //       jobDetails,
    //       paymentStatus
    //     );
    //   } else {
    //     throw new NotFoundException('Payment failed for this job!');
    //   }
    // }

    return updateJob;
  }

  private async sendJobStatusNotification(
    updateGuardJobStatusPayload: any,
    updateJob: any,
    guardUserId: any
  ): Promise<any> {
    let pushStatus = '';
    let message = '';
    if (updateGuardJobStatusPayload.status == 1) {
      pushStatus = 'Job Accepted!!';
      message = `${updateJob.name} has accepted your job #${updateJob.jobStatusResponse.jobRefId}`;
    }
    else if (updateGuardJobStatusPayload.status == 2) {
      pushStatus = 'Job Declined!!';
      message = `${updateJob.name} has declined your job #${updateJob.jobStatusResponse.jobRefId}. Please do contact admin to find an alternate guard ASAP`;
    }
    else if (updateGuardJobStatusPayload.status == 3) {
      pushStatus = 'Job Completed!!';
      message = `${updateJob.name} has completed your job #${updateJob.jobStatusResponse.jobRefId}`;
    }
    else if (updateGuardJobStatusPayload.status == 4) {
      pushStatus = 'Job Cancelled!!';
      message = `${updateJob.name} has cancelled your job #${updateJob.jobStatusResponse.jobRefId}`;
    }
    let jobId = updateGuardJobStatusPayload.jobId;
    let userId = guardUserId != "" ? guardUserId : updateJob.jobStatusResponse.userId;
    let notificationDetails =
      await this.NotificationRepository.saveNotification(
        userId,
        'PUSH',
        `FIDO - ${pushStatus}`,
        message,
        'JOB_DETAIL',
        jobId
      );
    let returnMsg = await this.pushService.sendPush(
      `FIDO - ${pushStatus}`,
      message,
      [userId],
      { jobId },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }
}
