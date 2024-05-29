import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/UserSignup'; // Update this with the correct path and module name
import { IUserSignupService } from '/opt/node-utils/src/interfaces/services/IUserSignupService';
import container from '/opt/node-utils/src/container';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { BadRequestException } from '/opt/node-utils/src/shared/errors/all.exceptions';

jest.mock('/opt/node-utils/src/container');

const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
  return {
    httpMethod: 'POST',
    path: '/signup',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('User Signup Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should create user', async () => {
    const mockUserProfileService: IUserSignupService = {
      createUserSignup: jest.fn().mockResolvedValue('mockResponse'),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      email: 'assaingypsds@gmail.com',
      guardAccountType: 'INDIVIDUAL',
      phone: '8656504390',
      password: '9898989897',
      userType: 'GUARD',
      cognitoUserId: "757657656746746464"
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(200);
    expect(result).toEqual(
      successResponse('mockResponse', 'signup successfully')
    );
    expect(mockUserProfileService.createUserSignup).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockUserSignupService: IUserSignupService = {
      createUserSignup: jest.fn().mockResolvedValue('mockResponse'),
    };
    const requestBody = {
      emails: 'assaingypsds@gmail.com',
      guardAccountType: 'INDIVIDUAL',
      phone: '8656504390',
      password: '9863865gfgh',
      userType: 'GUARD',
      cognitoUserId: "757657656746746464"
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserSignupService);
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
  });
  it('should handle email error', async () => {
    const errorMessage = 'Email Already Exists';
    const mockUserSignupService: IUserSignupService = {
      createUserSignup: jest
        .fn()
        .mockRejectedValue(new BadRequestException(errorMessage)),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserSignupService);
    const requestBody = {
      email: 'assaingypsds@gmail.com',
      guardAccountType: 'INDIVIDUAL',
      phone: '8656504390',
      password: '9863865gfgh',
      userType: 'GUARD',
      cognitoUserId: "757657656746746464"
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(errorMessage);
  });
});
