import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IDatabaseService } from "../interfaces/services/IDatabaseService";
import { IResendOtpRepository } from "../interfaces/repo/IResendOtpRepository";
import { ResendOtpRequest } from "../dto/ResendOtpDTO";
import { User } from "../entities/User";
import { GlobalConstants } from "../constants/constants";
import moment from "moment";
import { config } from "dotenv";

/** Load env file */
config({ path: "../../.env" });

@injectable()
export class ResendOtpRepository implements IResendOtpRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    private readonly globalConstants = GlobalConstants
  ) { }
  async createResendOtp(
    ResendOtpPayload: ResendOtpRequest,
  ): Promise<any> {
    const repo = await this.database.getRepository(User);
    // const userprofile = await this.database.getRepository(UserProfile);
    const existingUser: any = await repo.findOneBy({
      email: ResendOtpPayload.email,
    });
    if (!existingUser || existingUser == "") {
      return ({ "data": "", "message": "Please Enter valid email" });
    } else {
      const currentTime = new Date();
      if (moment(existingUser.otpExpiryTime)
        .add(process.env.RESEND_OTP_EXPIRATION_MINUTES, 'minutes').utc().toDate() < moment(currentTime).utc().toDate()) {
        const otp = Math.floor(10000 + Math.random() * 90000);
        // Update the user's OTP and related information
        existingUser.otp = otp.toString();
        existingUser.otpRetryCount = 1;
        existingUser.otpExpiryTime = moment(currentTime)
          .add(process.env.OTP_EXPIRY_MINUTES, 'minutes') // Set OTP expiry time to 5 minutes from now
          .utc() // Convert to UTC
          .toDate();
        existingUser.updatedBy = this.globalConstants.SYS_ADMIN_GUID,
          existingUser.updatedOn = moment(currentTime).utc().toDate(),
          // Save the updated user data in the database
          await repo.save(existingUser);
        return existingUser
      } else if (existingUser.otpRetryCount < 3) {
        // Update the user's OTP and related information
        existingUser.otpRetryCount = existingUser.otpRetryCount + 1;
        existingUser.otpExpiryTime = moment(currentTime)
          .add(process.env.OTP_EXPIRY_MINUTES, 'minutes') // Set OTP expiry time to 5 minutes from now
          .utc() // Convert to UTC
          .toDate();
        existingUser.updatedBy = this.globalConstants.SYS_ADMIN_GUID;
        existingUser.updatedOn = moment(currentTime).utc().toDate();
        await repo.save(existingUser);
        return existingUser;
      } else {
        return ({ "data": "", "message": "Maximum attempts exceeded. Please try after sometime." });
      }
    }
  }
}

