import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/Chat'; // Update this with the correct path and module name
import { IChatService } from '/opt/node-utils/src/interfaces/services/IChatService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

const getAllChats = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/chat',
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

const generateEvent = (requestBody: any, method: any): APIGatewayProxyEvent => {
  return {
    httpMethod: method,
    path: '/chat',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('Job Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should list chats for logged in user', async () => {
    const mockService: Partial<IChatService> = {
      getAllChats: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const event = getAllChats();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.getAllChats).toHaveBeenCalled();
  });

  it('should create a chat room', async () => {
    const mockService: Partial<IChatService> = {
      createChat: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const requestBody = {
      userId: '00000000-0000-0000-0000-000000000000',
    };

    const event = generateEvent(requestBody, 'POST');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.createChat).toHaveBeenCalled();
  });

  it('should make conversation read by room', async () => {
    const mockService: Partial<IChatService> = {
      markConversationReadByChat: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockService);

    const requestBody = {
      chatId: '00000000-0000-0000-0000-000000000000',
    };

    const event = generateEvent(requestBody, 'PUT');
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockService.markConversationReadByChat).toHaveBeenCalled();
  });
});
