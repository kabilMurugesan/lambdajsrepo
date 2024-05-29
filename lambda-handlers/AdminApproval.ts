import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
  successResponse,
  failureResponse,
  warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IAdminService } from '/opt/node-utils/src/interfaces/services/IAdminService';
import { AdminApproveRequest, AdminDeleteUserRequest } from '/opt/node-utils/src/dto/AdminDTO';
import { AdminRequest, AdminUserDeleteRequest } from '/opt/node-utils/src/validation-schema/AdminApproveSchema';

const handlePostRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Lambda handler "${event.path}" started`);
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(AdminRequest, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IUserSignupService from the container
    const _userService = container.get<IAdminService>(TYPES.IAdminService);
    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: AdminApproveRequest = body;

    // Call the createUserProfile method of the user service
    const response = await _userService.guardApprove(createPayload, event);
    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(
      response,
      'Guard Certificate Status Updated Successfully'
    );
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const handlePutRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Lambda handler "${event.path}" started`);
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(AdminUserDeleteRequest, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IUserSignupService from the container
    const _userService = container.get<IAdminService>(TYPES.IAdminService);
    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: AdminDeleteUserRequest = body;

    // Call the createUserProfile method of the user service
    const response = await _userService.guardDeleteUser(createPayload, event);
    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(
      response,
      'Guard Deleted Successfully'
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
  if (event.httpMethod === 'POST') {
    return handlePostRequest(event);
  }
  if (event.httpMethod === 'PUT') {
    return handlePutRequest(event);
  }
  return failureResponse(400, 'Bad request: Undefined method');
};
