import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IStsTokenService } from '../interfaces/services/IStsTokenService';

@injectable()
export class StsTokenService implements IStsTokenService {
  constructor(
    @inject(TYPES.IAwsService)
    private readonly awsService: IAwsService
  ) { }

  async getStsToken(): Promise<any> {
    return await this.awsService.getSTSToken();
  }
}
