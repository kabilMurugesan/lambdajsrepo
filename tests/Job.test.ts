import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/Job'; // Update this with the correct path and module name
import { IJobService } from '/opt/node-utils/src/interfaces/services/IJobService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (requestBody: any, method: any): APIGatewayProxyEvent => {
  return {
    httpMethod: method,
    path: '/job',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};
const getJobSummary = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/job',
    queryStringParameters: {
      jobId: 'dummy-id',
    },
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

describe('Job Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should save job information', async () => {
    const mockSaveJobService: Partial<IJobService> = {
      saveJob: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockSaveJobService);

    const requestBody = {
      jobName: 'Dummy Job Name',
      guardCoverageId: '00000000-0000-0000-0000-000000000000',
      guardServiceId: '00000000-0000-0000-0000-000000000000',
      noOfGuards: 5,
      startDate: '2023-09-10',
      endDate: '2023-09-15',
      jobVenue: 'Dummy Address',
      jobVenueLocationCoordinates: '40.7128, -74.0060',
      jobVenueRadius: '5',
      bookingReason: 'Testing the job func',
      checkList: [
        {
          date: '2021-11-10',
          time: '2021-11-10',
          description: 'hgfhgf',
        },
        {
          date: '2021-11-10',
          time: '2021-11-10',
          description: 'dgfdgfgdg',
        },
      ],
      jobOccurenceDays: [
        {
          startTime: '09:30 AM',
          endTime: '10:30PM',
          day: 'Tue'
        },
        {
          startTime: '09:30 AM',
          endTime: '09:30 PM',
          day: 'Wed'
        },
      ]
    };

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockSaveJobService.saveJob).toHaveBeenCalled();
  });

  it('should confirm(create) job information', async () => {
    const mockConfirmJobService: Partial<IJobService> = {
      confirmJob: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockConfirmJobService);

    const requestBody = {
      jobId: 'Dummy-Job-ID',
    };

    const event = generateEvent(requestBody, 'PATCH');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockConfirmJobService.confirmJob).toHaveBeenCalled();
  });

  it('should get job summary', async () => {
    const mockGetJobSummaryService: Partial<IJobService> = {
      getJobSummary: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetJobSummaryService);

    const event = getJobSummary();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockGetJobSummaryService.getJobSummary).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked save job service for validation error case
    const mockSaveJobService: Partial<IJobService> = {
      saveJob: jest.fn().mockResolvedValue('mockResponse'),
    };

    const requestBody = {
      invalidParam: 1,
    };

    // @ts-ignore
    container.get.mockReturnValue(mockSaveJobService);

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).code).toBe(1);
  });
});
