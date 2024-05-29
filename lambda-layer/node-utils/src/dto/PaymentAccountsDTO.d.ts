export interface SavePaymentAccountsRequest {
  accountType: string;
  name: string;
  accountLast4Digits: string;
  routingNumber: string;
  isPrimary: Number;
  stripeToken: string;
}
export interface VerifyBankAccountRequest {
  objectId: string;
  amounts: string[];
}
export interface UpdateDefaultSourceRequest {
  stripeAccountId: string;
}
