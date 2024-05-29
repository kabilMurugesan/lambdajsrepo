import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/GuardPayout'; // Update this with the correct path and module name
import { IGuardPayoutService } from '/opt/node-utils/src/interfaces/services/IGuardPayoutService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (
  requestBody: any,
  httpMethod: string
): APIGatewayProxyEvent => {
  return {
    httpMethod,
    path: '/guard-payout',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('Stripe accounts Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should update connected account daily payout config details in stripe', async () => {
    const mockService: Partial<IGuardPayoutService> = {
      updatePayoutConfig: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const requestBody = {
      interval: 'daily',
    };

    const event = generateEvent(requestBody, 'PUT');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.updatePayoutConfig).toHaveBeenCalled();
  });

  it('should update connected account weekly payout config details in stripe', async () => {
    const mockService: Partial<IGuardPayoutService> = {
      updatePayoutConfig: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const requestBody = {
      interval: 'weekly',
      weekly_anchor: 'dummy-text',
    };

    const event = generateEvent(requestBody, 'PUT');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.updatePayoutConfig).toHaveBeenCalled();
  });

  it('should update connected account monthly payout config details in stripe', async () => {
    const mockService: Partial<IGuardPayoutService> = {
      updatePayoutConfig: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const requestBody = {
      interval: 'monthly',
      monthly_anchor: 1,
    };

    const event = generateEvent(requestBody, 'PUT');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.updatePayoutConfig).toHaveBeenCalled();
  });

  it('should create manual payout in stripe', async () => {
    const mockService: Partial<IGuardPayoutService> = {
      createManualPayout: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const requestBody = {
      amount: 100,
      description: 'dummy-description',
    };

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.createManualPayout).toHaveBeenCalled();
  });
});
