import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IPreSignedUrlService } from '../interfaces/services/IPreSignedUrlService';
// import { IStsTokenService } from '../interfaces/services/IStsTokenService';

@injectable()
export class PreSignedUrlService implements IPreSignedUrlService {
    constructor(
        @inject(TYPES.IAwsService)
        private readonly awsService: IAwsService
    ) { }

    async getPreSignedUrl(folder: any, fileName: any): Promise<any> {
        return await this.awsService.getPreSignedUrl(folder, fileName);
    }
}