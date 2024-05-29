import { CreateConnectedAccountsRequest } from '../../dto/ConnectedAccountsDTO';

export interface IConnectedAccountsService {
  createConnectedAccounts(
    event: any,
    createConnectedAccountsRequest: CreateConnectedAccountsRequest
  ): Promise<any>;
  updateConnectedAccounts(
    event: any,
    createConnectedAccountsRequest: CreateConnectedAccountsRequest
  ): Promise<any>;
  getConnectedAccountBalance(event: any): Promise<any>;
  checkConnectedAccount(event: any): Promise<any>;
  getPayoutConfig(event: any): Promise<any>;
}
