import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../lambda-handlers/AdminList'; // Update this with the correct path and module name
import container from '/opt/node-utils/src/container';
import { IListService } from '../lambda-layer/node-utils/src/interfaces/services/IAdminListService';

jest.mock('/opt/node-utils/src/container'); // Mocking the container module

// Utility function to generate a valid event object
const generateGetCompanyListEvent = (
    searchKeyword: string,
    page: number,
    pageSize: number
): APIGatewayProxyEvent => {
    return {
        httpMethod: 'GET',
        path: `/list?searchKeyword=${searchKeyword},page=${page},pageSize=${pageSize}`,
        requestContext: {
            accountId: 'dummy-account-id',
            apiId: 'dummy-api-id',
        },
    } as APIGatewayProxyEvent;
};

describe('guard team Handler', () => {
    beforeEach(() => {
        // Reset the mock implementation before each test
        jest.clearAllMocks();
    });

    it('should get all guard team list', async () => {
        const mockGetJobInterestService: Partial<IListService> = {
            getGuardList: jest.fn().mockResolvedValue('mockResponse'),
        };

        // @ts-ignore
        container.get.mockReturnValue(mockGetJobInterestService);

        const event = generateGetCompanyListEvent('validSearchKeyword', 1, 10); // Provide a valid search keyword
        const context: Context = {} as Context;

        // @ts-ignore
        const result = await handler(event, context);

        expect(result.statusCode).toBe(400);
        expect(mockGetJobInterestService.getGuardList);
    });
});
