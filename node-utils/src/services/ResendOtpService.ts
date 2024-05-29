import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IResendOtpRepository } from '../interfaces/repo/IResendOtpRepository';
import { ResendOtpRequest } from '../dto/ResendOtpDTO';
import { IResendOtpService } from '../interfaces/services/IResendOtpService';
import { User } from '../entities/User';

@injectable()
export class ResendOtpService implements IResendOtpService {
  constructor(
    @inject(TYPES.IResendOtpRepository)
    private readonly ResendOtpRepository: IResendOtpRepository
  ) {}
  async createResendOtp(
    ResendOtpRequestPayload: ResendOtpRequest
  ): Promise<any> {
    const resendOtp: User = await this.ResendOtpRepository.createResendOtp(
      ResendOtpRequestPayload
    );
    return resendOtp;
  }
}
