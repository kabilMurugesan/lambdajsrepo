import * as joi from 'joi';

const updateProfileSchema = joi.object({
  firstName: joi.string(),
  lastName: joi.string(),
  addressLine1: joi.string(),
  addressLine2: joi.string().allow(null, ''),
  zipCode: joi.string(),
  stateId: joi.string(),
  cityId: joi.string(),
  profilePhotoFileName: joi.string().allow(null, ''),
  aPostInitiallyCertifiedDate: joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/),
  aPostAnnualFireArmQualificationDate: joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/),
  aPostLicenseNo: joi.string(),
  aPostCertFileName: joi.string(),
  srbLicenseIssueDate: joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/),
  srbLicenseExpiryDate: joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/),
  srbLicenseNo: joi.string(),
  srbCertFileName: joi.string(),
  srbStateId: joi.string().allow(null, ''),
  guardJobRate: joi.number(),
  socialSecurityNo: joi.string().min(9).max(9).allow(null, '').messages({
    'string.min': `Social security no should have 9 digit`,
    'string.max': `Social security no should have 9 digit`,
  }),
  type: joi.string().allow(null, ''),
  phone: joi.string().allow(null, '')
});

const saveJobInterestSchema = joi.object({
  items: joi.array().min(1).messages({
    "array.min": "Items can't be empty!"
  })
});

export { updateProfileSchema, saveJobInterestSchema };