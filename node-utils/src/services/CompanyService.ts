import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ICompanyDetailsRepository } from '../interfaces/repo/ICompanyDetailsRepository';
import {
  CompanyDetailsRequest,
  EditCompanyDetailsRequest,
} from '../dto/CompanyDetailsDTO';
import { ICompanyDetailsService } from '../interfaces/services/ICompanyDetailsService';

@injectable()
export class CompanyDetailsService implements ICompanyDetailsService {
  constructor(
    @inject(TYPES.ICompanyDetailsRepository)
    private readonly CompanyDetailsRepository: ICompanyDetailsRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService
  ) { }
  async createComapnyDetails(
    companyDetailsPayload: CompanyDetailsRequest,
    event: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const createCompanyDetails: any =
      await this.CompanyDetailsRepository.createComapnyDetails(
        companyDetailsPayload,
        user
      );

    return createCompanyDetails;
  }
  async editCompanyDetails(
    editCompanyDetailsPayload: EditCompanyDetailsRequest,
    event: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const editCompanyDetails: any =
      await this.CompanyDetailsRepository.editCompanyDetails(
        editCompanyDetailsPayload,
        user
      );

    return editCompanyDetails;
  }
}
