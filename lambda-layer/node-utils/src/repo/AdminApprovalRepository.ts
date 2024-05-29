import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { AdminApproveRequest, AdminDeleteUserRequest } from '../dto/AdminDTO';
import { GlobalConstants } from '../constants/constants';
import { NotFoundException } from '../shared/errors/all.exceptions';
import { IAdminRepository } from '../interfaces/repo/IAdminRepository';
import { User } from '../entities/User';
import { UserProfile } from '../entities/UserProfile';
import { externalConfig } from '../configuration/externalConfig';
import { TeamMembers } from '../entities/TeamMembers';
import { Not } from 'typeorm';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
const {
  CognitoIdentityProviderClient,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

@injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    @inject(TYPES.INotificationRepository)
    private readonly NotificationRepository: INotificationRepository,
    @inject(TYPES.IPushService)
    private readonly pushService: IPushService,
    private readonly globalConstants = GlobalConstants,
    private readonly awsData: any = externalConfig.AWS,
  ) { }
  async guardApprove(
    AdminApproveRequest: AdminApproveRequest,
    user: any
  ): Promise<any> {
    // const userId = user.id
    const repo = await this.database.getRepository(User);
    const userProfile = await this.database.getRepository(UserProfile);
    const response: any = await repo.findOneBy({
      id: AdminApproveRequest.userId,
    });
    if (!response) {
      return Promise.reject(new NotFoundException('User profile not exist'));
    }
    await repo.update(
      { id: AdminApproveRequest.userId },
      {
        isCertificateVerified:
          AdminApproveRequest.status === 'accepted' ? 1 : 2,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      }
    );

    let userResponse: any = await userProfile.findOneBy({
      userId: AdminApproveRequest.userId,
    });
    let name = userResponse.firstName + " " + userResponse.lastName
    await this.sendStatusNotification(name, AdminApproveRequest.status, AdminApproveRequest.userId)
    userResponse.email = response.email;
    return userResponse;
  }
  async guardDeleteUser(
    AdminDeleteUserRequest: AdminDeleteUserRequest,
    user: any
  ): Promise<any> {
    const repo = await this.database.getRepository(User);
    const teamMembersRepo = await this.database.getRepository(TeamMembers);
    const userCheck: any = await repo.findOneBy({
      id: AdminDeleteUserRequest.userId,
    });
    if (!userCheck) {
      return Promise.reject(new NotFoundException('User does not exist'));
    }
    // AdminDeleteUserRequest
    if (AdminDeleteUserRequest.status == 'delete') {
      const client = new CognitoIdentityProviderClient();
      const input = {
        UserPoolId: this.awsData.UserPoolId,
        Username: userCheck.cognitoUserId,
      };
      const command = new AdminDisableUserCommand(input);
      const response = await client.send(command);
      console.log(response, 'disable Account');
    }
    if (AdminDeleteUserRequest.status == 'activate') {
      const client = new CognitoIdentityProviderClient();
      const input = {
        UserPoolId: this.awsData.UserPoolId,
        Username: userCheck.cognitoUserId,
      };
      const command = new AdminEnableUserCommand(input);
      const response = await client.send(command);
      console.log(response, 'enable Account');
    }
    const isLead = await teamMembersRepo.findOne({
      where: {
        userId: AdminDeleteUserRequest.userId,
        isLead: true,
      },
    });
    if (
      userCheck.userType == 'GUARD' &&
      isLead &&
      AdminDeleteUserRequest.status == 'delete'
    ) {
      const isTeamMemberPresent = await teamMembersRepo.findOne({
        where: {
          userId: Not(AdminDeleteUserRequest.userId),
          teamId: isLead.teamId,
          isLead: false,
        },
      });
      if (isTeamMemberPresent) {
        await teamMembersRepo.update(
          {
            userId: isTeamMemberPresent.UserId,
          },
          { isLead: true }
        );
        await teamMembersRepo.update(
          {
            userId: AdminDeleteUserRequest.userId,
          },
          { isLead: false }
        );
      }
    }
    await repo.update(
      { id: AdminDeleteUserRequest.userId },
      {
        status: AdminDeleteUserRequest.status == 'delete' ? 2 : 1,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      }
    );
    const response: any = await repo.findOneBy({
      id: AdminDeleteUserRequest.userId,
    });
    return { response };
  }

  private async sendStatusNotification(Name: any, status: any, userId: any) {

    let pushStatus = 'Welcome Onboard!!';
    let message = `Hello ${Name}! Congratulations as your onboarding request has been approved by our admin now!`
    if (status != "accepted") {
      pushStatus = 'Issue with Onboarding!!'
      message = `Hello ${Name}! We are sorry to update you that, we aren’t able to approve your onboarding request at the moment. Please take some time to talk our admin now and the get the issue fixed!`
    }


    let notificationDetails =
      await this.NotificationRepository.saveNotification(
        userId,
        'PUSH',
        `FIDO -${pushStatus}`,
        message,
        'JOB_DETAIL',
        ""
      );
    let returnMsg = await this.pushService.sendPush(
      `FIDO - ${pushStatus}`,
      message,
      [userId],
      { jobId: "" },
      notificationDetails
    );
    await this.NotificationRepository.updateNotificationStatus(
      notificationDetails.id,
      returnMsg
    );
  }
}
