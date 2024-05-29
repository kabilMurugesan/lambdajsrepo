import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDisburseJobAmtRepository } from '../interfaces/repo/IDisburseJobAmtRepository';
import { IDisburseJobAmtService } from '../interfaces/services/IDisburseJobAmtService';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
import { GlobalConstants } from '../constants/constants';

@injectable()
export class DisburseJobAmtService implements IDisburseJobAmtService {
  constructor(
    @inject(TYPES.IDisburseJobAmtRepository)
    private readonly disburseJobAmtRepository: IDisburseJobAmtRepository,
    @inject(TYPES.IPaymentAccountsRepository)
    private readonly paymentAccountsRepository: IPaymentAccountsRepository,
    @inject(TYPES.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @inject(TYPES.IStripeService)
    private readonly stripeService: IStripeService,
    @inject(TYPES.IEmailService)
    private readonly emailService: IEmailService,
    @inject(TYPES.IPushService)
    private readonly pushService: IPushService,
    private readonly globalConstants = GlobalConstants
  ) {}

  async disburseJobAmt(event: any): Promise<any> {
    console.log('inside disburseJobAmt');
    const jobPaymentDetails =
      await this.disburseJobAmtRepository.getJobGuards();
    console.log('jobPaymentDetails', jobPaymentDetails);

    if (jobPaymentDetails.length > 0) {
      await Promise.all(
        jobPaymentDetails.map(async (jobDetail: any) => {
          await this.processJobDetail(jobDetail);
        })
      );
    } else if (jobPaymentDetails.length == 0) {
      const jobGuardPaymentDetails =
        await this.disburseJobAmtRepository.getJobTeamGuards(3);

      if (jobGuardPaymentDetails.length > 0) {
        await Promise.all(
          jobGuardPaymentDetails.map(async (jobDetail: any) => {
            await this.processGuardJobDetail(jobDetail);
          })
        );
      }
    }
  }

  private async processGuardJobDetail(jobDetail: any): Promise<void> {
    let transferAmount = 0;
    const jobGuardPaymentDetails =
      await this.disburseJobAmtRepository.getPriceJobGuardsTransferPrice(
        jobDetail.jobId
      );

    transferAmount = jobGuardPaymentDetails.totalAmount;
    if (transferAmount > 0) {
      let leadStripeAccountId =
        await this.disburseJobAmtRepository.getTeamLeadId(jobDetail.teamId);
      let transferObject = {
        totalJobAmount: transferAmount,
        stripeAccountId: leadStripeAccountId.stripeAccountId,
        jobId: jobDetail.jobId,
      };
      const stripeResponse = await this.transferAmount(transferObject);
      jobDetail.teamLeadUser = leadStripeAccountId.userId;
      const type = 'team';
      if (stripeResponse) {
        await this.updateJobDetails(jobDetail, type);
        await this.createPaymentRecord(jobDetail);
        await this.sendNotificationAndEmail(
          jobDetail,
          jobDetail.totalJobAmount
        );
      }
    }
  }

  private async processJobDetail(jobDetail: any): Promise<void> {
    const transferAmount = jobDetail.totalJobAmount;
    const type = 'individual';
    if (transferAmount > 0) {
      const stripeResponse = await this.transferAmount(jobDetail);
      if (stripeResponse) {
        await this.updateJobDetails(jobDetail, type);
        await this.createPaymentRecord(jobDetail);
        await this.sendNotificationAndEmail(jobDetail, transferAmount);
      }
    }
  }

  private async transferAmount(jobDetail: any): Promise<any> {
    const transferObj = {
      amount: jobDetail.totalJobAmount * 100,
      currency: 'USD',
      destination: jobDetail.stripeAccountId,
      transfer_group: `{ job: ${jobDetail.jobId} }`,
    };
    return await this.stripeService.createTransfer(transferObj);
  }

  private async updateJobDetails(jobDetail: any, type: any): Promise<void> {
    await this.disburseJobAmtRepository.updateJobGuardsTransferStatus(
      jobDetail.jobGuardId,
      type
    );
  }

  private async createPaymentRecord(jobDetail: any): Promise<void> {
    const payments = await this.paymentAccountsRepository.getAllPayments();
    const transactionId =
      payments.length > 0 ? parseInt(payments[0].transactionId) + 1 : 1;
    const paymentData = {
      jobId: jobDetail.jobId,
      transactionId,
      stripeChargeId: jobDetail.stripeChargeId || '',
      amount: jobDetail.totalJobAmount,
      paymentType: jobDetail.paymentType || '',
      userId: jobDetail.teamLeadUser
        ? jobDetail.teamLeadUser
        : jobDetail.userId || '',
      txnType: 'transfer',
      paymentMethod: jobDetail.paymentMethod || '',
      last4: jobDetail.last4 || '',
      paidTo: jobDetail.paidTo,
      paidAccountId: jobDetail.stripeAccountId,
      paymentStatus: 1,
      createdOn: new Date(),
      updatedOn: new Date(),
      updatedBy: this.globalConstants.SYS_ADMIN_GUID,
      createdBy: this.globalConstants.SYS_ADMIN_GUID,
    };
    await this.paymentAccountsRepository.createPayment(paymentData);
  }

  private async sendNotificationAndEmail(
    jobDetail: any,
    transferAmount: number
  ): Promise<void> {
    const receiverName = jobDetail.firstName + ' ' + jobDetail.lastName;
    const receiverEmail = jobDetail.email;

    await this.emailService.sendEmail(
      this.globalConstants.EMAIL_TEMPLATE.JOB_AMOUNT_CREDIT_NOTIFICATION,
      receiverEmail,
      {
        receiverName,
        jobId: jobDetail.jobRefId,
        amount: transferAmount,
      }
    );

    let notificationDetails =
      await this.notificationRepository.saveNotification(
        jobDetail.paidTo,
        'PUSH',
        `Congratulations ${receiverName}!!`,
        `Thanks for serving Job #${jobDetail.jobRefId}. You did a fantastic Job. You have received $${transferAmount} as you have completed the job #${jobDetail.jobRefId}.`,
        'JOB_DETAIL',
        jobDetail.jobId
      );

    let returnMsg = await this.pushService.sendPush(
      `Congratulations ${receiverName}!!`,
      `Thanks for serving Job #${jobDetail.jobRefId}. You did a fantastic Job. You have received $${transferAmount} as you have completed the job #${jobDetail.jobRefId}.`,
      [jobDetail.paidTo],
      { jobId: jobDetail.jobId },
      notificationDetails
    );

    await this.notificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );

    // Send notification to Admin
    notificationDetails = await this.notificationRepository.saveNotification(
      this.globalConstants.ADMIN_USER_ID,
      'PUSH',
      `Congratulations ${receiverName}!!`,
      `Thanks for serving Job #${jobDetail.jobRefId}. You did a fantastic Job. You have received $${transferAmount} as you have completed the job #${jobDetail.jobRefId}.`,
      'JOB_DETAIL',
      jobDetail.jobId
    );

    returnMsg = await this.pushService.sendPush(
      `Congratulations ${receiverName}!!`,
      `Thanks for serving Job #${jobDetail.jobRefId}. You did a fantastic Job. You have received $${transferAmount} as you have completed the job #${jobDetail.jobRefId}.`,
      [this.globalConstants.ADMIN_USER_ID],
      { jobId: jobDetail.jobId },
      notificationDetails
    );

    await this.notificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }
}
