import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/UserProfile'; // Update this with the correct path and module name
// import { IUserSignupService } from "/opt/node-utils/src/interfaces/services/IUserSignupService";
import { IUserAvailabilityDayService } from '/opt/node-utils/src/interfaces/services/IUserAvailabilityDayService';
import container from '/opt/node-utils/src/container';
import { successResponse } from '/opt/node-utils/src/utils/ResponseUtils';
import { BadRequestException } from '/opt/node-utils/src/shared/errors/all.exceptions';

jest.mock('/opt/node-utils/src/container');

const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
  return {
    httpMethod: 'POST',
    path: '/profile',
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

  it('should create userAvailability date', async () => {
    const mockUserProfileService: IUserAvailabilityDayService = {
      createUserAvailability: jest.fn().mockResolvedValue('mockResponse'),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      availabilityDay: [
        {
          weekday: 'Mon',
          startTime: '02:00AM',
          endTime: '03:00PM',
        },
        {
          weekday: 'Tue',
          startTime: '02:00AM',
          endTime: '03:00PM',
        },
      ],
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(200);
    expect(result).toEqual(
      successResponse(
        'mockResponse',
        'userAvailability time created successfully'
      )
    );
    expect(mockUserProfileService.createUserAvailability).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockUserSignupService: IUserAvailabilityDayService = {
      createUserAvailability: jest.fn().mockResolvedValue('mockResponse'),
    };
    const requestBody = {
      availabilityDay: [
        {
          weekday: 'Mon',
          startTime: '02:00AM',
          endTime: '03:00PM',
        },
        {
          startTime: '02:00AM',
          endTime: '03:00PM',
        },
      ],
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
    const mockUserSignupService: IUserAvailabilityDayService = {
      createUserAvailability: jest
        .fn()
        .mockRejectedValue(new BadRequestException(errorMessage)),
    };
    // @ts-ignore
    container.get.mockReturnValue(mockUserSignupService);
    const requestBody = {
      availabilityDay: [
        {
          weekday: 'Mon',
          startTime: '02:00AM',
          endTime: '03:00PM',
        },
        {
          weekday: 'Tue',
          startTime: '02:00AM',
          endTime: '03:00PM',
        },
      ],
    };
    const event = generateEvent(requestBody);
    const context: Context = {} as Context;
    // @ts-ignore
    const result = await handler(event, context);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(errorMessage);
  });
});
