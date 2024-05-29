import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/ApproveCheckList';
import container from '/opt/node-utils/src/container';
import { ICheckListService } from '/opt/node-utils/src/interfaces/services/ICheckListService';

jest.mock('/opt/node-utils/src/container');

const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
  return {
    httpMethod: 'POST',
    path: '/approve-checklist',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('UserAvailability Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should Approve date', async () => {
    const mockUserProfileService: ICheckListService = {
      approveCheckList: jest.fn().mockResolvedValue('mockResponse'),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      checkListId: '09a4c575-8821-476f-a558-160699d25062',
      status: 1,
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    console.log(result);
    expect(result.statusCode).toBe(200);
    expect(mockUserProfileService.approveCheckList).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockUserSignupService: ICheckListService = {
      approveCheckList: jest.fn().mockResolvedValue('mockResponse'),
    };
    const requestBody = {
      checkListIds: '09a4c575-8821-476f-a558-160699d25062',
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserSignupService);
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
  });
});
