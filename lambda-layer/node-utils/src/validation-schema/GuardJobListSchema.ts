import * as joi from 'joi';

const updateGuardJobStatusJobSchema = joi.object({
  jobId: joi.string().required(),
  status: joi.number().required(),
});

export { updateGuardJobStatusJobSchema };
