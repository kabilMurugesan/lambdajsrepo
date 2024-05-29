import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IVerifyOtpRepository } from '../interfaces/repo/IVerifyOtpRepository';
import { VerifyOtpRequest } from '../dto/VerifyOtpDto';
import { IVerifyOtpService } from '../interfaces/services/IVerifyOtpService';
import { User } from '../entities/User';

@injectable()
export class verifyOtpService implements IVerifyOtpService {
  constructor(
    @inject(TYPES.IVerifyOtpRepository)
    private readonly VerifyOtpRepository: IVerifyOtpRepository
  ) { }
  async verifyOtp(VerifyOtpRequestPayload: VerifyOtpRequest): Promise<any> {
    const verifyOtp: User = await this.VerifyOtpRepository.verifyOtp(
      VerifyOtpRequestPayload
    );
    return verifyOtp;
  }
  async forgetPassword(email: any, type: any): Promise<any> {
    const forgetPassword: User = await this.VerifyOtpRepository.forgetPassword(
      email,
      type
    );
    return forgetPassword;
  }
}
