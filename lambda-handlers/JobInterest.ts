import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IUserProfileService } from '/opt/node-utils/src/interfaces/services/IUserProfileService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { saveJobInterestSchema } from '/opt/node-utils/src/validation-schema/userProfileSchema';
import { SaveJobInterestRequest } from '/opt/node-utils/src/dto/UserProfileDTO';

// Function to handle PUT request
const getJobInterest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve an instance of IUserProfileService from the container
    const _userProfileService = container.get<IUserProfileService>(
      TYPES.IUserProfileService
    );

    // Call the createUserProfile method of the user service
    const response = await _userProfileService.getJobInterest(event);

    // Return a success response with the response data
    return successResponse(response, 'Job interest lists');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const saveJobInterest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);

    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(saveJobInterestSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IUserProfileService from the container
    const _userProfileService = container.get<IUserProfileService>(
      TYPES.IUserProfileService
    );

    // Prepare a SaveJobInterestRequest payload from the request body
    const savePayload: SaveJobInterestRequest = body;

    // Call the createUserProfile method of the user service
    const response = await _userProfileService.saveJobInterest(
      event,
      savePayload
    );

    // Return a success response with the response data
    return successResponse(response, 'Job Interests saved successfully');
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
  if (event.httpMethod === 'GET') {
    return getJobInterest(event);
  } else if (event.httpMethod === 'POST') {
    return saveJobInterest(event);
  } else {
    return failureResponse(400, 'Bad request: Undefined method');
  }
};
