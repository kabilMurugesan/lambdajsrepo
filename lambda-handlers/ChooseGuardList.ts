import {
    Handler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
    successResponse,
    failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IGuardTeamService } from '/opt/node-utils/src/interfaces/services/IGuardTeamService';
// import { IListService } from '../lambda-layer/node-utils/src/interfaces/services/IAdminListService';

// Function to handle PUT request
const ChooseGuardList = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        //console.log(`Lambda handler "${event.path}" started`);
        const jobId: string | undefined =
            event.queryStringParameters?.jobId;

        const teamId: string | undefined =
            event.queryStringParameters?.teamId;
        const type: string | undefined =
            event.queryStringParameters?.type;

        const searchKeyword: string | undefined =
            event.queryStringParameters?.searchKeyword;

        if (type === undefined && type != "") {
            // If searchKeyword is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing type in query parameters');
        }
        const page: number = event.queryStringParameters?.page
            ? parseInt(event.queryStringParameters.page, 10)
            : 1;
        const pageSize: number = event.queryStringParameters?.pageSize
            ? parseInt(event.queryStringParameters.pageSize, 10)
            : 10;

        // Retrieve an instance of IGuardTeamService from the container
        const _chooseGuardService = container.get<IGuardTeamService>(TYPES.IGuardTeamService);
        const response = await _chooseGuardService.ChooseGuardList(
            jobId,
            type,
            event,
            teamId,
            page,
            pageSize,
            searchKeyword
        );

        // Return a success response with the response data
        return successResponse(response, 'guards list');
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};

// Main Lambda function handler
export const handler: Handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    return ChooseGuardList(event);
};
