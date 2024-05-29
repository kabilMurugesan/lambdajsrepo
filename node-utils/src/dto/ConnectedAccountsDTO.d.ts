export interface CreateConnectedAccountsRequest {
  businessType: string;
  firstName: string;
  lastName: string;
  dobDay: number;
  dobMonth: number;
  dobYear: number;
  ssn: string;
  fullName: string;
  taxId: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  url: string;
  ip: string;
}
