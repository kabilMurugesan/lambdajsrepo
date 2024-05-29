import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IResendOtpService } from '../lambda-layer/node-utils/src/interfaces/services/IResendOtpService';
import { ResendOtpRequest } from '../lambda-layer/node-utils/src/dto/ResendOtpDTO';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { resendOtp } from '/opt/node-utils/src/validation-schema/verifyOtpSchema';
import {
  successResponse,
  failureResponse,
  warningResponse,
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
    const { error, value } = validateInput(resendOtp, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IUserSignupService from the container
    const _userService = container.get<IResendOtpService>(
      TYPES.IResendOtpService
    );
    // Prepare a CreateUserProfileRequest payload from the request body
    const createPayload: ResendOtpRequest = body;

    // Call the createUserProfile method of the user service
    const response = await _userService.createResendOtp(createPayload);
    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(
      response,
      'Verification code sent to your registered email'
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
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
