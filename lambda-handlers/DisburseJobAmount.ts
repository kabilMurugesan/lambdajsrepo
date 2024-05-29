import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { IDisburseJobAmtService } from '/opt/node-utils/src/interfaces/services/IDisburseJobAmtService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import {
  successResponse,
  failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';

const disburseJobAmt = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve an instance of IDisburseJobAmtService from the container
    const _service = container.get<IDisburseJobAmtService>(
      TYPES.IDisburseJobAmtService
    );
    // Call the save job method of the user service
    const response = await _service.disburseJobAmt(event);

    // Return a success response with the response data
    return successResponse(response, 'Amount disbursed successfully');
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
  return disburseJobAmt(event);
};
