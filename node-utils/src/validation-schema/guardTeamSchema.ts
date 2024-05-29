import * as joi from 'joi';

const saveTeamMembersSchema = joi.object({
  guardEmails: joi.array().min(1).messages({
    'array.min': "Guard emails can't be empty!",
  }),
});

export { saveTeamMembersSchema };
