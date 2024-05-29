import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/UserProfile'; // Update this with the correct path and module name
import { IUserProfileService } from '/opt/node-utils/src/interfaces/services/IUserProfileService';
import container from '/opt/node-utils/src/container';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
  return {
    httpMethod: 'PUT',
    path: '/profile',
    body: JSON.stringify(requestBody),
    requestContext: {
      accountId: 'dummy-account-id',
      apiId: 'dummy-api-id',
    },
  } as APIGatewayProxyEvent;
};

describe('User Profile Handler', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
  });

  it('should update profile information', async () => {
    const mockUserProfileService: Partial<IUserProfileService> = {
      createUserProfile: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      firstName: 'dummy-first-name',
      lastName: 'dummy-last-name',
      addressLine1: 'dummy-address-line1',
      addressLine2: 'dummy-address-line2',
      stateId: 'dummy-state-id',
      cityId: 'dummy-city-id',
      zipCode: '00000',
      profilePhotoFileName: 'dummy-photo.png',
      socialSecurityNo: '123456789',
      srbStateId: "76576576sadgghsd"
    };

    const event = generateEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockUserProfileService.createUserProfile).toHaveBeenCalled();
  });

  it('should update aPost certificate details', async () => {
    const mockUserProfileService: Partial<IUserProfileService> = {
      createUserProfile: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      aPostInitiallyCertifiedDate: '01-01-2023',
      aPostAnnualFireArmQualificationDate: '01-01-2023',
      aPostLicenseNo: 'dummy-no',
      aPostCertFileName: 'dummy-file-name.pdf',
    };

    const event = generateEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockUserProfileService.createUserProfile).toHaveBeenCalled();
  });

  it('should update Alabama security regulatory certificate details', async () => {
    const mockUserProfileService: Partial<IUserProfileService> = {
      createUserProfile: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      srbLicenseIssueDate: '01-01-2023',
      srbLicenseExpiryDate: '12-01-2023',
      srbLicenseNo: 'dummy-no',
      srbCertFileName: 'dummy-file-name.pdf',
    };

    const event = generateEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockUserProfileService.createUserProfile).toHaveBeenCalled();
  });

  it('should update guard job rate', async () => {
    const mockUserProfileService: Partial<IUserProfileService> = {
      createUserProfile: jest.fn().mockResolvedValue('mockResponse'),
    };

    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const requestBody = {
      guardJobRate: 10.26,
    };

    const event = generateEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual('mockResponse');
    expect(mockUserProfileService.createUserProfile).toHaveBeenCalled();
  });

  it('should handle validation error', async () => {
    // Mocked user profile service for validation error case
    const mockUserProfileService: Partial<IUserProfileService> = {
      createUserProfile: jest.fn().mockResolvedValue('mockResponse'),
    };

    const requestBody = {
      invalidParam: 1,
    };

    // @ts-ignore
    container.get.mockReturnValue(mockUserProfileService);

    const event = generateEvent(requestBody);
    const context: Context = {} as Context;

    // @ts-ignore
    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).code).toBe(1);
  });
});
