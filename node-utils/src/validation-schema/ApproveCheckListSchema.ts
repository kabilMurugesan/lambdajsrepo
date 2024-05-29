import * as joi from 'joi';

export const approveCheckList = joi.object({
    checkListId: joi.string().required(),
    status: joi.number().required()
});