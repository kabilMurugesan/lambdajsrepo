import { User } from "../../entities/User";
import { ResendOtpRequest } from "../../dto/ResendOtpDTO";


export interface IResendOtpRepository {
    createResendOtp(
        ResendVerifyOtpRequest: ResendOtpRequest
    ): Promise<User>;
}

