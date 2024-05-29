import { GuardJobInterest } from '../entities/GuardJobInterest';

export interface CreateUserProfileRequest {
  isJobRateAdded: boolean;
  IsApostAdded: boolean;
  IsAsrbAdded: boolean;
  isCertVerificationAdded: boolean;
  isProfileInfoAdded: boolean;
  isJobInterestAdded: boolean;
  updatedOn: Date;
  userId: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  stateId: string;
  cityId: string;
  profilePhotoFileName: string;
  aPostInitiallyCertifiedDate: Date;
  aPostAnnualFireArmQualificationDate: Date;
  aPostLicenseNo: string;
  aPostCertFileName: string;
  srbLicenseIssueDate: Date;
  srbLicenseExpiryDate: Date;
  srbLicenseNo: string;
  srbCertFileName: string;
  srbStateId: string;
  guardJobRate: number;
  socialSecurityNo: string;
  type: string;
  phone: string
}

export interface SaveJobInterestRequest {
  items: Array<GuardJobInterest>;
}
