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
import { IPaymentAccountsService } from '/opt/node-utils/src/interfaces/services/IPaymentAccountsService';
import {
  SavePaymentAccountsRequest,
  VerifyBankAccountRequest,
  UpdateDefaultSourceRequest,
} from '/opt/node-utils/src/dto/PaymentAccountsDTO';
import {
  savePaymentAccountSchema,
  verifyBankAccountSchema,
  updateDefaultSourceSchema,
} from '/opt/node-utils/src/validation-schema/PaymentAccountsSchema';

const savePaymentAccounts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(savePaymentAccountSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IPaymentAccountsService from the container
    const _paymentAccountsService = container.get<IPaymentAccountsService>(
      TYPES.IPaymentAccountsService
    );
    // Prepare a paymentAccounts payload from the request body
    const paymentAccountsPayload: SavePaymentAccountsRequest = body;
    // Call the paymentAccounts method of the user service
    const response = await _paymentAccountsService.savePaymentAccounts(
      event,
      paymentAccountsPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Payment account added successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const verifyBankAccount = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(verifyBankAccountSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IPaymentAccountsService from the container
    const _paymentVerificationService = container.get<IPaymentAccountsService>(
      TYPES.IPaymentAccountsService
    );
    // Prepare a paymentVerification payload from the request body
    const paymentVerificationPayload: VerifyBankAccountRequest = body;
    // Call the paymentVerification method of the user service
    const response = await _paymentVerificationService.verifyBankAccount(
      event,
      paymentVerificationPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Bank account verified successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const updateDefaultSource = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(updateDefaultSourceSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IPaymentAccountsService from the container
    const _updateDefaultSourceService = container.get<IPaymentAccountsService>(
      TYPES.IPaymentAccountsService
    );
    // Prepare a updateDefaultSource payload from the request body
    const updateDefaultSourcePayload: UpdateDefaultSourceRequest = body;
    // Call the updateDefaultSource method of the user service
    const response = await _updateDefaultSourceService.updateDefaultSource(
      event,
      updateDefaultSourcePayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Default source updated successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const deletePaymentAccount = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(updateDefaultSourceSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }
    // Retrieve an instance of IPaymentAccountsService from the container
    const _deletePaymentAccountService = container.get<IPaymentAccountsService>(
      TYPES.IPaymentAccountsService
    );
    // Prepare a deletePaymentAccountPayload from the request body
    const deletePaymentAccountPayload: UpdateDefaultSourceRequest = body;
    // Call the deletePaymentAccountMethod of the user service
    const response = await _deletePaymentAccountService.deletePaymentAccount(
      event,
      deletePaymentAccountPayload
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }

    const respMsg = response.responseMessage || 'Deleted Successfully';

    delete response.responseMessage;

    // Return a success response with the response data
    return successResponse(response, respMsg);
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const getPaymentAccounts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve an instance of IPaymentAccountsService from the container
    const _paymentAccountService = container.get<IPaymentAccountsService>(
      TYPES.IPaymentAccountsService
    );
    const stripeAccountId: string | undefined =
      event.queryStringParameters?.stripeAccountId;
    let response = null;
    if (!stripeAccountId) {
      // Getting all payment account lists
      response = await _paymentAccountService.getAllPaymentAccounts(event);
    } else {
      // Getting a particular payment account detail
      response = await _paymentAccountService.getPaymentAccountDetail(
        event,
        stripeAccountId
      );
    }

    // Return a success response with the response data
    return successResponse(response, 'Payment Account(s) fetched successfully');
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
    return savePaymentAccounts(event);
  } else if (event.httpMethod === 'PUT') {
    return verifyBankAccount(event);
  } else if (event.httpMethod === 'PATCH') {
    return updateDefaultSource(event);
  } else if (event.httpMethod === 'DELETE') {
    return deletePaymentAccount(event);
  } else if (event.httpMethod === 'GET') {
    return getPaymentAccounts(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
