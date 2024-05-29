import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IChatRepository } from '../interfaces/repo/IChatRepository';
import { Chats } from '../entities/Chats';
import { ChatMessages } from '../entities/ChatMessages';
import {
  CreateChatRequest,
  MarkConversationReadByChatRequest,
} from '../dto/ChatDTO';
import { JobGuards } from '../entities/JobGuards';
import { ChatParticipants } from '../entities/ChatParticipants';
import { FindManyOptions, Not } from 'typeorm';
import { ChatMessageRecipients } from '../entities/ChatMessageRecipients';
import { UserProfile } from '../entities/UserProfile';

@injectable()
export class ChatRepository implements IChatRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService
  ) {}

  async getAllChats(userId: any, page: any, pageSize: any): Promise<any> {
    const chatRepo = await this.database.getRepository(Chats);

    const result = await chatRepo
      .createQueryBuilder('chat')
      .select([
        'chat.id AS chatId',
        'chat.updatedOn AS createdOn',
        'job.jobRefId AS jobRefId',
        'job.id AS jobId',
      ])
      .innerJoin(
        'ChatParticipants',
        'participant',
        'chat.id = participant.chat_id'
      )
      .innerJoin('chat.job', 'job')
      .where('participant.userId = :userId', { userId })
      .andWhere('(chat.jobId IS NOT NULL AND chat.jobId != "")')
      .andWhere('chat.isDeleted = :isDeleted', { isDeleted: 0 })
      .orderBy('chat.updatedOn', 'DESC')
      .groupBy('chat.id')
      .skip(page && pageSize ? (page - 1) * pageSize : undefined)
      .take(pageSize)
      .getRawMany();

    const results = await Promise.all(
      result &&
        result.map(async (chat) => {
          const chatDetails = await this.getChatWithUserProfile(
            chat.chatId,
            userId
          );
          chat.title = chatDetails.headingName;
          chat.chatType = chatDetails.chatType;
          chat.jobRefId = `#${chat.jobRefId}`;
          return chat;
        })
    );

    return {
      count: result.length,
      results,
      pages: pageSize ? Math.ceil(result.length / pageSize) : 1,
    };
  }

  async getChatMessages(
    userId: string,
    chatId: string,
    page: any,
    pageSize: any
  ): Promise<any> {
    let enableChat = true;
    const chatRepo = await this.database.getRepository(Chats);
    const chatDetails = await chatRepo.findOneBy({ id: chatId });
    if (chatDetails) {
      const options: FindManyOptions<ChatMessages> = {
        where: [{ chatId }],
        take: Number(pageSize),
        skip: page && pageSize ? (page - 1) * pageSize : undefined,
        order: { updatedOn: 'DESC' },
      };

      const repo = await this.database.getRepository(ChatMessages);
      const [results, count] = await repo.findAndCount(options);

      const mappedResults = results.map((msg) => ({
        chatMessageId: msg.id,
        message: msg.message,
        createdBy: msg.createdBy,
        name: `${msg.userProfile.firstName} ${msg.userProfile.lastName}`,
        profileImage: msg.userProfile.profilePhotoFileName,
        messageCreatedTime: msg.updatedOn,
      }));

      if (chatDetails.jobId !== null && chatDetails.jobId !== '') {
        const jobGuardsRepo = await this.database.getRepository(JobGuards);
        const isJobCompleted = await jobGuardsRepo.findOne({
          where: {
            jobId: chatDetails.jobId,
            jobStatus: 3,
          },
        });
        if (isJobCompleted) {
          enableChat = false;
        }
      }
      return {
        count,
        chatInitiatedBy: chatDetails.createdBy,
        results: {
          enableChat,
          conversation: mappedResults,
          chatDetails: await this.getChatWithUserProfile(chatId, userId),
        },
        pages: pageSize ? Math.ceil(count / pageSize) : 1,
      };
    } else {
      enableChat = false;
      return {
        count: 0,
        chatInitiatedBy: null,
        results: {
          enableChat,
          conversation: [],
          chatDetails: [],
        },
        pages: 1,
      };
    }
  }

  // async getJobChatMessages(
  //   userId: string,
  //   jobId: string,
  //   page: any,
  //   pageSize: any
  // ): Promise<any> {
  //   const chatRepo = await this.database.getRepository(Chats);
  //   const chatDetails = await chatRepo.findOneBy({ jobId, chatType: 'group' });
  //   if (chatDetails) {
  //     const chatId = chatDetails.id;
  //     const chatType = chatDetails.chatType;
  //     const options: FindManyOptions<ChatMessages> = {
  //       where: [{ chatId }],
  //       take: Number(pageSize),
  //       skip: page && pageSize ? (page - 1) * pageSize : undefined,
  //       order: { updatedOn: 'DESC' },
  //     };

  //     const repo = await this.database.getRepository(ChatMessages);
  //     const [results, count] = await repo.findAndCount(options);

  //     const mappedResults = results.map((msg) => ({
  //       chatMessageId: msg.id,
  //       message: msg.message,
  //       createdBy: msg.createdBy,
  //       name: `${msg.userProfile.firstName} ${msg.userProfile.lastName}`,
  //       profileImage: msg.userProfile.profilePhotoFileName,
  //       messageCreatedTime: msg.updatedOn,
  //     }));
  //     return {
  //       count,
  //       results: {
  //         chatType,
  //         conversation: mappedResults,
  //         chatDetails: await this.getChatWithUserProfile(chatId, userId),
  //       },
  //       pages: pageSize ? Math.ceil(count / pageSize) : 1,
  //     };
  //   } else {
  //     return {
  //       count: 0,
  //       results: {
  //         conversation: [],
  //         chatDetails: [],
  //       },
  //       pages: 1,
  //     };
  //   }
  // }

  async getJobChatMessages(jobId: string): Promise<any> {
    const chatRepo = await this.database.getRepository(Chats);
    return await chatRepo.findOneBy({
      isDeleted: 0,
      jobId,
    });
  }

  async createChat(
    userId: string,
    createChatRequest: CreateChatRequest
  ): Promise<any> {
    console.log('createChatRequest', createChatRequest);
    console.log('userId', userId);
    const chatRepo = await this.database.getRepository(Chats);
    const chatParticipantsRepo = await this.database.getRepository(
      ChatParticipants
    );
    let chatId;
    let chatDetails;
    if (
      createChatRequest.userId !== undefined &&
      createChatRequest.userId !== null &&
      createChatRequest.userId !== ''
    ) {
      const targetUserIds = [userId, createChatRequest.userId];
      chatDetails = await chatParticipantsRepo
        .createQueryBuilder('chatParticipant')
        .innerJoin('chatParticipant.chats', 'chat')
        .select('chatParticipant.chatId', 'chatId')
        .groupBy('chatParticipant.chatId')
        .having('COUNT(DISTINCT chatParticipant.userId) = :userCount', {
          userCount: targetUserIds.length,
        })
        .andWhere('chatParticipant.userId IN (:...userIds)', {
          userIds: targetUserIds,
        })
        .andWhere(
          "(chat.isDeleted = :isDeleted AND (chat.jobId IS NULL OR chat.jobId = ''))",
          {
            isDeleted: 0,
          }
        )
        .getRawOne();
      chatId = chatDetails?.chatId || null;
    } else if (
      createChatRequest.jobId !== undefined &&
      createChatRequest.jobId !== null &&
      createChatRequest.jobId !== ''
    ) {
      chatDetails = await chatRepo.findOneBy({
        isDeleted: 0,
        jobId: createChatRequest.jobId,
      });

      chatId = chatDetails?.id || null;
    }
    if (chatDetails) {
      return {
        chatId,
        chatDetails: await this.getChatWithUserProfile(chatId, userId),
      };
    }
    return await this.createNewChat(userId, createChatRequest);
  }

  private async getUserIdsFromJobGuards(jobId: string): Promise<string[]> {
    const jobGuardsRepo = await this.database.getRepository(JobGuards);
    const jobGuards = await jobGuardsRepo.find({ where: { jobId } });
    return jobGuards.map((guard) => guard.userId);
  }

  private async getChatWithUserProfile(
    chatId: string,
    userId: string
  ): Promise<any> {
    const chatRepo = await this.database.getRepository(Chats);
    const chatDetails = await chatRepo.findOneBy({ id: chatId });
    const chatParticipantsRepo = await this.database.getRepository(
      ChatParticipants
    );

    if (chatDetails.jobId === null || chatDetails.jobId === '') {
      const otherParticipantProfile = await chatParticipantsRepo.findOne({
        where: { chatId, userId: Not(userId) },
      });

      return otherParticipantProfile
        ? {
            chatType: 'single',
            headingName: `${otherParticipantProfile.userProfile.firstName} ${otherParticipantProfile.userProfile.lastName}`,
            headingImage:
              otherParticipantProfile.userProfile.profilePhotoFileName,
          }
        : null;
    }

    const jobGuardsRepo = await this.database.getRepository(JobGuards);
    const jobGuards = await jobGuardsRepo
      .createQueryBuilder('jobGuard')
      .innerJoinAndSelect('jobGuard.team', 'team')
      .innerJoinAndSelect('team.company', 'company')
      .where('jobGuard.jobId = :jobId', { jobId: chatDetails.jobId })
      .andWhere('jobGuard.userId != :userId', { userId: userId })
      .getOne();

    if (jobGuards) {
      return {
        chatType: 'group',
        headingName: jobGuards?.team?.company?.companyName,
        headingImage: jobGuards?.team?.company?.companyPhotoFileName,
      };
    }

    const jobGuardDetails = await jobGuardsRepo.find({
      where: { jobId: chatDetails.jobId },
    });

    if (jobGuardDetails.length === 1) {
      const userProfileRepo = await this.database.getRepository(UserProfile);
      let otherParticipantProfile;
      if (jobGuardDetails[0].userId == userId) {
        otherParticipantProfile = await chatParticipantsRepo.findOne({
          where: { chatId, userId: Not(userId) },
        });
        return otherParticipantProfile
          ? {
              chatType: 'single',
              headingName: `${otherParticipantProfile.userProfile.firstName} ${otherParticipantProfile.userProfile.lastName}`,
              headingImage:
                otherParticipantProfile.userProfile.profilePhotoFileName,
            }
          : null;
      } else {
        otherParticipantProfile = await userProfileRepo.findOne({
          where: { userId: jobGuardDetails[0].userId },
        });
        return otherParticipantProfile
          ? {
              chatType: 'single',
              headingName: `${otherParticipantProfile.firstName} ${otherParticipantProfile.lastName}`,
              headingImage: otherParticipantProfile.profilePhotoFileName,
            }
          : null;
      }
    }

    return {
      chatType: 'group',
      headingName: `${jobGuardDetails.length} Guards`,
      headingImage: null,
    };
  }

  private async createNewChat(
    userId: string,
    createChatRequest: any
  ): Promise<any> {
    const chatRepo = await this.database.getRepository(Chats);
    createChatRequest = {
      ...createChatRequest,
      createdBy: userId,
      updatedBy: userId,
      createdOn: new Date(),
      updatedOn: new Date(),
    };

    const chatDetails = await chatRepo.insert(createChatRequest);
    const chatId = chatDetails.identifiers[0].id;
    const creationDate = new Date();
    const chatParticipants = [
      {
        chatId,
        userId,
        createdBy: userId,
        updatedBy: userId,
        createdOn: creationDate,
        updatedOn: creationDate,
      },
    ];
    if (
      createChatRequest.userId !== undefined &&
      createChatRequest.userId !== null &&
      createChatRequest.userId !== ''
    ) {
      chatParticipants.push({
        chatId,
        userId: createChatRequest.userId,
        createdBy: userId,
        updatedBy: userId,
        createdOn: creationDate,
        updatedOn: creationDate,
      });
    } else if (
      createChatRequest.jobId !== undefined &&
      createChatRequest.jobId !== null &&
      createChatRequest.jobId !== ''
    ) {
      const userIds = await this.getUserIdsFromJobGuards(
        createChatRequest.jobId
      );

      userIds.forEach((usrId) => {
        chatParticipants.push({
          chatId,
          userId: usrId,
          createdBy: userId,
          updatedBy: userId,
          createdOn: creationDate,
          updatedOn: creationDate,
        });
      });
    }

    if (chatParticipants.length > 0) {
      const chatParticipantsRepo = await this.database.getRepository(
        ChatParticipants
      );
      await chatParticipantsRepo.insert(chatParticipants);
    }

    return {
      chatId,
      chatDetails: await this.getChatWithUserProfile(chatId, userId),
    };
  }

  async markConversationReadByChat(
    userId: string,
    markConversationReadByChatRequest: MarkConversationReadByChatRequest
  ): Promise<any> {
    const chatId = markConversationReadByChatRequest.chatId;
    const chatMessagesRepo = await this.database.getRepository(ChatMessages);
    const chatMessages = await chatMessagesRepo.find({
      where: { chatId },
    });

    if (chatMessages.length === 0) {
      return;
    }

    const chatMessageRecipientsRepo = await this.database.getRepository(
      ChatMessageRecipients
    );

    await Promise.all(
      chatMessages?.map(async (msg: any) => {
        const chatMessageRecipients = await chatMessageRecipientsRepo.find({
          where: { userId, chatMessageId: msg.id },
        });

        const currentTime = new Date();

        if (chatMessageRecipients.length === 0) {
          await chatMessageRecipientsRepo.insert({
            chatMessageId: msg.id,
            userId,
            createdBy: userId,
            updatedBy: userId,
            createdOn: currentTime,
            updatedOn: currentTime,
          });
        } else {
          await chatMessageRecipientsRepo.update(
            { userId, chatMessageId: msg.id },
            {
              updatedBy: userId,
              updatedOn: currentTime,
            }
          );
        }
      })
    );

    return;
  }
}
