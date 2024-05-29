import { Container } from 'inversify';
import { TYPES } from './types';
import { IDatabaseService } from './interfaces/services/IDatabaseService';
import { DatabaseService } from './services/DatabaseService';
import { IUserProfileRepository } from './interfaces/repo/IUserProfileRepository';
import { UserProfileRepository } from './repo/UserProfileRepository';
import { IUserProfileService } from './interfaces/services/IUserProfileService';
import { UserProfileService } from './services/UserProfileService';
import { IStsTokenService } from './interfaces/services/IStsTokenService';
import { StsTokenService } from './services/StsTokenService';
import { CommonErrorHandler } from './utils/CommonErrorHandler';
import { AwsService } from './external/AwsService';
import { IUserSignupService } from './interfaces/services/IUserSignupService';
import { IUserSignupRepository } from './interfaces/repo/IUserSignupRepository';
import { UserSignupRepository } from './repo/UserSignupRepository';
import { UserSignupService } from './services/UserSignupService';
import { IStateService } from './interfaces/services/IStateService';
import { IStateRepository } from './interfaces/repo/IStateRepository';
import { StateRepository } from './repo/StateRepository';
import { StateService } from './services/StateService';
import { EmailService } from './external/EmailService';
import { IResendOtpRepository } from './interfaces/repo/IResendOtpRepository';
import { ResendOtpRepository } from './repo/ResendOtpRepository';
import { IVerifyOtpRepository } from './interfaces/repo/IVerifyOtpRepository';
import { IResendOtpService } from './interfaces/services/IResendOtpService';
import { IVerifyOtpService } from './interfaces/services/IVerifyOtpService';
import { VerifyOtpRepository } from './repo/VerifyOtpRepository';
import { ResendOtpService } from './services/ResendOtpService';
import { verifyOtpService } from './services/VerifyOtpService';
import { IUserAvailabilityDayRepository } from './interfaces/repo/IUserAvailabilityDayRepository';
import { IUserAvailabilityDayService } from './interfaces/services/IUserAvailabilityDayService';
import { UserAvailabilityDayRepository } from './repo/UserAvailabiltyDayRepository';
import { UserAvailabilityDayService } from './services/UserAvailabilityDayService';
import { IJobRepository } from './interfaces/repo/IJobRepository';
import { IJobService } from './interfaces/services/IJobService';
import { JobRepository } from './repo/JobRepository';
import { JobService } from './services/JobService';
import { IGuardTeamRepository } from './interfaces/repo/IGuardTeamRepository';
import { IGuardTeamService } from './interfaces/services/IGuardTeamService';
import { GuardTeamRepository } from './repo/GuardTeamRepository';
import { GuardTeamService } from './services/GuardTeamService';
import { IListService } from './interfaces/services/IAdminListService';
import { ListService } from './services/AdminListService';
import { IListRepository } from './interfaces/repo/IAdminListRepository';
import { ListRepository } from './repo/AdminListRepository';
import { IAdminService } from './interfaces/services/IAdminService';
import { AdminService } from './services/AdminApprovalService';
import { IAdminRepository } from './interfaces/repo/IAdminRepository';
// import { AdminRepository } from './repo/AdminApprovalRepository';
import { IRadiusService } from './interfaces/services/IRadiusService';
import { RadiusService } from './services/RadiusService';
import { IRadiusRepository } from './interfaces/repo/IRadiusRepository';
import { RadiusRepository } from './repo/RadiusRepository';
import { ICompanyDetailsRepository } from './interfaces/repo/ICompanyDetailsRepository';
import { CompanyDetailsRepository } from './repo/CompanyRepository';
import { ICompanyDetailsService } from './interfaces/services/ICompanyDetailsService';
import { CompanyDetailsService } from './services/CompanyService';
import { AuthService } from './middleware/auth';
import { AdminRepository } from './repo/AdminApprovalRepository';
import { IJobListService } from './interfaces/services/IJobListService';
import { JobListService } from './services/JobListService';
import { JobListRepository } from './repo/JobListRepository';
import { IJobListRepository } from './interfaces/repo/IJobListRepository';
import { PushService } from './external/PushService';
import { ICheckListService } from './interfaces/services/ICheckListService';
import { checkListService } from './services/CheckListService';
import { ICheckListRepository } from './interfaces/repo/ICheckListRepository';
import { CheckListRepository } from './repo/CheckListRepository';
import { INotificationRepository } from './interfaces/repo/INotificationRepository';
import { NotificationRepository } from './repo/NotificationRepository';
import { INotificationService } from './interfaces/services/INotificationService';
import { NotificationService } from './services/NotificationService';
import { IPaymentAccountsRepository } from './interfaces/repo/IPaymentAccountsRepository';
import { IPaymentAccountsService } from './interfaces/services/IPaymentAccountsService';
import { PaymentAccountsService } from './services/PaymentAccountsService';
import { PaymentAccountsRepository } from './repo/PaymentAccountsRepository';
import { StripeService } from './external/StripeService';
import { IRatingsReviewsService } from './interfaces/services/IRatingsReviewsService';
import { IRatingsReviewsRepository } from './interfaces/repo/IRatingsReviewRepository';
import { RatingsReviewsService } from './services/RatingsReviewService';
import { RatingsReviewsRepository } from './repo/RatingsReviewRepository';
import { IConnectedAccountsService } from './interfaces/services/IConnectedAccountsService';
import { ConnectedAccountsService } from './services/ConnectedAccountsService';
import { IGuardPayoutService } from './interfaces/services/IGuardPayoutService';
import { GuardPayoutService } from './services/GuardPayoutService';
import { ITransactionRepository } from './interfaces/repo/ITransactionRepository';
import { ITransactionService } from './interfaces/services/ITransactionService';
import { TransactionRepository } from './repo/TransactionRepository';
import { TransactionService } from './services/TransactionService';
import { IDisburseJobAmtRepository } from './interfaces/repo/IDisburseJobAmtRepository';
import { IDisburseJobAmtService } from './interfaces/services/IDisburseJobAmtService';
import { DisburseJobAmtRepository } from './repo/DisburseJobAmtRepository';
import { DisburseJobAmtService } from './services/DisburseJobAmtService';
import { IChatRepository } from './interfaces/repo/IChatRepository';
import { IChatService } from './interfaces/services/IChatService';
import { ChatRepository } from './repo/ChatRepository';
import { ChatService } from './services/ChatService';
import { IPreSignedUrlService } from './interfaces/services/IPreSignedUrlService';
import { PreSignedUrlService } from './services/PreSignedUrlService';

const container = new Container();

/* Shared Service Bind */
container.bind<IDatabaseService>(TYPES.IDatabaseService).to(DatabaseService);
container
  .bind<IUserProfileRepository>(TYPES.IUserProfileRepository)
  .to(UserProfileRepository);
container
  .bind<IUserProfileService>(TYPES.IUserProfileService)
  .to(UserProfileService);
container.bind<IStsTokenService>(TYPES.IStsTokenService).to(StsTokenService);
container
  .bind<IUserSignupRepository>(TYPES.IUserSignupRepository)
  .to(UserSignupRepository);
container
  .bind<IUserSignupService>(TYPES.IUserSignupService)
  .to(UserSignupService);
container
  .bind<IUserAvailabilityDayRepository>(TYPES.IUserAvailabilityDayRepository)
  .to(UserAvailabilityDayRepository);
container
  .bind<IUserAvailabilityDayService>(TYPES.IUserAvailabilityDayService)
  .to(UserAvailabilityDayService);
container.bind<IStateService>(TYPES.IStateService).to(StateService);
container.bind<IStateRepository>(TYPES.IStateRepository).to(StateRepository);
container.bind<IGuardTeamService>(TYPES.IGuardTeamService).to(GuardTeamService);
container
  .bind<IGuardTeamRepository>(TYPES.IGuardTeamRepository)
  .to(GuardTeamRepository);
container.bind<IEmailService>(TYPES.IEmailService).to(EmailService);
container
  .bind<ICommonErrorHandler>(TYPES.ICommonErrorHandler)
  .to(CommonErrorHandler);
container.bind<IAwsService>(TYPES.IAwsService).to(AwsService);
container
  .bind<IResendOtpRepository>(TYPES.IResendOtpRepository)
  .to(ResendOtpRepository);
container.bind<IResendOtpService>(TYPES.IResendOtpService).to(ResendOtpService);
container
  .bind<IVerifyOtpRepository>(TYPES.IVerifyOtpRepository)
  .to(VerifyOtpRepository);
container.bind<IVerifyOtpService>(TYPES.IVerifyOtpService).to(verifyOtpService);
container.bind<IJobService>(TYPES.IJobService).to(JobService);
container.bind<IJobRepository>(TYPES.IJobRepository).to(JobRepository);
container.bind<IListService>(TYPES.IListService).to(ListService);
container.bind<IListRepository>(TYPES.IListRepository).to(ListRepository);
container.bind<IAdminService>(TYPES.IAdminService).to(AdminService);
container.bind<IAdminRepository>(TYPES.IAdminRepository).to(AdminRepository);
container.bind<IRadiusService>(TYPES.IRadiusService).to(RadiusService);
container.bind<IRadiusRepository>(TYPES.IRadiusRepository).to(RadiusRepository);
container
  .bind<ICompanyDetailsRepository>(TYPES.ICompanyDetailsRepository)
  .to(CompanyDetailsRepository);
container
  .bind<ICompanyDetailsService>(TYPES.ICompanyDetailsService)
  .to(CompanyDetailsService);
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container.bind<IJobListService>(TYPES.IJobListService).to(JobListService);
container
  .bind<IJobListRepository>(TYPES.IJobListRepository)
  .to(JobListRepository);
container.bind<IPushService>(TYPES.IPushService).to(PushService);
// container.bind<IPreSignedService>(TYPES.IPreSignedService).to(PreSignedService)
container
  .bind<INotificationRepository>(TYPES.INotificationRepository)
  .to(NotificationRepository);
container
  .bind<INotificationService>(TYPES.INotificationService)
  .to(NotificationService);
container.bind<ICheckListService>(TYPES.ICheckListService).to(checkListService);
container
  .bind<ICheckListRepository>(TYPES.ICheckListRepository)
  .to(CheckListRepository);
container
  .bind<IPaymentAccountsService>(TYPES.IPaymentAccountsService)
  .to(PaymentAccountsService);
container
  .bind<IPaymentAccountsRepository>(TYPES.IPaymentAccountsRepository)
  .to(PaymentAccountsRepository);
container.bind<IStripeService>(TYPES.IStripeService).to(StripeService);
container
  .bind<IRatingsReviewsService>(TYPES.IRatingsReviewsService)
  .to(RatingsReviewsService);
container
  .bind<IRatingsReviewsRepository>(TYPES.IRatingsReviewsRepository)
  .to(RatingsReviewsRepository);
container
  .bind<IConnectedAccountsService>(TYPES.IConnectedAccountsService)
  .to(ConnectedAccountsService);
container
  .bind<IGuardPayoutService>(TYPES.IGuardPayoutService)
  .to(GuardPayoutService);
container
  .bind<ITransactionService>(TYPES.ITransactionService)
  .to(TransactionService);
container
  .bind<ITransactionRepository>(TYPES.ITransactionRepository)
  .to(TransactionRepository);
container
  .bind<IDisburseJobAmtService>(TYPES.IDisburseJobAmtService)
  .to(DisburseJobAmtService);
container
  .bind<IDisburseJobAmtRepository>(TYPES.IDisburseJobAmtRepository)
  .to(DisburseJobAmtRepository);
container.bind<IChatService>(TYPES.IChatService).to(ChatService);
container.bind<IChatRepository>(TYPES.IChatRepository).to(ChatRepository);

container
  .bind<IPreSignedUrlService>(TYPES.IPreSignedUrlService)
  .to(PreSignedUrlService);

export default container;
