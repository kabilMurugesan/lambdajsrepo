import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/JobList'; // Update this with the correct path and module name
import container from '/opt/node-utils/src/container';
import { IJobListService } from '/opt/node-utils/src/interfaces/services/IJobListService';
// import { IListService } from '../lambda-layer/node-utils/src/interfaces/services/IAdminListService';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateGetJobListEvent = (
  page: number,
  pageSize: number
): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: `/job-list?page=${page},pageSize=${pageSize}`,
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

const generateGetJobListEventWithStatus = (
  status: string,
  page: number,
  pageSize: number
): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: `/job-list?page=${page},pageSize=${pageSize}`,
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

const generateUpdateGuardStatusEvent = (
  requestBody: any
): APIGatewayProxyEvent => {
  return {
    httpMethod: 'PATCH',
    path: '/job-list',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('guard team Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should get all job list', async () => {
    const mockGetJobInterestService: Partial<IJobListService> = {
      getJobListSummary: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetJobInterestService);

    const event = generateGetJobListEvent(1, 10); // Provide a valid search keyword
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(mockGetJobInterestService.getJobListSummary);
  });

  it('should get all job list with status', async () => {
    const mockGetJobInterestService: Partial<IJobListService> = {
      getJobListSummary: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetJobInterestService);

    const event = generateGetJobListEventWithStatus('1', 1, 10); // Provide a valid search keyword
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(mockGetJobInterestService.getJobListSummary);
  });

  it('should update guard job status', async () => {
    const mockConfirmJobService: Partial<IJobListService> = {
      updateGuardJobStatus: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockConfirmJobService);

    const requestBody = {
      jobId: 'Dummy-Job-ID',
      status: 1,
    };

    const event = generateUpdateGuardStatusEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockConfirmJobService.updateGuardJobStatus).toHaveBeenCalled();
  });
});
