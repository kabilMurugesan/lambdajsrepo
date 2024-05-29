import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IPaymentAccountsRepository } from '../interfaces/repo/IPaymentAccountsRepository';
import { CreateConnectedAccountsRequest } from '../dto/ConnectedAccountsDTO';
import { IConnectedAccountsService } from '../interfaces/services/IConnectedAccountsService';
import { NotFoundException } from '../shared/errors/all.exceptions';

@injectable()
export class ConnectedAccountsService implements IConnectedAccountsService {
  constructor(
    @inject(TYPES.IPaymentAccountsRepository)
    private readonly paymentAccountsRepository: IPaymentAccountsRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IStripeService)
    private readonly stripeService: IStripeService
  ) {}
  async createConnectedAccounts(
    event: any,
    conAccReq: CreateConnectedAccountsRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (userStripeDetails && userStripeDetails.stripeAccountId !== null) {
      return Promise.reject(
        new NotFoundException('Connected account already created for his user!')
      );
    }

    let account: any = {
      type: 'express',
      country: 'US',
      email: conAccReq.email,
      business_type: conAccReq.businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    };
    account = await this.createAccountObj(account, conAccReq);
    const stripeResponse = await this.stripeService.createAccount(account);
    if (stripeResponse && stripeResponse.id) {
      const stripeDtls = {
        stripeAccountId: stripeResponse.id,
        userId,
        createdBy: userId,
        updatedBy: userId,
        updatedOn: new Date(),
        createdOn: new Date(),
      };
      let createStripeDtl = null;
      if (!userStripeDetails) {
        createStripeDtl =
          await this.paymentAccountsRepository.createStripeCustomer(stripeDtls);
      } else {
        createStripeDtl =
          await this.paymentAccountsRepository.updateStripeCustomer(
            stripeResponse.id,
            userStripeDetails.id,
            userId
          );
      }
      if (!createStripeDtl)
        return Promise.reject(
          new NotFoundException('Stripe account not created!')
        );
      return await this.createOnboardingUrl(userId);
    }
  }

  async updateConnectedAccounts(
    event: any,
    conAccReq: CreateConnectedAccountsRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException('Stripe account not created for this user!')
      );
    }

    let account: any = {
      email: conAccReq.email,
      business_type: conAccReq.businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    };
    account = await this.createAccountObj(account, conAccReq);
    return await this.stripeService.updateAccount(
      userStripeDetails.stripeAccountId,
      account
    );
  }

  private async createOnboardingUrl(userId: string): Promise<any> {
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (userStripeDetails && userStripeDetails.stripeAccountId === null) {
      return Promise.reject(
        new NotFoundException('Connected account not created for his user!')
      );
    }

    return await this.stripeService.createAccountLinks({
      account: userStripeDetails.stripeAccountId,
      refresh_url: 'https://fidosecurity.com/redirect',
      return_url: 'https://fidosecurity.com/redirect',
      type: 'account_onboarding',
    });
  }
  private async createAccountObj(account: any, conAccReq: any): Promise<any> {
    if (conAccReq.businessType === 'company') {
      account.company = {
        name: conAccReq.fullName,
        address: {
          city: conAccReq.city,
          country: 'US',
          line1: conAccReq.addressLine1,
          line2: conAccReq.addressLine2,
          postal_code: conAccReq.postalCode,
          state: conAccReq.state,
        },
        tax_id: conAccReq.taxId,
        phone: conAccReq.phoneNumber,
      };
    } else if (conAccReq.businessType === 'individual') {
      account.individual = {
        first_name: conAccReq.firstName,
        last_name: conAccReq.lastName,
        email: conAccReq.email,
        address: {
          city: conAccReq.city,
          country: 'US',
          line1: conAccReq.addressLine1,
          line2: conAccReq.addressLine2,
          postal_code: conAccReq.postalCode,
          state: conAccReq.state,
        },
        dob: {
          day: conAccReq.dobDay,
          month: conAccReq.dobMonth,
          year: conAccReq.dobYear,
        },
        ssn_last_4: conAccReq.ssn,
        phone: conAccReq.phoneNumber,
      };
    }
    return account;
  }
  async getConnectedAccountBalance(event: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException('Stripe account not created for this user!')
      );
    }

    return await this.stripeService.retrieveAccBalance(
      userStripeDetails.stripeAccountId
    );
  }

  async getPayoutConfig(event: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException('Stripe account not created for this user!')
      );
    }

    if (userStripeDetails.stripeAccountId !== null) {
      const account = await this.stripeService.retrieveAccountDetails(
        userStripeDetails.stripeAccountId
      );
      const payoutSchedule = account.settings.payouts.schedule;
      return payoutSchedule;
    } else {
      return Promise.reject(
        new NotFoundException('Stripe account not created for this user!')
      );
    }
  }

  async checkConnectedAccount(event: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const userStripeDetails =
      await this.paymentAccountsRepository.getUserStripeDetails(userId);
    if (!userStripeDetails) {
      return Promise.reject(
        new NotFoundException('Stripe account not created for this user!')
      );
    }

    if (userStripeDetails.stripeAccountId !== null) {
      const getConnectedAccDtls =
        await this.stripeService.retrieveAccountDetails(
          userStripeDetails.stripeAccountId
        );
      console.log('getConnectedAccDtls', getConnectedAccDtls);
      if (
        getConnectedAccDtls &&
        (getConnectedAccDtls.payouts_enabled === false ||
          getConnectedAccDtls.capabilities.transfers === 'inactive' ||
          getConnectedAccDtls.capabilities.card_payments === 'inactive')
      ) {
        const reGenerateOnBoarding = await this.createOnboardingUrl(userId);
        if (reGenerateOnBoarding) {
          return {
            created: false,
            onBoardingUrl: reGenerateOnBoarding,
          };
        }
        return {
          created: false,
          onBoardingUrl: null,
        };
      }
      if (getConnectedAccDtls && getConnectedAccDtls.payouts_enabled === true) {
        const bankAccList = await this.stripeService.listExternalAccounts(
          userStripeDetails.stripeAccountId,
          {
            object: 'bank_account',
          }
        );

        console.log('bankAccList', bankAccList);

        const cardList = await this.stripeService.listExternalAccounts(
          userStripeDetails.stripeAccountId,
          {
            object: 'card',
          }
        );

        console.log('cardList', cardList);

        let bankDtls: any = null;
        let bankData: any = null;
        let bank_name: any = null;
        if (cardList && cardList.data.length > 0) {
          bankDtls = {
            accountType: 'card',
            userId,
            accountLast4Digits: cardList.data[0].last4,
            isPrimary: 1,
            status: 1,
          };
          bankData = cardList.data[0];
          bank_name = `${cardList.data[0].brand} (${cardList.data[0].funding})`;
        }
        if (bankAccList && bankAccList.data.length > 0) {
          bankDtls = {
            accountType: 'bank',
            userId,
            accountLast4Digits: bankAccList.data[0].last4,
            isPrimary: 1,
            status: 1,
            routingNumber: bankAccList.data[0].routing_number,
          };
          bankData = bankAccList.data[0];
          bank_name = bankAccList.data[0].bank_name;
        }
        console.log('bankDtls', bankDtls);
        if (bankDtls != null) {
          const isAccAlreadyRegistered =
            await this.paymentAccountsRepository.getUserStripeAccounts(userId);
          if (!isAccAlreadyRegistered || isAccAlreadyRegistered.length === 0) {
            await this.paymentAccountsRepository.createStripeAccount(
              bankDtls,
              bankData,
              userId
            );
          }
        } else {
          const reGenerateOnBoarding = await this.createOnboardingUrl(userId);
          if (reGenerateOnBoarding) {
            return {
              created: false,
              onBoardingUrl: reGenerateOnBoarding,
            };
          }
        }
        return {
          created: true,
          onBoardingUrl: null,
          accountDetails: {
            accountType: bankDtls.accountType,
            bank_name,
            last4: bankDtls.accountLast4Digits,
          },
        };
      }
    }
    return {
      created: false,
      onBoardingUrl: null,
    };
  }
}
