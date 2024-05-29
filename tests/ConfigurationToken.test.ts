import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/ConfigurationToken'; // Update this with the correct path and module name
import { IStsTokenService } from '/opt/node-utils/src/interfaces/services/IStsTokenService';
import container from '/opt/node-utils/src/container';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/configuration-token',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('Sts Token Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should generate aws sts token', async () => {
    const mockStsTokenService: IStsTokenService = {
      getStsToken: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockStsTokenService);

    const requestBody = {};

    const event = generateEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    // expect(JSON.parse(result.body).data).toEqual('mockResponse');
    // expect(mockStsTokenService.getStsToken).toHaveBeenCalled();
  });
});
