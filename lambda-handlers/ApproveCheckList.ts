import {
    Handler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
    successResponse,
    failureResponse,
    failureApiResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { ICheckListService } from '/opt/node-utils/src/interfaces/services/ICheckListService';
import { ApproveCheckListRequest } from '/opt/node-utils/src/dto/CheckList';
import { approveCheckList } from '/opt/node-utils/src/validation-schema/ApproveCheckListSchema';

const handlePostRequest = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the incoming request body as JSON
        event.body = JSON.parse(event.body || '{}');
        const body: any = event.body || {};

        // Validate input against a schema using the ValidationUtils
        const { error, value } = validateInput(approveCheckList, body);
        if (error) {
            return failureResponse(400, error.details[0].message.replace(/"/g, ''));
        }
        // Retrieve an instance of ICheckListService from the container
        const _checkListService = container.get<ICheckListService>(
            TYPES.ICheckListService
        );
        // Prepare a approveCheckList payload from the request body
        const approveCheckListPayload: ApproveCheckListRequest = body;
        // Call the approveCheckList method of the user service
        const response = await _checkListService.approveCheckList(approveCheckListPayload, event);
        if (response.data == '') {
            return failureApiResponse(response.data, response.message);
        }

        // Return a success response with the response data
        return successResponse(response, 'CheckList Approved Sucessfully.');
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
        return handlePostRequest(event);
    }
    // Default response for other HTTP methods
    return failureResponse(400, 'Bad request: Undefined method');
};
