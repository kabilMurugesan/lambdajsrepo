import * as joi from 'joi';

export const AdminRequest = joi.object({
    status: joi.string().required().valid("accepted", "rejected"),
    // certificateType: joi.string().required().valid("apost", "asrb"),
    userId: joi.string().required()
});

export const AdminUserDeleteRequest = joi.object({
    status: joi.string().required().valid("delete", "activate"),
    userId: joi.string().required()
});

