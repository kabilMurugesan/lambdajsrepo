import {
  SavePaymentAccountsRequest,
  VerifyBankAccountRequest,
  UpdateDefaultSourceRequest,
} from '../../dto/PaymentAccountsDTO';

export interface IPaymentAccountsService {
  savePaymentAccounts(
    event: any,
    savePaymentAccountsRequest: SavePaymentAccountsRequest
  ): Promise<any>;

  verifyBankAccount(
    event: any,
    verifyBankAccountRequest: VerifyBankAccountRequest
  ): Promise<any>;

  updateDefaultSource(
    event: any,
    updateDefaultSourceRequest: UpdateDefaultSourceRequest
  ): Promise<any>;

  deletePaymentAccount(
    event: any,
    updateDefaultSourceRequest: UpdateDefaultSourceRequest
  ): Promise<any>;

  getPaymentAccountDetail(event: any, stripeAccountId: string): Promise<any>;
  getAllPaymentAccounts(event: any): Promise<any>;
}
