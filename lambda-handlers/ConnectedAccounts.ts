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
import { IConnectedAccountsService } from '/opt/node-utils/src/interfaces/services/IConnectedAccountsService';
import { CreateConnectedAccountsRequest } from '/opt/node-utils/src/dto/ConnectedAccountsDTO';
import { createConnectedAccountSchema } from '/opt/node-utils/src/validation-schema/ConnectedAccountsSchema';

const saveConnectedAccounts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(createConnectedAccountSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IConnectedAccountsService from the container
    const _connectedAccountsService = container.get<IConnectedAccountsService>(
      TYPES.IConnectedAccountsService
    );
    // Prepare a connectedAccounts payload from the request body
    const connectedAccountsPayload: CreateConnectedAccountsRequest = body;
    // Call the connectedAccounts method of the user service
    const response = await _connectedAccountsService.createConnectedAccounts(
      event,
      connectedAccountsPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Connected account created successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const updateConnectedAccounts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(createConnectedAccountSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IConnectedAccountsService from the container
    const _connectedAccountsService = container.get<IConnectedAccountsService>(
      TYPES.IConnectedAccountsService
    );
    // Prepare a connectedAccounts payload from the request body
    const connectedAccountsPayload: CreateConnectedAccountsRequest = body;
    // Call the connectedAccounts method of the user service
    const response = await _connectedAccountsService.updateConnectedAccounts(
      event,
      connectedAccountsPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Connected account updated successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const getConnectedAccountDetails = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryType: string = event.queryStringParameters?.queryType
      ? event.queryStringParameters?.queryType
      : 'accountBalance';
    // Retrieve an instance of IConnectedAccountsService from the container
    const _connectedAccountsService = container.get<IConnectedAccountsService>(
      TYPES.IConnectedAccountsService
    );
    let response = { data: '', message: '' };
    // Call the connectedAccounts method of the user service
    if (queryType === 'accountBalance') {
      response = await _connectedAccountsService.getConnectedAccountBalance(
        event
      );
    } else if (queryType === 'checkConnectedAccount') {
      response = await _connectedAccountsService.checkConnectedAccount(event);
    } else if (queryType === 'payoutConfig') {
      response = await _connectedAccountsService.getPayoutConfig(event);
    }
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Connected account balance.');
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
    return saveConnectedAccounts(event);
  } else if (event.httpMethod === 'PUT') {
    return updateConnectedAccounts(event);
  } else if (event.httpMethod === 'GET') {
    return getConnectedAccountDetails(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
