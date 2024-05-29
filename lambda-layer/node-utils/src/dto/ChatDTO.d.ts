export interface CreateChatRequest {
  title: string;
  createdBy: string;
  updatedBy: string;
  createdOn: Date;
  updatedOn: Date;
  chatType: string;
  userId: string;
  jobId: string;
}
export interface MarkConversationReadByChatRequest {
  chatId: string;
}
