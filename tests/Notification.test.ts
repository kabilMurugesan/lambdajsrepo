import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/Notification'; // Update this with the correct path and module name
import { INotificationService } from '/opt/node-utils/src/interfaces/services/INotificationService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object

const getNotificationList = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/notification',
    queryStringParameters: {
      dateFilter: 'TODAY',
      timeZone: 'America/Los_Angeles',
    },
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

const makeNotificationRead = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'PATCH',
    path: '/notification',
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

  it('should get all notification list', async () => {
    const mockGetNotificationListService: Partial<INotificationService> = {
      getNotificationList: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetNotificationListService);

    const event = getNotificationList();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(
      mockGetNotificationListService.getNotificationList
    ).toHaveBeenCalled();
  });
  it('should update read status of all notification of an user', async () => {
    const mockService: Partial<INotificationService> = {
      makeNotificationRead: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const event = makeNotificationRead();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.makeNotificationRead).toHaveBeenCalled();
  });
});
