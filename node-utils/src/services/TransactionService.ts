import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ITransactionRepository } from '../interfaces/repo/ITransactionRepository';
import { ITransactionService } from '../interfaces/services/ITransactionService';

@injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @inject(TYPES.ITransactionRepository)
    private readonly TransactionRepository: ITransactionRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService
  ) {}

  async getAllTransactions(event: any, page: any, pageSize: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const response = await this.TransactionRepository.getAllTransactions(
      user,
      page,
      pageSize
    );
    return response;
  }
}
