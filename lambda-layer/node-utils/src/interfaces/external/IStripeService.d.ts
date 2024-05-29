declare interface IStripeService {
  createCustomer(customerObj: any): Promise<any>;
  createSource(stripeAccountId: string, stripeToken: string): Promise<any>;
  updateDefaultSource(
    stripeCustomerId: string,
    stripeAccountId: string
  ): Promise<any>;
  verifySource(
    stripeCustomerId: string,
    objectId: string,
    amounts: string[]
  ): Promise<any>;
  retrieveCustomerDetails(stripeCustomerId: string): Promise<any>;
  retrieveSource(
    stripeCustomerId: string,
    stripeAccountId: string
  ): Promise<any>;
  deleteSource(stripeCustomerId: string, stripeAccountId: string): Promise<any>;
  createAccount(accountObj: any): Promise<any>;
  updateAccount(stripeAccountId: string, accountObj: any): Promise<any>;
  createAccountLinks(accountLinksObj: any): Promise<any>;
  paymentMethodsList(obj: any): Promise<any>;
  createManualPayout(payoutObj: any, striptAccObj: any): Promise<any>;
  listExternalAccounts(stripeAccountId: any, striptAccObj: any): Promise<any>;
  retrieveAccBalance(stripeAccount: any): Promise<any>;
  createCharge(chargeObj: any): Promise<any>;
  createToken(accountDetails: any): Promise<any>;
  createTransfer(transferObj: any): Promise<any>;
  retrieveAccountDetails(stripeAccountId: string): Promise<any>;
}
