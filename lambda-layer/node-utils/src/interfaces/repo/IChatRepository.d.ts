import {
  CreateChatRequest,
  MarkConversationReadByChatRequest,
} from '../../dto/ChatDTO';

export interface IChatRepository {
  getAllChats(userId: string, page: any, pageSize: any): Promise<any>;
  getChatMessages(
    userId: string,
    chatId: string,
    page: any,
    pageSize: any
  ): Promise<any>;
  createChat(
    userId: string,
    createChatRequest: CreateChatRequest
  ): Promise<any>;
  markConversationReadByChat(
    userId: string,
    markConversationReadByChatRequest: MarkConversationReadByChatRequest
  ): Promise<any>;
  getJobChatMessages(jobId: string): Promise<any>;
}
