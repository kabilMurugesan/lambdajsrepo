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
import { ITransactionService } from '/opt/node-utils/src/interfaces/services/ITransactionService';

const getTransactions = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const page: number = event.queryStringParameters?.page
      ? parseInt(event.queryStringParameters.page, 10)
      : 1;
    const pageSize: number = event.queryStringParameters?.pageSize
      ? parseInt(event.queryStringParameters.pageSize, 10)
      : 10;
    // Retrieve an instance of ITransactionsService from the container
    const _transactionService = container.get<ITransactionService>(
      TYPES.ITransactionService
    );

    // Getting all transactions lists
    const response = await _transactionService.getAllTransactions(
      event,
      page,
      pageSize
    );

    // Return a success response with the response data
    return successResponse(response, 'Transaction list fetched successfully');
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
    return getTransactions(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
