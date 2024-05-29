import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/JobInterest'; // Update this with the correct path and module name
import { IUserProfileService } from '/opt/node-utils/src/interfaces/services/IUserProfileService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const jobInterestEvent = (
  requestBody: any,
  method: any
): APIGatewayProxyEvent => {
  return {
    httpMethod: method,
    path: '/job-interest',
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('job-interest Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should get all job interest types', async () => {
    const mockGetJobInterestService: Partial<IUserProfileService> = {
      getJobInterest: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetJobInterestService);

    const event = jobInterestEvent({}, 'GET');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockGetJobInterestService.getJobInterest).toHaveBeenCalled();
  });

  it('should save job interest types with request params', async () => {
    const requestBody = {
      items: [
        '8e0ca92d-3da6-4fc1-b1d1-61b7a06e4a5d',
        'cb19b6c5-4f2a-41a5-8c8d-9b8f5dfaf89d',
      ],
    };

    const mockSaveJobInterestService: Partial<IUserProfileService> = {
      saveJobInterest: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockSaveJobInterestService);

    const event = jobInterestEvent(requestBody, 'POST'); // Pass the request body
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
  });
});
