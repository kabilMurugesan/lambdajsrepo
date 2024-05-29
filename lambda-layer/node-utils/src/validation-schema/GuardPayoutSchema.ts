import * as joi from 'joi';

const updateGuardPayoutSchema = joi.object({
  interval: joi.string().required(),
  weekly_anchor: joi.alternatives().conditional('interval', {
    is: 'weekly',
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),
  monthly_anchor: joi.alternatives().conditional('interval', {
    is: 'monthly',
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),
});

const createManualPayoutSchema = joi.object({
  amount: joi.number().required(),
  description: joi.string().required(),
});

export { updateGuardPayoutSchema, createManualPayoutSchema };
