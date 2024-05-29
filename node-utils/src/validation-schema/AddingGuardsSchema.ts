import * as joi from 'joi';

const saveAddingJobSchema = joi.object({
    jobGuards: joi.array().items({
        guardId: joi.string().required(),
        teamId: joi.string().required().allow(null, "")
    }).required(),
    jobId: joi.string().required()
});

export { saveAddingJobSchema };