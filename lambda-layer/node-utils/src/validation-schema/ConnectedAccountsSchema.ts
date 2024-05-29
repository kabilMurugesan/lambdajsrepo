import * as joi from 'joi';

const createConnectedAccountSchema = joi.object({
  businessType: joi.string().required().valid('individual', 'company'),
  firstName: joi.alternatives().conditional('businessType', {
    is: 'individual',
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),
  lastName: joi.alternatives().conditional('businessType', {
    is: 'individual',
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),
  dobDay: joi.alternatives().conditional('businessType', {
    is: 'individual',
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),
  dobMonth: joi.alternatives().conditional('businessType', {
    is: 'individual',
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),
  dobYear: joi.alternatives().conditional('businessType', {
    is: 'individual',
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),
  ssn: joi.alternatives().conditional('businessType', {
    is: 'individual',
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),
  fullName: joi.alternatives().conditional('businessType', {
    is: 'company',
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),
  taxId: joi.alternatives().conditional('businessType', {
    is: 'company',
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),
  email: joi.string().required(),
  addressLine1: joi.string().required(),
  addressLine2: joi.string().allow(''),
  city: joi.string().required(),
  state: joi.string().required(),
  postalCode: joi.string(),
  phoneNumber: joi.string().required(),
  url: joi.string().allow(null, ''),
  ip: joi.string().required(),
});

export { createConnectedAccountSchema };
