export interface ITransactionRepository {
  getAllTransactions(user: any, page: any, pageSize: any): Promise<any>;
}
