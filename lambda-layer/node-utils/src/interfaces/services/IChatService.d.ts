import {
  CreateChatRequest,
  MarkConversationReadByChatRequest,
} from '../../dto/ChatDTO';

export interface IChatService {
  getAllChats(event: any, page: any, pageSize: any): Promise<any>;
  getChatMessages(
    event: any,
    chatId: string,
    page: any,
    pageSize: any
  ): Promise<any>;
  createChat(event: any, createChatRequest: CreateChatRequest): Promise<any>;
  markConversationReadByChat(
    event: any,
    markConversationReadByChatRequest: MarkConversationReadByChatRequest
  ): Promise<any>;
  getJobChatMessages(
    event: any,
    jobId: string,
    page: any,
    pageSize: any
  ): Promise<any>;
}
