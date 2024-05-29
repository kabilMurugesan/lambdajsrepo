import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IJobService } from '/opt/node-utils/src/interfaces/services/IJobService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
  SaveJobRequest,
  ConfirmJobRequest,
  EditJobRequest,
} from '/opt/node-utils/src/dto/JobDTO';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
  saveJobSchema,
  confirmJobSchema,
  editJobSchema
} from '/opt/node-utils/src/validation-schema/jobSchema';
import {
  successResponse,
  failureResponse,
  warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

const saveJob = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(saveJobSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IJobService from the container
    const _jobService = container.get<IJobService>(TYPES.IJobService);

    // Prepare a SaveJobRequest payload from the request body
    const savePayload: SaveJobRequest = body;

    // Call the save job method of the user service
    const response = await _jobService.saveJob(event, savePayload);

    // Return a success response with the response data
    return successResponse(response, 'Job saved successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const getJobSummary = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const jobId: string | undefined = event.queryStringParameters?.jobId;

    if (!jobId) {
      // If jobId is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing jobId in query parameters');
    }

    // Retrieve an instance of IJobService from the container
    const _jobService = container.get<IJobService>(TYPES.IJobService);

    // Call the createUserProfile method of the user service
    const response = await _jobService.getJobSummary(jobId);

    // Return a success response with the response data
    return successResponse(response, 'Job Summary');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const confirmJob = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(confirmJobSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IJobService from the container
    const _jobService = container.get<IJobService>(TYPES.IJobService);

    // Prepare a ConfirmJobRequest payload from the request body
    const confirmJobPayload: ConfirmJobRequest = body;

    // Call the confirm job method of the user service
    const response = await _jobService.confirmJob(event, confirmJobPayload);

    // Return a success response with the response data
    return successResponse(response, 'Job creation completed successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const editJob = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(editJobSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IJobService from the container
    const _jobService = container.get<IJobService>(TYPES.IJobService);

    // Prepare a SaveJobRequest payload from the request body
    const savePayload: EditJobRequest = body;

    // Call the save job method of the user service
    const response = await _jobService.editJob(event, savePayload);

    if (response.data == '') {
      return warningResponse(response.data, response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Job edited successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};


const deleteJob = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const jobId: string | undefined = event.queryStringParameters?.jobId;

    if (!jobId) {
      // If jobId is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing jobId in query parameters');
    }
    const status: string | undefined = event.queryStringParameters?.status;
    if (!status) {
      // If jobId is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing status in query parameters');
    }
    // Retrieve an instance of IJobService from the container
    const _jobService = container.get<IJobService>(TYPES.IJobService);

    // Call the createUserProfile method of the user service
    const response = await _jobService.deleteJob(jobId, status);

    // Return a success response with the response data
    return successResponse(response, 'Job Deleted Successfully');
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
    return saveJob(event);
  } else if (event.httpMethod === 'GET') {
    return getJobSummary(event);
  } else if (event.httpMethod === 'PATCH') {
    return confirmJob(event);
  }
  else if (event.httpMethod === 'PUT') {
    return editJob(event);
  }
  else if (event.httpMethod === 'DELETE') {
    return deleteJob(event);
  } else {
    return failureResponse(400, 'Bad request: Undefined method');
  }
};
