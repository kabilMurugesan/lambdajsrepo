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
import { IListService } from '../lambda-layer/node-utils/src/interfaces/services/IAdminListService';

// Function to handle PUT request
const stateHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        // Retrieve an instance of IAdminService from the container
        const _adminService = container.get<IListService>(TYPES.IListService);
        const type: string | undefined = event.queryStringParameters?.type;
        const resolvedType: string = type || "defaultType";
        const response = await _adminService.getDashboard(resolvedType);
        return successResponse(response, 'dashboard');
    }
    catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
}

// Main Lambda function handler
export const handler: Handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    return stateHandler(event);
};
