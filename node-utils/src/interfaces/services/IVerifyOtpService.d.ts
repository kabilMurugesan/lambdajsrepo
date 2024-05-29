// import { User } from "../../entities/User";
import { VerifyOtpRequest } from '../../dto/VerifyOtpDto';

export interface IVerifyOtpService {
  verifyOtp(VerifyOtpRequest: VerifyOtpRequest): Promise<any>;
  forgetPassword(email: string, type: any): Promise<any>
}
