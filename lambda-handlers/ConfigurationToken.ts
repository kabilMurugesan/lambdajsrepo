import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IStsTokenService } from '/opt/node-utils/src/interfaces/services/IStsTokenService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { setAppropriateError } from '/opt/node-utils/src/utils/CommonUtils';
import {
  successResponse,
  failureResponse,
  presignedUrlResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IPreSignedUrlService } from '../lambda-layer/node-utils/src/interfaces/services/IPreSignedUrlService';

// Function to handle PUT request
const handleStsTokenRequest = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const type: string | undefined = event.queryStringParameters?.type;
    if (!type) {
      // If jobId is not provided in the query parameters, throw an error
      return failureResponse(400, 'Missing type in query parameters');
    }

    else if (type === 'sts') {

      // Retrieve an instance of IStsTokenService from the container
      const _stsTokenService = container.get<IStsTokenService>(
        TYPES.IStsTokenService
      );

      // Call the createUserProfile method of the user service
      const response = await _stsTokenService.getStsToken();

      // Return a success response with the response data
      return successResponse(response, 'AWS STS Token details');
    }
    else {

      // Retrieve an instance of IStsTokenService from the container
      const _preSignedUrlService = container.get<IPreSignedUrlService>(
        TYPES.IPreSignedUrlService
      );
      const folder: string | undefined = event.queryStringParameters?.folder;
      if (!folder) {
        // If jobId is not provided in the query parameters, throw an error
        return failureResponse(400, 'Missing folder in query parameters');
      }

      const fileName: string | undefined = event.queryStringParameters?.fileName;
      if (!fileName) {
        // If jobId is not provided in the query parameters, throw an error
        return failureResponse(400, 'Missing fileName in query parameters');
      }

      // Call the createUserProfile method of the user service
      const response = await _preSignedUrlService.getPreSignedUrl(folder, fileName);

      // Return a success response with the response data
      return presignedUrlResponse(response);
    }

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
    return handleStsTokenRequest(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
