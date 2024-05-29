import { CompanyDetailsRequest, EditCompanyDetailsRequest } from "../../dto/CompanyDetailsDTO";
import { Company } from "../../entities/Company";



export interface ICompanyDetailsRepository {
    createComapnyDetails(
        companyDetailsRequest: CompanyDetailsRequest,
        user: any
    ): Promise<any>;
    editCompanyDetails(
        companyDetailsRequest: EditCompanyDetailsRequest,
        user: any
    ): Promise<any>;
}

