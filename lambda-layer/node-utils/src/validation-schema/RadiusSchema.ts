import * as joi from 'joi';

export const createRadius = joi.object({
    values: joi.array().items(joi.object({
        type: joi.string().valid("job", "apostRate", "asrbRate", "transactionFee", "crimeIndexFee", "minRadiusPercentage", "maxRadiusPercentage", "incrementBy").required(),
        value: joi.string().required(),
    })).required(),
});


export const editRadius = joi.object({
    type: joi.string().valid("job", "apostRate", "asrbRate", "transactionFee", "crimeIndexFee", "minRadiusPercentage", "maxRadiusPercentage", "incrementBy").required(),
    value: joi.string().required(),
    id: joi.string().required(),
});
