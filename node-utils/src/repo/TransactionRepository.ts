import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { ITransactionRepository } from '../interfaces/repo/ITransactionRepository';
import { Payments } from '../entities/Payments';
import { FindManyOptions } from 'typeorm';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService
  ) { }
  async getAllTransactions(user: any, page: any, pageSize: any): Promise<any> {
    const userId = user.id;
    const userType = user.userType;
    const options: FindManyOptions<Payments> = {};
    let conditions: object = { userId, paymentStatus: 1 };
    if (userType === 'GUARD') {
      conditions = { paidTo: userId, paymentStatus: 1 };
    }
    options.where = conditions;
    options.take = Number(pageSize);
    page && pageSize ? (options.skip = (page - 1) * pageSize) : '';
    options.order = {
      ['updatedOn']: 'DESC',
    };

    options.relations = ['job'];

    const repo = await this.database.getRepository(Payments);
    const [results, count] = await repo.findAndCount(options);

    const mappedResults = results.map((payment) => ({
      transactionId: `#${payment.transactionId}`,
      jobId: payment.jobId,
      amount: payment.amount,
      txnType: payment.txnType,
      last4: payment.last4,
      createdOn: payment.createdOn,
      jobName: payment.job ? payment.job.jobName : null,
      jobRefId: payment.job ? `#${payment.job.jobRefId}` : null,
      paymentSource: payment.paymentType !== 'card' ? 'bank account' : 'card',
      paymentStatus: payment.paymentStatus == 1 ? 'Paid' : '',
    }));

    const response: any = {
      count,
      results: mappedResults,
      pages: pageSize ? Math.ceil(count / pageSize) : 1,
    };

    return response;
  }
}
