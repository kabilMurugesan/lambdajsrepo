import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
import { UserStripeDetails } from '../entities/UserStripeDetails';
import { UserStripeAccounts } from '../entities/UserStripeAccounts';
import { Not } from 'typeorm';
import { Payments } from '../entities/Payments';

@injectable()
export class PaymentAccountsRepository implements IPaymentAccountsRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService
  ) {}

  async getUserStripeDetails(userId: any): Promise<any> {
    const userStripeRepo = await this.database.getRepository(UserStripeDetails);
    return await userStripeRepo.findOneBy({
      userId,
    });
  }
  async getUserStripeAccountDetails(stripeAccountId: string): Promise<any> {
    const userStripeAccRepo = await this.database.getRepository(
      UserStripeAccounts
    );
    return await userStripeAccRepo.findOneBy({
      stripeAccountId,
    });
  }
  async getUserStripeAccounts(userId: string): Promise<any> {
    const userStripeAccRepo = await this.database.getRepository(
      UserStripeAccounts
    );
    return await userStripeAccRepo.findOneBy({
      userId,
    });
  }
  async createStripeAccount(
    SavePaymentAccountsRequest: any,
    stripeResponse: any,
    userId: string
  ): Promise<any> {
    const userStripeAccountRepo = await this.database.getRepository(
      UserStripeAccounts
    );
    await userStripeAccountRepo.insert({
      userId,
      ...SavePaymentAccountsRequest,
      stripeAccountId: stripeResponse.id,
      fingerprint: stripeResponse.fingerprint,
      createdOn: new Date(),
      updatedOn: new Date(),
      updatedBy: userId,
      createdBy: userId,
    });
  }
  async updatePrimaryDetails(
    stripeAccountId: any,
    userId: string
  ): Promise<any> {
    const userStripeAccountRepo = await this.database.getRepository(
      UserStripeAccounts
    );
    await userStripeAccountRepo.update(
      { userId, stripeAccountId },
      { isPrimary: 1 }
    );

    await userStripeAccountRepo.update(
      { userId, stripeAccountId: Not(stripeAccountId) },
      { isPrimary: 0 }
    );
  }

  async deletePaymentAccount(
    stripeAccountId: any,
    userId: string
  ): Promise<any> {
    const userStripeAccountRepo = await this.database.getRepository(
      UserStripeAccounts
    );
    await userStripeAccountRepo.update(
      {
        userId,
        stripeAccountId,
      },
      { status: 2 }
    );
  }

  async createStripeCustomer(stripeDtls: any): Promise<any> {
    const repo = await this.database.getRepository(UserStripeDetails);
    return await repo.insert(stripeDtls);
  }

  async updateStripeCustomer(
    stripeAccountId: string,
    customerId: string,
    userId: string
  ): Promise<any> {
    const userStripeAccountRepo = await this.database.getRepository(
      UserStripeDetails
    );
    return await userStripeAccountRepo.update(
      {
        id: customerId,
      },
      { stripeAccountId, updatedBy: userId, updatedOn: new Date() }
    );
  }

  async createPayment(paymentData: any): Promise<any> {
    const paymentsRepo = await this.database.getRepository(Payments);
    return await paymentsRepo.insert(paymentData);
  }

  async getAllPayments(): Promise<any> {
    const paymentsRepo = await this.database.getRepository(Payments);
    return await paymentsRepo.find({
      order: {
        transactionId: 'DESC',
      },
    });
  }
}
