import * as joi from 'joi';

export const guardPunchInTimeSchema = joi.object({
    jobId: joi.string().required(),
    guardCoordinates: joi.string().required(),
    teamId: joi.string().allow(null, ''),
    isPunch: joi.string().required(),
});