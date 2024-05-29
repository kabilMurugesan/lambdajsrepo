import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/GuardTeam'; // Update this with the correct path and module name
import { IGuardTeamService } from '/opt/node-utils/src/interfaces/services/IGuardTeamService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const getAllGuards = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/guard-team',
    queryStringParameters: {
      searchKeyword: 'dummy-text',
    },
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

const getAllGuardsWithoutQueryString = (): APIGatewayProxyEvent => {
  return {
    httpMethod: 'GET',
    path: '/guard-team',
    queryStringParameters: {},
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as unknown as APIGatewayProxyEvent;
};

const generateSaveTeamMembersEvent = (
  requestBody: any
): APIGatewayProxyEvent => {
  return {
    httpMethod: 'POST',
    path: '/guard-team',
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
    body: JSON.stringify(requestBody), // Pass the request body as JSON
  } as APIGatewayProxyEvent;
};

describe('get-all-guards Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should get all guards with search keyword', async () => {
    const mockGetAllGuardsService: Partial<IGuardTeamService> = {
      getAllGuards: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetAllGuardsService);

    const event = getAllGuards();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockGetAllGuardsService.getAllGuards).toHaveBeenCalled();
  });

  it('should get all guards without search keyword', async () => {
    const mockGetAllGuardsService: Partial<IGuardTeamService> = {
      getAllGuards: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockGetAllGuardsService);

    const event = getAllGuardsWithoutQueryString();
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).code).toBe(1);
  });
});
describe('save-team-members Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should save team members with request params', async () => {
    const requestBody = {
      guardEmails: ['dummyemail01@dummy.com', 'dummyemail02@dummy.com'],
    };

    const mockSaveTeamMembersService: Partial<IGuardTeamService> = {
      saveTeamMembers: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockSaveTeamMembersService);

    const event = generateSaveTeamMembersEvent(requestBody); // Pass the request body
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
  });
});
