import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IUserSignupRepository } from '../interfaces/repo/IUserSignupRepository';
import { CreateUserSignupRequest } from '../dto/UserSignupDTO';
import { User } from '../entities/User';
import { GlobalConstants } from '../constants/constants';
import { UserProfile } from '../entities/UserProfile';
import moment from "moment";

@injectable()
export class UserSignupRepository implements IUserSignupRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    private readonly globalConstants = GlobalConstants
  ) { }
  async createUserSignup(
    createUserSignupPayload: CreateUserSignupRequest,
  ): Promise<any> {
    const repo = await this.database.getRepository(User);
    const userprofile = await this.database.getRepository(UserProfile);
    const existingUser: User = await repo.findOneBy({
      email: createUserSignupPayload.email,
    });
    if (existingUser) {
      // return Promise.reject(new OkException("Email Already Exists"));
      return ({ "data": "", "message": "Email Already Exists." })
    } else {
      //inserting new value in database
      const otp = Math.floor(10000 + Math.random() * 90000);
      const currentTime = new Date();
      const expiryTime = await moment(currentTime)
        .add(5, 'minutes') // Set OTP expiry time to 5 minutes from now
        .utc().toDate();
      // Update the user's OTP and related information
      const otpResponse = otp.toString()
      await repo.insert({
        email: createUserSignupPayload.email,
        userType: createUserSignupPayload.userType,
        guardAccountType: createUserSignupPayload.guardAccountType,
        cognitoUserId: createUserSignupPayload.cognitoUserId,
        status: 0,//setting status to INACTIVE
        otp: otpResponse,
        otpRetryCount: 0,
        otpExpiryTime: expiryTime,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: new Date(),
        createdOn: new Date(),
      });
      const response: User = await repo.findOneBy({
        email: createUserSignupPayload.email,
      });
      //inserting phone number in user details database
      const userProfileData: any = {
        userId: response.id,
        updatedOn: new Date(),
        createdOn: new Date(),
        updatedBy: response.id,
        createdBy: response.id
      }
      if (createUserSignupPayload.phone !== "" && createUserSignupPayload.phone !== null) {
        userProfileData.phone = createUserSignupPayload.phone
      }
      await userprofile.insert(userProfileData)
      // response.otp = otpResponse
      return response;
    }
  }
}
