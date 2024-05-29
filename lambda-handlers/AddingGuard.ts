import {
    Handler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import { IJobService } from '/opt/node-utils/src/interfaces/services/IJobService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
    successResponse,
    failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { saveAddingJobSchema } from '/opt/node-utils/src/validation-schema/AddingGuardsSchema';
import { SaveJobGuardsRequest } from '/opt/node-utils/src/dto/AddingJobGuards';

const saveGuard = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the incoming request body as JSON
        event.body = JSON.parse(event.body || '{}');
        const body: any = event.body || {};

        // Validate input against a schema using the ValidationUtils
        const { error, value } = validateInput(saveAddingJobSchema, body);
        if (error) {
            return failureResponse(400, error.details[0].message.replace(/"/g, ''));
        }
        const _jobService = container.get<IJobService>(TYPES.IJobService);

        // Prepare a SaveJobRequest payload from the request body
        const savePayload: SaveJobGuardsRequest = body;

        // Call the save job method of the user service
        const response = await _jobService.saveJobGuard(event, savePayload);

        // Return a success response with the response data
        return successResponse(response, 'Guard saved successfully');
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
        return saveGuard(event);
    } else {
        return failureResponse(400, 'Bad request: Undefined method');
    }
};
