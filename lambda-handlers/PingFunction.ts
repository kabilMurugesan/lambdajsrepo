import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { successResponse } from '/opt/node-utils/src/utils/ResponseUtils';

// Function to handle PUT request
const pingHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Return a success response with the response data
  return successResponse({}, 'pong working');
};

// Main Lambda function handler
export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return pingHandler(event);
};
