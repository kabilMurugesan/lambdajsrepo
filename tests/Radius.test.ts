
import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/Radius'; // Update this with the correct path and module name
import container from '/opt/node-utils/src/container';
import { IRadiusService } from '/opt/node-utils/src/interfaces/services/IRadiusService';
import { editRadiusRequest } from '/opt/node-utils/src/dto/RadiusDTO';
import { Settings } from '/opt/node-utils/src/entities/Settings';

jest.mock('/opt/node-utils/src/container');

const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
    return {
        httpMethod: 'POST',
        path: '/radius',
        body: JSON.stringify(requestBody),
        requestContext: {
            accountId: 'dummy-account-id',
            apiId: 'dummy-api-id',
        },
    } as APIGatewayProxyEvent;
};

const generatePutEvent = (requestBody: any): APIGatewayProxyEvent => {
    return {
        httpMethod: 'PUT',
        path: '/radius',
        body: JSON.stringify(requestBody),
        requestContext: {
            accountId: 'dummy-account-id',
            apiId: 'dummy-api-id',
        },
    } as APIGatewayProxyEvent;
};
const generateGetRadiusEvent = (
    requestBody: any
): APIGatewayProxyEvent => {
    return {
        httpMethod: 'GET',
        path: '/radius',
        requestContext: {
            accountId: 'dummy-account-id',
            apiId: 'dummy-api-id',
        },
    } as APIGatewayProxyEvent;
};
describe('Radius Handler', () => {
    beforeEach(() => {
        // Reset the mock implementation before each test
        jest.clearAllMocks();
    });

    it('should create radius', async () => {
        const mockUserProfileService: IRadiusService = {
            createSettingsRequest: jest.fn().mockResolvedValue('mockResponse'),
            getSettings: function (): Promise<Settings> {
                throw new Error('Function not implemented.');
            },
            deleteSettings: function (id: string): Promise<any> {
                throw new Error('Function not implemented.');
            },
            editSettings: function (editRadiusRequest: editRadiusRequest): Promise<any> {
                throw new Error('Function not implemented.');
            }
        };
        // @ts-ignore
        container.get.mockReturnValue(mockUserProfileService);
        const requestBody = {
            values: [
                {
                    type: "job",
                    value: "8",
                }],
        };
        const event = generateEvent(requestBody);
        const context: Context = {} as Context;
        // @ts-ignore
        const result = await handler(event, context);
        expect(result.statusCode).toBe(200);
        expect(mockUserProfileService.createSettingsRequest).toHaveBeenCalled();
    });

    it('should handle validation error', async () => {
        // Mocked user profile service for validation error case
        const mockUserSignupService: IRadiusService = {
            createSettingsRequest: jest.fn().mockResolvedValue('mockResponse'),
            getSettings: function (): Promise<Settings> {
                throw new Error('Function not implemented.');
            },
            deleteSettings: function (id: string): Promise<any> {
                throw new Error('Function not implemented.');
            },
            editSettings: function (editRadiusRequest: editRadiusRequest): Promise<any> {
                throw new Error('Function not implemented.');
            }
        };
        const requestBody = {
            values: [
                {
                    type: "hgfytfdtyf",
                    value: "8",
                }],
        };
        // @ts-ignore
        container.get.mockReturnValue(mockUserSignupService);
        const event = generateEvent(requestBody);
        const context: Context = {} as Context;
        // @ts-ignore
        const result = await handler(event, context);
        expect(result.statusCode).toBe(400);
    });
    it('should update radius', async () => {
        const mockUserProfileService: IRadiusService = {
            createSettingsRequest: function (): Promise<Settings> {
                throw new Error('Function not implemented.');
            },
            getSettings: function (): Promise<Settings> {
                throw new Error('Function not implemented.');
            },
            deleteSettings: function (id: string): Promise<any> {
                throw new Error('Function not implemented.');
            },
            editSettings: jest.fn().mockResolvedValue('mockResponse'),
        };
        // @ts-ignore
        container.get.mockReturnValue(mockUserProfileService);
        const requestBody = {

            type: "job",
            value: "8",
            id: "3087b8cf-8900-46af-9b0d-980a3b20dbb9"
        }

        const event = generatePutEvent(requestBody);
        const context: Context = {} as Context;
        // @ts-ignore
        const result = await handler(event, context);
        expect(result.statusCode).toBe(200);
        expect(mockUserProfileService.editSettings).toHaveBeenCalled();
    });
    it('should get all radius', async () => {
        const mockGetJobInterestService: Partial<IRadiusService> = {
            getSettings: jest.fn().mockResolvedValue('mockResponse'),
        };

        // @ts-ignore
        container.get.mockReturnValue(mockGetJobInterestService);

        const event = generateGetRadiusEvent({});
        const context: Context = {} as Context;

        // @ts-ignore
        const result = await handler(event, context);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).data).toEqual('mockResponse');
        expect(mockGetJobInterestService.getSettings).toHaveBeenCalled();
    });

});

