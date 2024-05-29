import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IDatabaseService } from "../interfaces/services/IDatabaseService";
import { IVerifyOtpRepository } from "../interfaces/repo/IVerifyOtpRepository";
import { VerifyOtpRequest } from "../dto/VerifyOtpDto";
import { User } from "../entities/User";
import { GlobalConstants } from "../constants/constants";
// import { BadRequestException } from "../shared/errors/all.exceptions";
import moment from "moment"
import { config } from "dotenv";
import { UserProfile } from "../entities/UserProfile";

/** Load env file */
config({ path: "../../.env" });
@injectable()
export class VerifyOtpRepository implements IVerifyOtpRepository {
    constructor(
        @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
        private readonly globalConstants = GlobalConstants
    ) { }
    async verifyOtp(
        ResendOtpPayload: VerifyOtpRequest,
    ): Promise<any> {
        const repo = await this.database.getRepository(User);
        const userProfileRepo = await this.database.getRepository(UserProfile)
        // const userprofile = await this.database.getRepository(UserProfile);
        const existingUser: any = await repo.findOne({
            where: { email: ResendOtpPayload.email }
        });
        if (!existingUser || existingUser == "") {
            return ({ "data": "", "message": "User is Invalid" });
        } else {
            if (ResendOtpPayload.type == "email") {
                const currentTime = new Date();
                existingUser.updatedBy = this.globalConstants.SYS_ADMIN_GUID;
                existingUser.isEmailVerified = true;
                existingUser.status = 1;
                existingUser.updatedOn = moment(currentTime).utc().toDate();
                // Save the updated user data in the database
                await repo.save(existingUser);
                return existingUser
            } if (ResendOtpPayload.type == "phoneNumber") {
                const currentTime = new Date();
                await userProfileRepo.update({ userId: existingUser.id }, {
                    updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                    isPhoneVerified: true,
                    updatedOn: moment(currentTime).utc().toDate(),
                });
                const existingUserProfile: any = await userProfileRepo.findOne({
                    where: { userId: existingUser.id }
                });
                return existingUserProfile
            }
        }
    }

    async forgetPassword(
        email: string,
        type: any
    ): Promise<any> {
        const repo = await this.database.getRepository(User);
        // const userprofile = await this.database.getRepository(UserProfile);
        const conditions: any = { email: email }
        if (type != "" && type) {
            conditions.userType = type
        }
        const existingUser: any = await repo.findOne({
            where: conditions
        });
        if (!existingUser || existingUser == "") {
            return ({ "data": "", "message": "User doesn't exist.Please Enter Proper Email." });

        }
        return false

    }
}
