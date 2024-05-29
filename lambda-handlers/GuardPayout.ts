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
import { IGuardPayoutService } from '/opt/node-utils/src/interfaces/services/IGuardPayoutService';
import {
  UpdateGuardPayoutRequest,
  CreateManualPayoutRequest,
} from '/opt/node-utils/src/dto/GuardPayoutDTO';
import {
  updateGuardPayoutSchema,
  createManualPayoutSchema,
} from '/opt/node-utils/src/validation-schema/GuardPayoutSchema';

const updatePayoutConfig = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(updateGuardPayoutSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IGuardPayoutService from the container
    const _guardPayoutService = container.get<IGuardPayoutService>(
      TYPES.IGuardPayoutService
    );
    // Prepare a GuardPayouts payload from the request body
    const guardPayoutPayload: UpdateGuardPayoutRequest = body;
    // Call the GuardPayouts method of the user service
    const response = await _guardPayoutService.updatePayoutConfig(
      event,
      guardPayoutPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Payout config updated successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const createManualPayout = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(createManualPayoutSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IGuardPayoutService from the container
    const _guardPayoutService = container.get<IGuardPayoutService>(
      TYPES.IGuardPayoutService
    );
    // Prepare a GuardPayouts payload from the request body
    const guardPayoutPayload: CreateManualPayoutRequest = body;
    // Call the GuardPayouts method of the user service
    const response = await _guardPayoutService.createManualPayout(
      event,
      guardPayoutPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Manual payout created successfully.');
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
    return updatePayoutConfig(event);
  } else if (event.httpMethod === 'POST') {
    return createManualPayout(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
