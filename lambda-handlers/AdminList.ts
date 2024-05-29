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
const stateHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //console.log(`Lambda handler "${event.path}" started`);
    const searchKeyword: string | undefined =
      event.queryStringParameters?.searchKeyword;
    const guardInterestId: any | undefined =
      event.queryStringParameters?.guardInterestId;

    const platform: string | undefined =
      event.queryStringParameters?.platform;

    if (searchKeyword === undefined) {
      // If searchKeyword is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing searchKeyword in query parameters');
    }
    const page: number = event.queryStringParameters?.page
      ? parseInt(event.queryStringParameters.page, 10)
      : 1;
    const pageSize: number = event.queryStringParameters?.pageSize
      ? parseInt(event.queryStringParameters.pageSize, 10)
      : 10;

    // Retrieve an instance of IStateService from the container
    const _stateService = container.get<IListService>(TYPES.IListService);
    const type: string | undefined = event.queryStringParameters?.type;
    if (type == 'teamguard') {
      const teamId: string | undefined = event.queryStringParameters?.teamId;
      if (teamId === undefined) {
        return failureResponse(400, 'Missing teamId in query parameters');
      }
      const response = await _stateService.getGuardTeamList(
        searchKeyword,
        teamId,
        page,
        pageSize,
        guardInterestId, platform
      );
      return successResponse(response, 'team guard list');
    }
    if (type == 'team') {
      // Call the createUserProfile method of the user service
      const response = await _stateService.getGuardList(
        searchKeyword,
        page,
        pageSize,
        platform
      );

      // Return a success response with the response data
      return successResponse(response, 'team list');
    }
    if (type == "transaction") {
      // Call the getTransction method of the admin list service
      const response = await _stateService.getTransactionList(
        page,
        pageSize,
      );

      // Return a success response with the response data
      return successResponse(response, 'list');
    }
    if (type == "guard") {
      // Call the createUserProfile method of the user service
      const response = await _stateService.getGuardsList(
        searchKeyword,
        page,
        pageSize,
        type,
        guardInterestId,
        platform
      );

      // Return a success response with the response data
      return successResponse(response, 'list');
    }
    if (type == "job") {
      // Call the createUserProfile method of the user service
      const response = await _stateService.getJobList(
        searchKeyword,
        page,
        pageSize
      );

      // Return a success response with the response data
      return successResponse(response, 'list');
    }
    if (type == "ratings") {
      // Call the createUserProfile method of the user service
      const response = await _stateService.getRatingsReview(
        page,
        pageSize
      );

      // Return a success response with the response data
      return successResponse(response, 'list');
    }
    const response = await _stateService.getAllList(
      searchKeyword,
      page,
      pageSize,
      platform
    );

    // Return a success response with the response data
    return successResponse(response, 'guard list');
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
