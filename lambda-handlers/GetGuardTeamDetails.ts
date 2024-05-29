import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IListService } from '../lambda-layer/node-utils/src/interfaces/services/IAdminListService';

// Function to handle PUT request
const GetGuardTeamDetails = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);
    const id: string | undefined = event.queryStringParameters?.id;

    if (id === undefined) {
      // If searchKeyword is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing id in query parameters');
    }
    const type: string | undefined =
      event.queryStringParameters?.type;
    const jobId: string | undefined =
      event.queryStringParameters?.jobId;

    if (type === undefined && type != "") {
      // If searchKeyword is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing type in query parameters');
    }
    const page: number = event.queryStringParameters?.page
      ? parseInt(event.queryStringParameters.page, 10)
      : 1;
    const pageSize: number = event.queryStringParameters?.pageSize
      ? parseInt(event.queryStringParameters.pageSize, 10)
      : 10;
    // Retrieve an instance of IStateService from the container
    const _stateService = container.get<IListService>(TYPES.IListService);
    const response = await _stateService.getUserDetailsById(
      id,
      type,
      page, pageSize, jobId, event
    );

    // Return a success response with the response data
    return successResponse(response, 'details');
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
  return GetGuardTeamDetails(event);
};
