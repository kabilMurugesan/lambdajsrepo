import * as joi from 'joi';

const savePaymentAccountSchema = joi.object({
  accountType: joi.string().valid('bank_account', 'card').required(),
  name: joi.string().required(),
  accountLast4Digits: joi.string().required().min(4).max(4),
  routingNumber: joi.string(),
  isPrimary: joi.number().valid(0, 1).required(),
  stripeToken: joi.string().required(),
});

const verifyBankAccountSchema = joi.object({
  objectId: joi.string().required(),
  amounts: joi.array().min(2).items(joi.string()),
});

const updateDefaultSourceSchema = joi.object({
  stripeAccountId: joi.string().required(),
});

export {
  savePaymentAccountSchema,
  verifyBankAccountSchema,
  updateDefaultSourceSchema,
};
