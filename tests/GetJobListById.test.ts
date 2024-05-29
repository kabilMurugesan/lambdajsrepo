import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/JobList'; // Update this with the correct path and module name
import container from '/opt/node-utils/src/container';
import { IJobListService } from '/opt/node-utils/src/interfaces/services/IJobListService';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateGetCompanyListEvent = (jobId: string): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: `/job-list`,
    queryStringParameters: {
      jobId: jobId,
    },
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

describe('get job details by id', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should get the job details by valid Id', async () => {
    const mockGetJobInterestService: Partial<IJobListService> = {
      getJobDetailsById: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetJobInterestService);

    const event = generateGetCompanyListEvent('validJobId'); // Provide a valid search keyword
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(mockGetJobInterestService.getJobDetailsById).toHaveBeenCalledWith(
      event,
      'validJobId'
    );
  });
});
