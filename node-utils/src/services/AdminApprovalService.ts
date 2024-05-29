import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { AdminApproveRequest, AdminDeleteUserRequest } from '../dto/AdminDTO';
import { IAdminService } from '../interfaces/services/IAdminService';
import { IAdminRepository } from '../interfaces/repo/IAdminRepository';
import { GlobalConstants } from '../constants/constants';

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.IAdminRepository)
    private readonly UserRepository: IAdminRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IEmailService)
    private readonly emailService: IEmailService,
    private readonly globalConstants = GlobalConstants
  ) {}

  async guardApprove(
    AdminApproveRequest: AdminApproveRequest,
    event: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const response: any = await this.UserRepository.guardApprove(
      AdminApproveRequest,
      user
    );
    const status = AdminApproveRequest.status;
    console.log(status);
    const approvalStatus = status === 'accepted' ? 'APPROVED' : 'REJECTED';
    await this.sendGuardNotification(response, approvalStatus);
    return response;
  }
  async guardDeleteUser(
    AdminDeleteUserRequest: AdminDeleteUserRequest,
    event: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const guardApprove: any = await this.UserRepository.guardDeleteUser(
      AdminDeleteUserRequest,
      user
    );
    return guardApprove;
  }
  private async sendGuardNotification(response: any, approvalStatus: string) {
    console.log('response', response);
    const receiverName = response.firstName + ' ' + response.lastName;
    console.log(receiverName);
    console.log(approvalStatus);
    const receiverEmail = response.email;
    console.log(receiverEmail);
    await this.emailService.sendEmail(
      this.globalConstants.EMAIL_TEMPLATE.GUARD_REGISTRATION_APPROVAL,
      receiverEmail,
      { receiverName, approvalStatus }
    );
  }
}
