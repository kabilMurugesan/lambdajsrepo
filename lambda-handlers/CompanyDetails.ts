import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
  successResponse,
  failureResponse,
  failureApiResponse,
  warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import {
  companyDetailsSchema,
  editCompanyDetailsSchema,
} from '/opt/node-utils/src/validation-schema/CompanyDetailsSchema';
import { ICompanyDetailsService } from '/opt/node-utils/src/interfaces/services/ICompanyDetailsService';
import {
  CompanyDetailsRequest,
  EditCompanyDetailsRequest,
} from '/opt/node-utils/src/dto/CompanyDetailsDTO';

const handlePostRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(companyDetailsSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of ICompanyDetailsService from the container
    const _userService = container.get<ICompanyDetailsService>(
      TYPES.ICompanyDetailsService
    );

    // Prepare a CompanyDetailsRequest payload from the request body
    const createPayload: CompanyDetailsRequest = body;

    // Call the createComapnyDetails method of the comapny service
    const response = await _userService.createComapnyDetails(
      createPayload,
      event
    );
    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }
    // Return a success response with the response data
    return successResponse(response, 'Company Details Created Successfully.');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const handlePutRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(editCompanyDetailsSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of ICompanyDetailsService from the container
    const _userService = container.get<ICompanyDetailsService>(
      TYPES.ICompanyDetailsService
    );

    // Prepare a CompanyDetailsRequest payload from the request body
    const createPayload: EditCompanyDetailsRequest = body;

    // Call the createComapnyDetails method of the comapny service
    const response = await _userService.editCompanyDetails(
      createPayload,
      event
    );
    if (response.data == '') {
      return failureApiResponse(response.data, response.message);
    }
    // Return a success response with the response data
    return successResponse(response, 'Company Details Edited Successfully.');
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
  if (event.httpMethod === 'PUT') {
    return handlePutRequest(event);
  }
  return failureResponse(400, 'Bad request: Undefined method');
};
