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
import { saveJobSchema } from '/opt/node-utils/src/validation-schema/jobSchema';
import {
  successResponse,
  failureResponse,
  warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IRadiusService } from '/opt/node-utils/src/interfaces/services/IRadiusService';
import {
  AddRadiusRequest,
  editRadiusRequest,
} from '/opt/node-utils/src/dto/RadiusDTO';
import {
  createRadius,
  editRadius,
} from '/opt/node-utils/src/validation-schema/RadiusSchema';

const saveRadius = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(createRadius, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IJobService from the container
    const _jobService = container.get<IRadiusService>(TYPES.IRadiusService);

    const saveRadiusPayload: AddRadiusRequest = body;

    // Call the save job method of the user service
    const response = await _jobService.createSettingsRequest(saveRadiusPayload);

    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Radius saved successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const getRadiusList = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve an instance of IRadiusService from the container
    const _jobService = container.get<IRadiusService>(TYPES.IRadiusService);

    // Call the createUserProfile method of the user service
    const response = await _jobService.getSettings();

    // Return a success response with the response data
    return successResponse(response, 'Radius Fetched Successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const deleteRadiusRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve an instance of IRadiusService from the container
    const _jobService = container.get<IRadiusService>(TYPES.IRadiusService);

    // Prepare a SaveJobRequest payload from the request body
    // const DeleteRadiusPayload: DeleteRadiusRequest = body;
    const deleteRadiusPayload: string | undefined =
      event.queryStringParameters?.id;
    if (deleteRadiusPayload === undefined) {
      return failureResponse(400, 'Missing teamId in query parameters');
    }

    // Call the save job method of the user service
    const response = await _jobService.deleteSettings(deleteRadiusPayload);

    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Radius Deleted Successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const editRadiusRequests = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};
    const { error, value } = validateInput(editRadius, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IRadiusService from the container
    const _jobService = container.get<IRadiusService>(TYPES.IRadiusService);

    const saveRadiusPayload: editRadiusRequest = body;

    // Call the save job method of the user service
    const response = await _jobService.editSettings(saveRadiusPayload);

    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Radius Updated Successfully');
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
    return saveRadius(event);
  } else if (event.httpMethod === 'GET') {
    return getRadiusList(event);
  } else if (event.httpMethod == 'DELETE') {
    return deleteRadiusRequest(event);
  } else if (event.httpMethod == 'PUT') {
    return editRadiusRequests(event);
  } else {
    return failureResponse(400, 'Bad request: Undefined method');
  }
};
