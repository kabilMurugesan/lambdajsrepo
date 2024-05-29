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
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { favoriteGuardRequest } from '/opt/node-utils/src/dto/JobDTO';
import { favoriteGuardSchema } from '/opt/node-utils/src/validation-schema/FavoriteGuard';
import { IGuardTeamService } from '/opt/node-utils/src/interfaces/services/IGuardTeamService';
// import { IListService } from '../lambda-layer/node-utils/src/interfaces/services/IAdminListService';

// Function to handle PUT request
const FavouriteGuard = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the incoming request body as JSON
        event.body = JSON.parse(event.body || '{}');
        const body: any = event.body || {};

        // Validate input against a schema using the ValidationUtils
        const { error, value } = validateInput(favoriteGuardSchema, body);
        if (error) {
            return failureResponse(400, error.details[0].message.replace(/"/g, ''));
        }

        // Retrieve an instance of IJobService from the container
        const _jobService = container.get<IGuardTeamService>(TYPES.IGuardTeamService);

        // Prepare a SaveJobRequest payload from the request body
        const savePayload: favoriteGuardRequest = body;

        if (savePayload.id != "" && savePayload.id != null && savePayload.id) {
            const response = await _jobService.unFavoriteGuard(event, savePayload);
            return successResponse(response, 'Guard removed from favorite successfully');
        }

        // Call the save job method of the user service
        const response = await _jobService.postFavoriteGuard(event, savePayload);

        // Return a success response with the response data
        return successResponse(response, 'Guard added to favorite successfully');
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};

const getFavouriteGuard = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {

        // Retrieve an instance of IJobService from the container
        const _favoriteGuardService = container.get<IGuardTeamService>(TYPES.IGuardTeamService);

        const page: number = event.queryStringParameters?.page
            ? parseInt(event.queryStringParameters.page, 10)
            : 1;
        const pageSize: number = event.queryStringParameters?.pageSize
            ? parseInt(event.queryStringParameters.pageSize, 10)
            : 10;

        // Call the createUserProfile method of the user service
        const response = await _favoriteGuardService.getFavoriteGuard(event, page, pageSize);

        // Return a success response with the response data
        return successResponse(response, 'Favourite Guard List');
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
    try {
        if (event.httpMethod === 'POST') {
            return FavouriteGuard(event);
        }
        if (event.httpMethod === 'GET') {
            return getFavouriteGuard(event);
        }
        else {
            return failureResponse(400, 'Bad request: Undefined method');
        }
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};
