// import { User } from "../../entities/User";
import { VerifyOtpRequest } from "../../dto/VerifyOtpDto";


export interface IVerifyOtpRepository {
    verifyOtp(
        VerifyOtpRequest: VerifyOtpRequest
    ): Promise<any>;
    forgetPassword(email: string, type: any): Promise<any>
}
