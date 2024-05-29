import { injectable } from 'inversify';
import Stripe from 'stripe';
import { externalConfig } from '../configuration/externalConfig';

@injectable()
export class StripeService implements IStripeService {
  private stripeClient: Stripe;
  private readonly stripeData: any = externalConfig.STRIPE;

  constructor() {
    // Initialize the Stripe client
    this.stripeClient = new Stripe(this.stripeData.stripeSecretKey);
  }
  async createCustomer(customerObj: any): Promise<any> {
    try {
      // Attempt to create a customer using the Stripe client
      return await this.stripeClient.customers.create(customerObj);
    } catch (error) {
      // Handle createCustomer error
      console.error('Error creating stripe customer:', error.message);
      throw error;
    }
  }

  async createSource(
    stripeCustomerId: string,
    stripeToken: string
  ): Promise<any> {
    try {
      return await this.stripeClient.customers.createSource(stripeCustomerId, {
        source: stripeToken,
      });
    } catch (error) {
      // Handle createSource error
      console.error('Error creating stripe source:', error.message);
      throw error;
    }
  }

  async retrieveCustomerDetails(stripeCustomerId: string): Promise<any> {
    try {
      return await this.stripeClient.customers.retrieve(stripeCustomerId);
    } catch (error) {
      // Handle createSource error
      console.error('Error retrieve stripe customer details:', error.message);
      throw error;
    }
  }

  async paymentMethodsList(obj: any): Promise<any> {
    try {
      return await this.stripeClient.paymentMethods.list(obj);
    } catch (error) {
      // Handle createSource error
      console.error(
        'Error retrieve stripe payment methods list:',
        error.message
      );
      throw error;
    }
  }

  async retrieveSource(
    stripeCustomerId: string,
    stripeAccountId: string
  ): Promise<any> {
    try {
      return await this.stripeClient.customers.retrieveSource(
        stripeCustomerId,
        stripeAccountId
      );
    } catch (error) {
      // Handle createSource error
      console.error('Error retrieve stripe source:', error.message);
      throw error;
    }
  }

  async updateDefaultSource(
    stripeCustomerId: string,
    stripeAccountId: string
  ): Promise<any> {
    try {
      return await this.stripeClient.customers.update(stripeCustomerId, {
        default_source: stripeAccountId,
      });
    } catch (error) {
      // Handle createSource error
      console.error('Error updating stripe source:', error.message);
      throw error;
    }
  }

  async deleteSource(
    stripeCustomerId: string,
    stripeAccountId: string
  ): Promise<any> {
    try {
      return await this.stripeClient.customers.deleteSource(
        stripeCustomerId,
        stripeAccountId
      );
    } catch (error) {
      // Handle createSource error
      console.error('Error deleting stripe source:', error.message);
      throw error;
    }
  }

  async verifySource(
    stripeCustomerId: string,
    objectId: string,
    amounts: any
  ): Promise<any> {
    try {
      return await this.stripeClient.customers.verifySource(
        stripeCustomerId,
        objectId,
        {
          amounts,
        }
      );
    } catch (error) {
      // Handle createSource error
      console.error('Error verifying stripe source:', error.message);
      throw error;
    }
  }

  async createAccount(accountObj: any): Promise<any> {
    try {
      return await this.stripeClient.accounts.create(accountObj);
    } catch (error) {
      console.error('Error creating stripe connected account:', error.message);
      throw error;
    }
  }

  async updateAccount(stripeAccountId: string, accountObj: any): Promise<any> {
    try {
      return await this.stripeClient.accounts.update(
        stripeAccountId,
        accountObj
      );
    } catch (error) {
      console.error('Error updating stripe connected account:', error.message);
      throw error;
    }
  }

  async createAccountLinks(accountLinksObj: any): Promise<any> {
    try {
      return await this.stripeClient.accountLinks.create(accountLinksObj);
    } catch (error) {
      console.error(
        'Error creating stripe connected account links:',
        error.message
      );
      throw error;
    }
  }

  async createManualPayout(payoutObj: any, striptAccObj: any): Promise<any> {
    try {
      return await this.stripeClient.payouts.create(payoutObj, striptAccObj);
    } catch (error) {
      console.error('Error creating stripe manual payout:', error.message);
      throw error;
    }
  }

  async listExternalAccounts(
    stripeAccountId: any,
    striptAccObj: any
  ): Promise<any> {
    try {
      return await this.stripeClient.accounts.listExternalAccounts(
        stripeAccountId,
        striptAccObj
      );
    } catch (error) {
      console.error('Error listing stript external accounts:', error.message);
      throw error;
    }
  }
  async retrieveAccBalance(stripeAccount: any): Promise<any> {
    try {
      return await this.stripeClient.balance.retrieve({ stripeAccount });
    } catch (error) {
      console.error('Error retrieve stripe account balance:', error.message);
    }
  }
  async createToken(accountDetails: any): Promise<any> {
    try {
      return await this.stripeClient.tokens.create(accountDetails);
    } catch (error) {
      console.error('Error creating stripe token:', error.message);
      throw error;
    }
  }
  async createCharge(chargeObj: any): Promise<any> {
    try {
      return await this.stripeClient.charges.create(chargeObj);
    } catch (error) {
      console.error('Error creating charge in stripe:', error.message);
      throw error;
    }
  }
  async createTransfer(transferObj: any): Promise<any> {
    try {
      console.log('transferObj', transferObj);
      return await this.stripeClient.transfers.create(transferObj);
    } catch (error) {
      console.error('Error creating transferring in stripe:', error.message);
      throw error;
    }
  }
  async retrieveAccountDetails(stripeAccountId: string): Promise<any> {
    try {
      return await this.stripeClient.accounts.retrieve(stripeAccountId);
    } catch (error) {
      // Handle createSource error
      console.error('Error retrieve stripe customer details:', error.message);
      throw error;
    }
  }
}
