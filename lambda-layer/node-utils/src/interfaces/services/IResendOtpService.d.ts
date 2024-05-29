import { User } from '../../entities/User';
import { ResendOtpRequest } from '../../dto/ResendOtpDTO';

export interface IResendOtpService {
  createResendOtp(ResendOtpRequest: ResendOtpRequest): Promise<any>;
}
