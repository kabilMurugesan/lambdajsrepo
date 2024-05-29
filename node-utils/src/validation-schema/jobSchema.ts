import * as joi from 'joi';

const saveJobSchema = joi.object({
  jobName: joi.string().required(),
  guardCoverageId: joi.string().required(),
  guardServiceId: joi.array().min(1).required(),
  guardSecurityServiceId: joi.string().required(),
  noOfGuards: joi
    .number()
    .required()
    .greater(0)
    .message('The number of guards must be greater than 0'),
  startDate: joi.string().required(),
  endDate: joi.string().required(),
  jobVenue: joi.string(),
  jobVenueLocationCoordinates: joi.string().required(),
  bookingReason: joi.string().allow(null, ''),
  jobVenueRadius: joi.string().allow(null, ''),
  checkList: joi
    .array()
    .required()
    .items({
      description: joi.string().required(),
      date: joi.string().required(),
      time: joi.string().required(),
    })
    .allow(null, ''),
  jobOccurenceDays: joi
    .array()
    .required()
    .items({
      startTime: joi.string().required(),
      endTime: joi.string().required(),
      day: joi.string().valid('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    }),
});

const editJobSchema = joi.object({
  jobId: joi.string().required(),
  jobName: joi.string().allow(null, ''),
  guardCoverageId: joi.string().allow(null, ''),
  guardServiceId: joi.array().allow(null, ''),
  guardSecurityServiceId: joi.string().allow(null, ''),
  noOfGuards: joi
    .number()
    .greater(0)
    .message('The number of guards must be greater than 0')
    .allow(null, ''),
  startDate: joi.string().allow(null, ''),
  endDate: joi.string().allow(null, ''),
  jobVenue: joi.string().allow(null, ''),
  jobVenueLocationCoordinates: joi.string().allow(null, ''),
  jobVenueRadius: joi.string().allow(null, ''),
  bookingReason: joi.string().allow(null, ''),
  checkList: joi
    .array()
    .items({
      description: joi.string().required(),
      date: joi.string().required(),
      time: joi.string().required(),
    })
    .allow(null, ''),
  jobOccurenceDays: joi
    .array()
    .items({
      startTime: joi.string().required(),
      endTime: joi.string().required(),
      day: joi.string().valid('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    })
    .allow(null, ''),
});

const confirmJobSchema = joi.object({
  jobId: joi.string().required(),
});

export { saveJobSchema, confirmJobSchema, editJobSchema };
