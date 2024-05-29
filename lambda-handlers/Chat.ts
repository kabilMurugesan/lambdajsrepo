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
import { IChatService } from '/opt/node-utils/src/interfaces/services/IChatService';
import {
  CreateChatRequest,
  MarkConversationReadByChatRequest,
} from '/opt/node-utils/src/dto/ChatDTO';
import {
  createChatSchema,
  markConversationReadByChatSchema,
} from '/opt/node-utils/src/validation-schema/ChatSchema';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';

const createChat = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(createChatSchema, body);
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    const _chatService = container.get<IChatService>(TYPES.IChatService);
    const payload: CreateChatRequest = body;
    const response = await _chatService.createChat(event, payload);

    // Return a success response with the response data
    return successResponse(response, 'Chat created successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const getConversation = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve an instance of IChatService from the container
    const _chatService = container.get<IChatService>(TYPES.IChatService);
    const chatId: string | undefined = event.queryStringParameters?.chatId;
    const jobId: string | undefined = event.queryStringParameters?.jobId;
    const page: number = event.queryStringParameters?.page
      ? parseInt(event.queryStringParameters.page, 10)
      : 1;
    const pageSize: number = event.queryStringParameters?.pageSize
      ? parseInt(event.queryStringParameters.pageSize, 10)
      : 10;
    let response = null;
    if (chatId !== undefined && chatId !== null && chatId !== '') {
      response = await _chatService.getChatMessages(
        event,
        chatId,
        page,
        pageSize
      );
    } else if (jobId !== undefined && jobId !== null && jobId !== '') {
      response = await _chatService.getJobChatMessages(
        event,
        jobId,
        page,
        pageSize
      );
    } else {
      response = await _chatService.getAllChats(event, page, pageSize);
    }

    // Return a success response with the response data
    return successResponse(response, 'Chat(s) fetched successfully');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

const markConversationReadByChat = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const body: any = event.body || {};

    // Validate input against a schema using the ValidationUtils
    const { error, value } = validateInput(
      markConversationReadByChatSchema,
      body
    );
    if (error) {
      return failureResponse(400, error.details[0].message.replace(/"/g, ''));
    }

    const _chatService = container.get<IChatService>(TYPES.IChatService);
    const payload: MarkConversationReadByChatRequest = body;
    const response = await _chatService.markConversationReadByChat(
      event,
      payload
    );

    // Return a success response with the response data
    return successResponse(response, 'Chat read status updated successfully');
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
    return createChat(event);
  } else if (event.httpMethod === 'GET') {
    return getConversation(event);
  } else if (event.httpMethod === 'PUT') {
    return markConversationReadByChat(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};
