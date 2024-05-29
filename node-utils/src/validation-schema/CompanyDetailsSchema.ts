import * as joi from 'joi';

export const companyDetailsSchema = joi.object({
    teamName: joi.string().required(),
    companyName: joi.string().required(),
    companyEmail: joi.string().allow(null, ''),
    companyPhone: joi.string().allow(null, ''),
    street1: joi.string().required(),
    street2: joi.string().required(),
    country: joi.string().required(),
    city: joi.string().required(),
    zipCode: joi.string().allow(null, ''),
    companyPhotoFileName: joi.string().allow(null, ''),
});

export const editCompanyDetailsSchema = joi.object({
    companyId: joi.string().required(),
    teamName: joi.string().required(),
    companyName: joi.string().required(),
    companyEmail: joi.string().allow(null, ''),
    companyPhone: joi.string().allow(null, ''),
    street1: joi.string().required(),
    street2: joi.string().required(),
    city: joi.string().required(),
    country: joi.string().required(),
    zipCode: joi.string().allow(null, ''),
    companyPhotoFileName: joi.string().allow(null, ''),
});

