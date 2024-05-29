import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IChatRepository } from '../interfaces/repo/IChatRepository';
import { IChatService } from '../interfaces/services/IChatService';
import {
  CreateChatRequest,
  MarkConversationReadByChatRequest,
} from '../dto/ChatDTO';

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(TYPES.IChatRepository)
    private readonly chatRepository: IChatRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService
  ) {}
  async getAllChats(event: any, page: any, pageSize: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    return await this.chatRepository.getAllChats(userId, page, pageSize);
  }
  // async getAllJobChats(
  //   event: any,
  //   jobId: string,
  //   page: any,
  //   pageSize: any
  // ): Promise<any> {
  //   const user = await this.authService.decodeJwt(event);
  //   const userId = user.id;
  //   return await this.chatRepository.getJobChatMessages(
  //     userId,
  //     jobId,
  //     page,
  //     pageSize
  //   );
  // }
  async getChatMessages(
    event: any,
    chatId: string,
    page: any,
    pageSize: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const chatMessages = await this.chatRepository.getChatMessages(
      userId,
      chatId,
      page,
      pageSize
    );
    return chatMessages;
  }

  async getJobChatMessages(
    event: any,
    jobId: string,
    page: any,
    pageSize: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;

    const getJobChatMessages = await this.chatRepository.getJobChatMessages(
      jobId
    );

    if (getJobChatMessages) {
      const chatId = getJobChatMessages.id;
      const chatMessages = await this.chatRepository.getChatMessages(
        userId,
        chatId,
        page,
        pageSize
      );
      return chatMessages;
    } else {
      return {
        count: 0,
        results: {
          enableChat: false,
          conversation: [],
          chatDetails: [],
        },
        pages: 1,
      };
    }
  }

  async createChat(
    event: any,
    createChatRequest: CreateChatRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const chatDetail = await this.chatRepository.createChat(
      userId,
      createChatRequest
    );
    return chatDetail;
  }
  async markConversationReadByChat(
    event: any,
    markConversationReadByChatRequest: MarkConversationReadByChatRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    const chatDetail = await this.chatRepository.markConversationReadByChat(
      userId,
      markConversationReadByChatRequest
    );
    return chatDetail;
  }
}
