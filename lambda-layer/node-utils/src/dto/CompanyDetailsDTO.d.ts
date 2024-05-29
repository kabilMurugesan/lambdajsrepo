export interface CompanyDetailsRequest {
    userId: string;
    teamName: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    street1: string;
    street2: string;
    country: string;
    city: string;
    // zipCode: string;
    companyPhotoFileName: string;
    // companyPhotoFile: string;
}

export interface EditCompanyDetailsRequest {
    companyId: string;
    userId: string;
    teamName: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    street1: string;
    street2: string;
    country: string;
    city: string;
    // zipCode: string;
    companyPhotoFileName: string;
}
