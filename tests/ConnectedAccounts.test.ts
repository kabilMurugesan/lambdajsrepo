import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/ConnectedAccounts'; // Update this with the correct path and module name
import { IConnectedAccountsService } from '/opt/node-utils/src/interfaces/services/IConnectedAccountsService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (
  requestBody: any,
  httpMethod: string
): APIGatewayProxyEvent => {
  return {
    httpMethod,
    path: '/connected-accounts',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

const generateGetEvent = (
  queryStringParameters: any,
  httpMethod: string
): APIGatewayProxyEvent => {
  return {
    httpMethod,
    path: '/connected-accounts',
    queryStringParameters,
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

  it('should create connected account in stripe', async () => {
    const mockConnectedAccountsService: Partial<IConnectedAccountsService> = {
      createConnectedAccounts: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockConnectedAccountsService);

    const requestBody = {
      businessType: 'company',
      fullName: 'dummy-text',
      taxId: 'dummy-text',
      email: 'dummy-text',
      addressLine1: 'dummy-text',
      addressLine2: 'dummy-text',
      city: 'dummy-text',
      state: 'dummy-text',
      postalCode: 'dummy-text',
      phoneNumber: 'dummy-text',
      url: 'dummy-text',
      ip: 'dummy-text',
    };

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(
      mockConnectedAccountsService.createConnectedAccounts
    ).toHaveBeenCalled();
  });
  it('should update connected account details in stripe', async () => {
    const mockConnectedAccountsService: Partial<IConnectedAccountsService> = {
      updateConnectedAccounts: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockConnectedAccountsService);

    const requestBody = {
      businessType: 'individual',
      firstName: 'dummy-text',
      lastName: 'dummy-text',
      dobDay: 10,
      dobMonth: 11,
      dobYear: 2023,
      ssn: 'dummy-text',
      email: 'dummy-text',
      addressLine1: 'dummy-text',
      addressLine2: 'dummy-text',
      city: 'dummy-text',
      state: 'dummy-text',
      postalCode: 'dummy-text',
      phoneNumber: 'dummy-text',
      url: 'dummy-text',
      ip: 'dummy-text',
    };

    const event = generateEvent(requestBody, 'PUT');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(
      mockConnectedAccountsService.updateConnectedAccounts
    ).toHaveBeenCalled();
  });
  it('should get connected account balance in stripe', async () => {
    const mockConnectedAccountsService: Partial<IConnectedAccountsService> = {
      getConnectedAccountBalance: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockConnectedAccountsService);

    const event = generateGetEvent(
      {
        queryType: 'accountBalance',
      },
      'GET'
    );
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(
      mockConnectedAccountsService.getConnectedAccountBalance
    ).toHaveBeenCalled();
  });
  it('should check connected account in stripe', async () => {
    const mockConnectedAccountsService: Partial<IConnectedAccountsService> = {
      checkConnectedAccount: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockConnectedAccountsService);

    const event = generateGetEvent(
      {
        queryType: 'checkConnectedAccount',
      },
      'GET'
    );
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(
      mockConnectedAccountsService.checkConnectedAccount
    ).toHaveBeenCalled();
  });
});
