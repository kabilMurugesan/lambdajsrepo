import * as joi from 'joi';

const createChatSchema = joi.object({
  jobId: joi.string().optional().allow(null, ''),
  userId: joi.string().optional().allow(null, ''),
});

const markConversationReadByChatSchema = joi.object().keys({
  chatId: joi.string().required(),
});

export { createChatSchema, markConversationReadByChatSchema };
