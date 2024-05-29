import { SavePaymentAccountsRequest } from '../../dto/PaymentAccountsDTO';

export interface IPaymentAccountsRepository {
  getUserStripeDetails(userId: string): Promise<any>;
  createStripeAccount(
    SavePaymentAccountsRequest: SavePaymentAccountsRequest,
    stripeResponse: any,
    userId: string
  ): Promise<any>;
  updatePrimaryDetails(stripeAccountId: any, userId: string): Promise<any>;
  deletePaymentAccount(stripeAccountId: any, userId: string): Promise<any>;
  createStripeCustomer(stripeDtls: any): Promise<any>;
  updateStripeCustomer(
    stripeAccountId: string,
    customerId: string,
    userId: string
  ): Promise<any>;
  createPayment(paymentData: any): Promise<any>;
  getUserStripeAccountDetails(stripeAccountId: string): Promise<any>;
  getUserStripeAccounts(userId: string): Promise<any>;
  getAllPayments(): Promise<any>;
}
