import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IGuardTeamService } from '/opt/node-utils/src/interfaces/services/IGuardTeamService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { SaveTeamMembersRequest } from '/opt/node-utils/src/dto/GuardTeamDTO';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { saveTeamMembersSchema } from '/opt/node-utils/src/validation-schema/guardTeamSchema';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

// Function to handle PUT request
const getAllGuards = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);

    const searchKeyword: string | undefined =
      event.queryStringParameters?.searchKeyword;

    if (searchKeyword === undefined) {
      // If searchKeyword is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing searchKeyword in query parameters');
    }

    // Retrieve an instance of IGuardTeamService from the container
    const _guardTeamService = container.get<IGuardTeamService>(
      TYPES.IGuardTeamService
    );

    // Call the createUserProfile method of the user service
    const response = await _guardTeamService.getAllGuards(searchKeyword, event);

    // Return a success response with the response data
    return successResponse(response, 'Guards lists');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const saveTeamMembers = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(saveTeamMembersSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IGuardTeamService from the container
    const _guardTeamService = container.get<IGuardTeamService>(
      TYPES.IGuardTeamService
    );

    // Prepare a SaveTeamMembersRequest payload from the request body
    const savePayload: SaveTeamMembersRequest = body;

    // Call the save Team Members method of the user service
    const response = await _guardTeamService.saveTeamMembers(
      event,
      savePayload
    );

    // Return a success response with the response data
    return successResponse(response, 'Team Members saved successfully');
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
    return getAllGuards(event);
  } else if (event.httpMethod === 'POST') {
    return saveTeamMembers(event);
  } else {
    return failureResponse(400, 'Bad request: Undefined method');
  }
};
