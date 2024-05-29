
import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/GuardPunchInTime'; // Update this with the correct path and module name
import container from '/opt/node-utils/src/container';
import { IJobRepository } from '/opt/node-utils/src/interfaces/repo/IJobRepository';

jest.mock('/opt/node-utils/src/container');

const generateEvent = (requestBody: any): APIGatewayProxyEvent => {
    return {
        httpMethod: 'POST',
        path: '/guard-time',
        body: JSON.stringify(requestBody),
        requestContext: {
            accountId: 'dummy-account-id',
            apiId: 'dummy-api-id',
        },
    } as APIGatewayProxyEvent;
};
describe('Add Job Coordinates', () => {
    beforeEach(() => {
        // Reset the mock implementation before each test
        jest.clearAllMocks();
    });

    it('should insert job coordinates punch in time', async () => {
        const requestBody = {
            jobId: "04830ccf-3aa0-42b8-ad15-8fa8c92d04e7",
            guardCoordinates: "40.7128, -74.0060",
            isPunch: "true",
            teamId: ""
        };

        const mockSaveJobInterestService: Partial<IJobRepository> = {
            guardPunchTime: jest.fn().mockResolvedValue('mockResponse'),
        };

        // @ts-ignore
        container.get.mockReturnValue(mockSaveJobInterestService);

        const event = generateEvent(requestBody); // Pass the request body
        const context: Context = {} as Context;

        // @ts-ignore
        const result = await handler(event, context);
        expect(result.statusCode).toBe(200);
    });

    it('bad request', async () => {
        const requestBody = {
            jobId: "04830ccf-3aa0-42b8-ad15-8fa8c92d04e7",
            isPunch: "true",
            teamId: ""
        };

        const mockSaveJobInterestService: Partial<IJobRepository> = {
            guardPunchTime: jest.fn().mockResolvedValue('mockResponse'),
        };

        // @ts-ignore
        container.get.mockReturnValue(mockSaveJobInterestService);

        const event = generateEvent(requestBody); // Pass the request body
        const context: Context = {} as Context;

        // @ts-ignore
        const result = await handler(event, context);
        expect(result.statusCode).toBe(400);
    });
});
