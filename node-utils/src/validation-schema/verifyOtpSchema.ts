import * as joi from 'joi';

export const resendOtp = joi.object({
  email: joi.string().email().required(),
  type: joi.string().optional().valid("signup", "forgot_password"),
});

export const verifyOtp = joi.object({
  email: joi.string().email().required(),
  type: joi.string().optional().valid("email", "phoneNumber"),
});
