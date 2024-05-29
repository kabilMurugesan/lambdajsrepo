import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/PaymentAccounts'; // Update this with the correct path and module name
import { IPaymentAccountsService } from '/opt/node-utils/src/interfaces/services/IPaymentAccountsService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (
  requestBody: any,
  httpMethod: string
): APIGatewayProxyEvent => {
  return {
    httpMethod,
    path: '/payment-accounts',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

const getPaymentsAccountDetails = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/payment-accounts',
    queryStringParameters: {
      stripeAccountId: 'dummy-id',
    },
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

describe('Stripe accounts Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should create bank account/card in stripe', async () => {
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      savePaymentAccounts: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);

    const requestBody = {
      accountType: 'bank_account',
      name: 'Dummy',
      accountLast4Digits: '1111',
      routingNumber: '11111111111',
      isPrimary: 1,
      stripeToken: 'dummy-stripe-token',
    };

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockPaymentAccountsService.savePaymentAccounts).toHaveBeenCalled();
  });

  it('should verify bank account in stripe', async () => {
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      verifyBankAccount: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);

    const requestBody = {
      objectId: 'dummy-id',
      amounts: ['32', '45'],
    };

    const event = generateEvent(requestBody, 'PUT');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockPaymentAccountsService.verifyBankAccount).toHaveBeenCalled();
  });

  it('should update default source in stripe', async () => {
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      updateDefaultSource: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);

    const requestBody = {
      stripeAccountId: 'dummy-id',
    };

    const event = generateEvent(requestBody, 'PATCH');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockPaymentAccountsService.updateDefaultSource).toHaveBeenCalled();
  });

  it('should delete payment account in stripe', async () => {
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      deletePaymentAccount: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);

    const requestBody = {
      stripeAccountId: 'dummy-id',
    };

    const event = generateEvent(requestBody, 'DELETE');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockPaymentAccountsService.deletePaymentAccount).toHaveBeenCalled();
  });

  it('should return stripe payment account detail', async () => {
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      getPaymentAccountDetail: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);

    const event = getPaymentsAccountDetails();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(
      mockPaymentAccountsService.getPaymentAccountDetail
    ).toHaveBeenCalled();
  });

  it('should return stripe all payment accounts list', async () => {
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      getAllPaymentAccounts: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);
    const requestBody = {};
    const event = generateEvent(requestBody, 'GET');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockPaymentAccountsService.getAllPaymentAccounts).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockPaymentAccountsService: Partial<IPaymentAccountsService> = {
      savePaymentAccounts: jest.fn().mockResolvedValue('mockResponse'),
    };

    const requestBody = {
      accountType: 'invalid-value',
    };

    // @ts-ignore
    container.get.mockReturnValue(mockPaymentAccountsService);

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).code).toBe(1);
  });
});
