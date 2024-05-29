import {
  CompanyDetailsRequest,
  EditCompanyDetailsRequest,
} from '../../dto/CompanyDetailsDTO';
import { Company } from '../../entities/Company';

export interface ICompanyDetailsService {
  createComapnyDetails(
    companyDetailsRequest: CompanyDetailsRequest,
    event: any
  ): Promise<any>;
  editCompanyDetails(
    companyDetailsRequest: EditCompanyDetailsRequest,
    event: any
  ): Promise<any>;
}
