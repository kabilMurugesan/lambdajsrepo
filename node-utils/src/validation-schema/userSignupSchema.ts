import * as joi from 'joi';

export const userSignupSchema = joi.object({
  email: joi.string().email().required(),
  guardAccountType: joi.string().optional().valid("INDIVIDUAL", "TEAMMEMBER"),
  phone: joi.string().length(10).optional().allow(''),
  password: joi.string().optional().allow(''),
  userType: joi.string().required().valid("GUARD", "CUSTOMER"),
  cognitoUserId: joi.string().required()
});
