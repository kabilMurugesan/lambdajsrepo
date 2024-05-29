import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/Transaction'; // Update this with the correct path and module name
import { ITransactionService } from '/opt/node-utils/src/interfaces/services/ITransactionService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const getTransactionList = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/transaction',
    queryStringParameters: {
      page: 1,
      pageSize: 10,
    },
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

describe('Transaction Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should return all transactions', async () => {
    const mockService: Partial<ITransactionService> = {
      getAllTransactions: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const event = getTransactionList();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.getAllTransactions).toHaveBeenCalled();
  });
});
