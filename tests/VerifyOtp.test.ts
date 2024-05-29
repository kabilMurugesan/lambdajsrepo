import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/VerifyOtp'; // Update this with the correct path and module name
import { IVerifyOtpService } from '/opt/node-utils/src/interfaces/services/IVerifyOtpService';
import container from '/opt/node-utils/src/container';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { BadRequestException } from '/opt/node-utils/src/shared/errors/all.exceptions';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
  return {
    httpMethod: 'POST',
    path: '/verify-otp',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('Verify otp Code', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });
  it('verify verification code', async () => {
    const mockUserProfileService: IVerifyOtpService = {
      verifyOtp: jest.fn().mockResolvedValue('mockResponse'),
      forgetPassword: jest.fn().mockResolvedValue('mockResponse'),
      // forgetPassword: function (email: string): Promise<any> {
      //   throw new Error('Function not implemented.');
      // }
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);
    const requestBody = {
      email: 'hhhy@gmail.com',
      type: "email"
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(200);
    expect(result).toEqual(
      successResponse('mockResponse', 'Otp has been verified successfully.')
    );
    expect(mockUserProfileService.verifyOtp).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockUserProfileService: IVerifyOtpService = {
      verifyOtp: jest.fn().mockRejectedValue(new Error('Validation error')),
      forgetPassword: jest.fn().mockResolvedValue('mockResponse')
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);
    const requestBody = {
      emails: 1,
      type: "email"
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('email is required');
  });
});
