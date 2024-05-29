import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IStateService } from '/opt/node-utils/src/interfaces/services/IStateService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

// Function to handle PUT request
const stateHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);

    // Retrieve an instance of IStateService from the container
    const _stateService = container.get<IStateService>(TYPES.IStateService);

    // Call the createUserProfile method of the user service
    const response = await _stateService.getStateList();

    // Return a success response with the response data
    return successResponse(response, 'State list');
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
  return stateHandler(event);
};
