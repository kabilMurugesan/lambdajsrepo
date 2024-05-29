import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IVerifyOtpService } from '/opt/node-utils/src/interfaces/services/IVerifyOtpService';
import { VerifyOtpRequest } from '/opt/node-utils/src/dto/VerifyOtpDto';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { verifyOtp } from '/opt/node-utils/src/validation-schema/verifyOtpSchema';
import {
  successResponse,
  failureResponse,
  warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

const verifyOtpRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(verifyOtp, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IUserSignupService from the container
    const _userService = container.get<IVerifyOtpService>(
      TYPES.IVerifyOtpService
    );
    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: VerifyOtpRequest = body;
    // Call the createUserProfile method of the user service
    const response = await _userService.verifyOtp(createPayload);
    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }
    // Return a success response with the response data
    return successResponse(response, 'Otp has been verified successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const ForgetPasswordRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    const email: string | undefined =
      event.queryStringParameters?.email;

    if (email === undefined) {
      // If searchKeyword is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing email in query parameters');
    }
    const type: string | undefined =
      event.queryStringParameters?.type;
    // Retrieve an instance of IUserSignupService from the container
    const _userService = container.get<IVerifyOtpService>(
      TYPES.IVerifyOtpService
    );
    // Call the createUserProfile method of the user service
    const response = await _userService.forgetPassword(email, type);
    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }
    // Return a success response with the response data
    return successResponse(response, "User Exists.");
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
    return verifyOtpRequest(event);
  }
  else if (event.httpMethod === 'GET') {
    return ForgetPasswordRequest(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
