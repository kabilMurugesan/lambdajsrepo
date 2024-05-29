import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IUserProfileService } from '/opt/node-utils/src/interfaces/services/IUserProfileService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { CreateUserProfileRequest } from '/opt/node-utils/src/dto/UserProfileDTO';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { updateProfileSchema } from '/opt/node-utils/src/validation-schema/userProfileSchema';
import { UserAvailabilityDayRequest } from '/opt/node-utils/src/dto/UserAvailabilityDayDTO';
import { userAvailabilityDaySchema } from '/opt/node-utils/src/validation-schema/userAvailabilityDaySchema';
import { IUserAvailabilityDayService } from '/opt/node-utils/src/interfaces/services/IUserAvailabilityDayService';

import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

// Function to handle PUT request
const handlePutRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);

    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(updateProfileSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IUserProfileService from the container
    const _userService = container.get<IUserProfileService>(
      TYPES.IUserProfileService
    );

    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: CreateUserProfileRequest = body;

    if (createPayload.type == 'successInfo') {
      const response = await _userService.addSuccessInfoToProfile(event);
      return successResponse(response, 'Success Info Updated Successfully');
    }

    // Call the createUserProfile method of the user service
    const response = await _userService.createUserProfile(event, createPayload);

    // Return a success response with the response data
    return successResponse(response, 'Profile updated successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

//HANDLER GET REQUEST
const handleGetRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);
    const type: string | undefined = event.queryStringParameters?.type;

    // Retrieve an instance of IUserProfileService from the container
    const _userProfileService = container.get<IUserProfileService>(
      TYPES.IUserProfileService
    );
    if (type && type != '' && type != undefined && type == 'availability') {
      // If searchKeyword is not provided in the query parameters, throw an error
      const response = await _userProfileService.getUserAvailabilityById(event);

      // Return a success response with the response data
      return successResponse(response, 'user Availability Timings');
    }
    // Call the createUserProfile method of the user service
    const response = await _userProfileService.getUserProfileById(event);

    // Return a success response with the response data
    return successResponse(response, 'user profile');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const saveGuardAvailabilityDays = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(userAvailabilityDaySchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IUserProfileService from the container
    const _userService = container.get<IUserAvailabilityDayService>(
      TYPES.IUserAvailabilityDayService
    );

    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: UserAvailabilityDayRequest = body;

    // Call the createUserProfile method of the user service
    const response: any = await _userService.createUserAvailability(
      event,
      createPayload
    );

    // Return a success response with the response data
    return successResponse(
      response,
      'Guard availability time updated successfully'
    );
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
  if (event.httpMethod === 'PUT') {
    return handlePutRequest(event);
  } else if (event.httpMethod == 'GET') {
    return handleGetRequest(event);
  } else if (event.httpMethod == 'POST') {
    return saveGuardAvailabilityDays(event);
  } else {
    // Default response for other HTTP methods
    return failureResponse(400, 'Bad request: Undefined method');
  }
};
