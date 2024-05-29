import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { INotificationService } from '/opt/node-utils/src/interfaces/services/INotificationService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

const list = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const page: number = event.queryStringParameters?.page
      ? parseInt(event.queryStringParameters.page, 10)
      : 1;
    const pageSize: number = event.queryStringParameters?.pageSize
      ? parseInt(event.queryStringParameters.pageSize, 10)
      : 10;
    const dateFilter: string | undefined =
      event.queryStringParameters?.dateFilter;
    const timeZone: string | undefined = event.queryStringParameters?.timeZone;

    // if (!dateFilter) {
    //   return failureResponse(400, 'Missing dateFilter in query parameters');
    // } else if (!timeZone) {
    //   return failureResponse(400, 'Missing timeZone in query parameters');
    // }
    // Retrieve an instance of INotificationService from the container
    const _notificationService = container.get<INotificationService>(
      TYPES.INotificationService
    );

    const response = await _notificationService.getNotificationList(
      event,
      page,
      pageSize,
      dateFilter,
      timeZone
    );

    // Return a success response with the response data
    return successResponse(response, 'Notification List');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};
const makeNotificationRead = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Retrieve an instance of INotificationService from the container
    const _notificationService = container.get<INotificationService>(
      TYPES.INotificationService
    );

    // Call the confirm job method of the user service
    const response = await _notificationService.makeNotificationRead(
      event,
      body
    );

    // Return a success response with the response data
    return successResponse(
      response,
      'Notification read status updated successfully'
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
  if (event.httpMethod === 'GET') {
    return list(event);
  } else if (event.httpMethod === 'PATCH') {
    return makeNotificationRead(event);
  } else {
    return failureResponse(400, 'Bad request: Undefined method');
  }
};
