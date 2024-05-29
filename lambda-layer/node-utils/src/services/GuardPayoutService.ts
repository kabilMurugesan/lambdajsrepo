import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
import {
  CreateManualPayoutRequest,
  UpdateGuardPayoutRequest,
} from '../dto/GuardPayoutDTO';
import { IGuardPayoutService } from '../interfaces/services/IGuardPayoutService';
import { NotFoundException } from '../shared/errors/all.exceptions';

@injectable()
export class GuardPayoutService implements IGuardPayoutService {
  constructor(
    @inject(TYPES.IPaymentAccountsRepository)
    private readonly paymentAccountsRepository: IPaymentAccountsRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IStripeService)
    private readonly stripeService: IStripeService
  ) {}
  async updatePayoutConfig(
    event: any,
    updateGuardPayoutRequest: UpdateGuardPayoutRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails || userStripeDetails.stripeAccountId === null) {
      return Promise.reject(
        new NotFoundException(
          'Stripe connected account not created for this user!'
        )
      );
    }
    const updateObj: any = {
      settings: {
        payouts: {
          schedule: {
            interval: updateGuardPayoutRequest.interval,
          },
        },
      },
    };
    if (updateGuardPayoutRequest.interval === 'weekly') {
      updateObj.settings.payouts.schedule.weekly_anchor =
        updateGuardPayoutRequest.weekly_anchor;
    } else if (updateGuardPayoutRequest.interval === 'monthly') {
      updateObj.settings.payouts.schedule.monthly_anchor =
        updateGuardPayoutRequest.monthly_anchor;
    }
    return await this.stripeService.updateAccount(
      userStripeDetails.stripeAccountId,
      updateObj
    );
  }
  async createManualPayout(
    event: any,
    createManualPayoutRequest: CreateManualPayoutRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails && userStripeDetails.stripeAccountId === null) {
      return Promise.reject(
        new NotFoundException('Stripe account not created for this user!')
      );
    }
    const stripeAccountId = userStripeDetails.stripeAccountId;
    const createPayout = await this.stripeService.createManualPayout(
      {
        amount: createManualPayoutRequest.amount,
        currency: 'usd',
        description: createManualPayoutRequest.description,
        method: 'standard',
      },
      {
        stripeAccount: stripeAccountId,
      }
    );
    if (createPayout) {
      let paymentData = null;
      const bankAccList = await this.stripeService.listExternalAccounts(
        stripeAccountId,
        {
          object: 'bank_account',
        }
      );

      if (bankAccList && bankAccList.data.length > 0) {
        paymentData = {
          userId,
          txnType: 'payout',
          paymentMethod: bankAccList.data[0].id,
          last4: bankAccList.data[0].last4,
          paymentType: bankAccList.data[0].object,
          payoutAmount: createManualPayoutRequest.amount,
          payoutId: createPayout.id,
          paidTo: userId,
          brandBank: bankAccList.data[0].bank_name,
        };
      } else {
        const cardList = await this.stripeService.listExternalAccounts(
          stripeAccountId,
          {
            object: 'card',
          }
        );
        if (cardList && cardList.data.length > 0) {
          paymentData = {
            userId,
            txnType: 'payout',
            paymentMethod: cardList.data[0].id,
            last4: cardList.data[0].last4,
            paymentType: cardList.data[0].type,
            payoutAmount: createManualPayoutRequest.amount,
            payoutId: createPayout.id,
            paidTo: userId,
            brandBank: cardList.data[0].brand,
          };
        }
      }

      return await this.paymentAccountsRepository.createPayment(paymentData);
    }
  }
}
