import {
    Handler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import {
    successResponse,
    failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IListService } from '/opt/node-utils/src/interfaces/services/IAdminListService';

// Function to handle PUT request
const getTeamHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        //console.log(`Lambda handler "${event.path}" started`);
        const searchKeyword: string | undefined =
            event.queryStringParameters?.searchKeyword;

        if (searchKeyword === undefined) {
            // If searchKeyword is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing searchKeyword in query parameters');
        }
        const teamId: string | undefined =
            event.queryStringParameters?.teamId;

        const guardInterestId: any | undefined =
            event.queryStringParameters?.guardInterestId;

        if (teamId === undefined || !teamId) {
            // If searchKeyword is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing teamId in query parameters');
        }
        const page: number = event.queryStringParameters?.page
            ? parseInt(event.queryStringParameters.page, 10)
            : 1;
        const pageSize: number = event.queryStringParameters?.pageSize
            ? parseInt(event.queryStringParameters.pageSize, 10)
            : 10;

        // Retrieve an instance of IListService from the container
        const _getTeamService = container.get<IListService>(TYPES.IListService);
        const response = await _getTeamService.getGuardTeamList(
            searchKeyword,
            teamId,
            page,
            pageSize,
            guardInterestId
        );
        return successResponse(response, 'team guard list');
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        const error = await setAppropriateError(err);
        return failureResponse(error.httpCode, error.message);
    }
};

// Main Lambda function handler
export const handler: Handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        if (event.httpMethod === 'GET') {
            return getTeamHandler(event);
        } else {
            return failureResponse(400, 'Bad request: Undefined method');
        }
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};
