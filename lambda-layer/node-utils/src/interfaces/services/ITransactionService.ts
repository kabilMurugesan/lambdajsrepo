export interface ITransactionService {
  getAllTransactions(event: any, page: any, pageSize: any): Promise<any>;
}
