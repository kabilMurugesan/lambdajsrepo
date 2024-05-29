import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/ResendOtp';
import { IResendOtpService } from '/opt/node-utils/src/interfaces/services/IResendOtpService';
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
    path: '/resend-otp',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('Resend Verification Code', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });
  it('should resend the verification code', async () => {
    const mockUserProfileService: IResendOtpService = {
      createResendOtp: jest.fn().mockResolvedValue('mockResponse'),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);
    const requestBody = {
      email: 'hhhy@gmail.com',
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(200);
    expect(result).toEqual(
      successResponse(
        'mockResponse',
        'Verification code sent to your registered email'
      )
    );
    expect(mockUserProfileService.createResendOtp).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockUserProfileService: IResendOtpService = {
      createResendOtp: jest
        .fn()
        .mockRejectedValue(new Error('Validation error')),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);
    const requestBody = {
      emails: 1,
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('email is required');
  });

  it('should handle maximum attempts exceeded error', async () => {
    // Mocked user profile service for maximum attempts exceeded error case
    const mockUserProfileService: IResendOtpService = {
      createResendOtp: jest
        .fn()
        .mockRejectedValue(
          new BadRequestException(
            'Maximum attempts exceeded. Please try after sometime.'
          )
        ),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);
    const requestBody = {
      email: 'hhhy@gmail.com',
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      'Maximum attempts exceeded. Please try after sometime.'
    );
    expect(mockUserProfileService.createResendOtp).toHaveBeenCalled();
  });
});
