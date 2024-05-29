import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import {
  successResponse,
  failureResponse,
  warningResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IJobListService } from '/opt/node-utils/src/interfaces/services/IJobListService';
import { updateGuardJobStatusJobSchema } from '/opt/node-utils/src/validation-schema/GuardJobListSchema';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import { UpdateGuardJobStatusRequest } from '/opt/node-utils/src/dto/JobDTO';

// Function to handle PUT request
const getJobListHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const jobId: string | undefined = event.queryStringParameters?.jobId;

    if (jobId === undefined) {
      // Retrieve an instance of IJobListService from the container
      const _jobListService = container.get<IJobListService>(
        TYPES.IJobListService
      );

      const page: number = event.queryStringParameters?.page
        ? parseInt(event.queryStringParameters.page, 10)
        : 1;
      const pageSize: number = event.queryStringParameters?.pageSize
        ? parseInt(event.queryStringParameters.pageSize, 10)
        : 10;

      const getJobById: any = event.queryStringParameters?.userId;

      const status: string | undefined = event.queryStringParameters?.status;

      // Call the getJobListSummary method of the user service
      const response = await _jobListService.getJobListSummary(
        event,
        page,
        pageSize,
        status,
        getJobById
      );

      // Return a success response with the response data
      return successResponse(response, 'Job List');
    } else {
      // Retrieve an instance of IStateService from the container
      const _jobListService = container.get<IJobListService>(
        TYPES.IJobListService
      );
      const response = await _jobListService.getJobDetailsById(event, jobId);

      // Return a success response with the response data
      return successResponse(response, 'job details');
    }
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    const error = await setAppropriateError(err);
    return failureResponse(error.httpCode, error.message);
  }
};

const updateGuardJobStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(updateGuardJobStatusJobSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    // Retrieve an instance of IJobListService from the container
    const _jobListService = container.get<IJobListService>(
      TYPES.IJobListService
    );

    // Prepare a updateGuardJobStatusRequest payload from the request body
    const updateGuardJobStatusPayload: UpdateGuardJobStatusRequest = body;

    // Call the confirm job method of the user service
    const response = await _jobListService.updateGuardJobStatus(
      event,
      updateGuardJobStatusPayload
    );
    if (response.data == '' || response.message) {
      return warningResponse("", response.message);
    }

    // Return a success response with the response data
    return successResponse(response, 'Guard job status updated successfully');
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
  try {
    if (event.httpMethod === 'GET') {
      return getJobListHandler(event);
    } else if (event.httpMethod === 'PATCH') {
      return updateGuardJobStatus(event);
    } else {
      return failureResponse(400, 'Bad request: Undefined method');
    }
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};
