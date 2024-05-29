import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
import {
  SavePaymentAccountsRequest,
  VerifyBankAccountRequest,
  UpdateDefaultSourceRequest,
} from '../dto/PaymentAccountsDTO';
import { IPaymentAccountsService } from '../interfaces/services/IPaymentAccountsService';
import { NotFoundException } from '../shared/errors/all.exceptions';

@injectable()
export class PaymentAccountsService implements IPaymentAccountsService {
  constructor(
    @inject(TYPES.IPaymentAccountsRepository)
    private readonly paymentAccountsRepository: IPaymentAccountsRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IStripeService)
    private readonly stripeService: IStripeService
  ) {}
  async savePaymentAccounts(
    event: any,
    savePaymentAccountsRequest: SavePaymentAccountsRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException(
          'Stripe customer account not created for this user!'
        )
      );
    }
    const stripeCustomerId = userStripeDetails.stripeCustomerId;
    const stripeToken = savePaymentAccountsRequest.stripeToken;
    const stripeResponse = await this.stripeService.createSource(
      stripeCustomerId,
      stripeToken
    );
    console.log('stripeResponse', stripeResponse);
    if (!stripeResponse) {
      return Promise.reject(new NotFoundException('Stripe account not added!'));
    }
    const customerDefaultPaymentDetails =
      await this.paymentAccountsRepository.getUserStripeAccounts(userId);
    if (
      !customerDefaultPaymentDetails ||
      customerDefaultPaymentDetails.length === 0
    ) {
      savePaymentAccountsRequest.isPrimary = 1;
    }
    await this.paymentAccountsRepository.createStripeAccount(
      savePaymentAccountsRequest,
      stripeResponse,
      userId
    );
    if (savePaymentAccountsRequest.isPrimary === 1) {
      await this.updatePrimaryAccountDetails(
        stripeResponse.id,
        stripeCustomerId,
        userId
      );
    }
    return stripeResponse;
  }
  async verifyBankAccount(
    event: any,
    verifyBankAccountRequest: VerifyBankAccountRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException(
          'Stripe customer account not created for this user!'
        )
      );
    }
    const stripeCustomerId = userStripeDetails.stripeCustomerId;
    const objectId = verifyBankAccountRequest.objectId;
    const amounts = verifyBankAccountRequest.amounts;
    const stripeResponse = await this.stripeService.verifySource(
      stripeCustomerId,
      objectId,
      amounts
    );
    if (!stripeResponse) {
      return Promise.reject(
        new NotFoundException('Stripe account not verified!')
      );
    }
    return stripeResponse;
  }

  async updateDefaultSource(
    event: any,
    updateDefaultSourceRequest: UpdateDefaultSourceRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException(
          'Stripe customer account not created for this user!'
        )
      );
    }
    const stripeCustomerId = userStripeDetails.stripeCustomerId;
    const stripeAccountId = updateDefaultSourceRequest.stripeAccountId;
    return await this.updatePrimaryAccountDetails(
      stripeAccountId,
      stripeCustomerId,
      userId
    );
  }

  async deletePaymentAccount(
    event: any,
    updateDefaultSourceRequest: UpdateDefaultSourceRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    let response = "Can't able to delete the account. Something went wrong!";
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException(
          'Stripe customer account not created for this user!'
        )
      );
    }
    const stripeCustomerId = userStripeDetails.stripeCustomerId;
    const stripeAccountId = updateDefaultSourceRequest.stripeAccountId;
    const { default_source } = await this.stripeService.retrieveCustomerDetails(
      stripeCustomerId
    );
    if (default_source.toString() === stripeAccountId) {
      return Promise.reject(
        new NotFoundException("Can't able to delete primary account")
      );
    }
    const stripeResponse = await this.stripeService.deleteSource(
      stripeCustomerId,
      stripeAccountId
    );

    if (stripeResponse && stripeResponse.deleted === true) {
      const accountDetails =
        await this.paymentAccountsRepository.getUserStripeAccountDetails(
          stripeAccountId
        );
      await this.paymentAccountsRepository.deletePaymentAccount(
        stripeAccountId,
        userId
      );
      let accountTypeVal = accountDetails.accountType;
      accountTypeVal = accountTypeVal.replace('_', ' ');
      accountTypeVal =
        accountTypeVal.charAt(0).toUpperCase() + accountTypeVal.slice(1);
      response = `${accountTypeVal} deleted successfully.`;
    }
    stripeResponse.responseMessage = response;
    return stripeResponse;
  }

  async getPaymentAccountDetail(
    event: any,
    stripeAccountId: string
  ): Promise<any> {
    let userId: any | undefined = event.queryStringParameters?.adminCustomerId;
    if (!userId) {
      const user = await this.authService.decodeJwt(event);
      userId = user.id;
    }
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException(
          'Stripe customer account not created for this user!'
        )
      );
    }
    return await this.getAccountDetail(
      userStripeDetails.stripeCustomerId,
      stripeAccountId
    );
  }

  private async getAccountDetail(
    stripeCustomerId: string,
    stripeAccountId: string
  ): Promise<any> {
    const stripeCustomerDetails =
      await this.stripeService.retrieveCustomerDetails(stripeCustomerId);

    let stripePaymentAccount = await this.stripeService.retrieveSource(
      stripeCustomerId,
      stripeAccountId
    );
    if (!stripePaymentAccount) {
      return Promise.reject(
        new NotFoundException('Stripe payment account not found for this user!')
      );
    }
    if (
      stripeCustomerDetails &&
      stripeCustomerDetails.default_source === stripePaymentAccount.id
    ) {
      stripePaymentAccount.default_source = true;
    } else {
      stripePaymentAccount.default_source = false;
    }
    return stripePaymentAccount;
  }

  private async updatePrimaryAccountDetails(
    stripeAccountId: string,
    stripeCustomerId: string,
    userId: string
  ): Promise<any> {
    const updateSource = await this.stripeService.updateDefaultSource(
      stripeCustomerId,
      stripeAccountId
    );
    if (updateSource) {
      await this.paymentAccountsRepository.updatePrimaryDetails(
        stripeAccountId,
        userId
      );
    }
    return updateSource;
  }

  async getAllPaymentAccounts(event: any): Promise<any> {
    let userId: any | undefined = event.queryStringParameters?.adminCustomerId;
    if (!userId) {
      const user = await this.authService.decodeJwt(event);
      userId = user.id;
    }
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException(
          'Stripe customer account not created for this user!'
        )
      );
    }
    const stripeCustomerId = userStripeDetails.stripeCustomerId;
    const paymentMethods: any = {};
    const stripeResponse = await this.stripeService.retrieveCustomerDetails(
      stripeCustomerId
    );
    if (stripeResponse && stripeResponse.default_source !== null) {
      paymentMethods.default_source = await this.getAccountDetail(
        stripeCustomerId,
        stripeResponse.default_source
      );

      paymentMethods.card = await this.stripeService.paymentMethodsList({
        customer: stripeCustomerId,
        type: 'card',
      });

      if (paymentMethods.card && paymentMethods.card.data.length > 0) {
        const cardDetails: any = [];
        await Promise.all(
          paymentMethods.card.data.map(async (cardDetail: any) => {
            const stripeAccountDetails: any =
              await this.paymentAccountsRepository.getUserStripeAccountDetails(
                cardDetail.id
              );
            cardDetail.billing_details.name = stripeAccountDetails?.name;
            cardDetails.push(cardDetail);
          })
        );
        paymentMethods.card.data = cardDetails.sort(
          (a: any, b: any) => b.created - a.created
        );
      }

      paymentMethods.bank = await this.stripeService.paymentMethodsList({
        customer: stripeCustomerId,
        type: 'us_bank_account',
      });

      if (paymentMethods.bank && paymentMethods.bank.data.length > 0) {
        const bankDetails: any = [];
        await Promise.all(
          paymentMethods.bank.data.map(async (bankDetail: any) => {
            const verifiedStatus = await this.getAccountDetail(
              stripeCustomerId,
              bankDetail.id
            );
            bankDetail.us_bank_account.status = verifiedStatus.status;
            bankDetails.push(bankDetail);
          })
        );
        paymentMethods.bank.data = bankDetails.sort(
          (a: any, b: any) => b.created - a.created
        );
      }
      return paymentMethods;
    }
    return [];
  }
}
