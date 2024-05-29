import {
    Handler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import { IJobService } from '/opt/node-utils/src/interfaces/services/IJobService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
    guardPunchTimeRequest,
} from '/opt/node-utils/src/dto/JobDTO';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
    successResponse,
    failureResponse,
    warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { guardPunchInTimeSchema } from '/opt/node-utils/src/validation-schema/GuardCoordinatesSchema';

const guardPunchInTime = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the incoming request body as JSON
        event.body = JSON.parse(event.body || '{}');
        const body: any = event.body || {};

        // Validate input against a schema using the ValidationUtils
        const { error, value } = validateInput(guardPunchInTimeSchema, body);
        if (error) {
            return failureResponse(400, error.details[0].message.replace(/"/g, ''));
        }

        // Retrieve an instance of IJobService from the container
        const _jobService = container.get<IJobService>(TYPES.IJobService);

        // Prepare a SaveJobRequest payload from the request body
        const guardPunchCoordinatesPayload: guardPunchTimeRequest = body;

        // Call the guard punchin method of the user service
        const response = await _jobService.guardPunchTime(event, guardPunchCoordinatesPayload);

        if (response.data = "" || response.message) {
            return warningResponse(response.data, response.message);
        }

        // Return a success response with the response data
        return successResponse(response, 'Job Coordinates Saved Successfully');
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
    if (event.httpMethod === 'POST') {
        return guardPunchInTime(event);
    } else {
        return failureResponse(400, 'Bad request: Undefined method');
    }
};
