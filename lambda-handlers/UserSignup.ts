import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IUserSignupService } from '/opt/node-utils/src/interfaces/services/IUserSignupService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { CreateUserSignupRequest } from '/opt/node-utils/src/dto/UserSignupDTO';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { userSignupSchema } from '/opt/node-utils/src/validation-schema/userSignupSchema';
import {
  successResponse,
  failureResponse,
  failureApiResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

const handlePostRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Lambda handler "${event.path}" started`);

    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(userSignupSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IUserSignupService from the container
    const _userService = container.get<IUserSignupService>(
      TYPES.IUserSignupService
    );
    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: CreateUserSignupRequest = body;
    // Call the createUserProfile method of the user service
    const response = await _userService.createUserSignup(createPayload);
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'signup successfully');
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
