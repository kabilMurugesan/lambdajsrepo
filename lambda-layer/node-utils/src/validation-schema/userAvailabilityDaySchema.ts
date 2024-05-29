import * as joi from 'joi';

export const userAvailabilityDaySchema = joi.object({
    availabilityDay: joi.array()
        .required()
        .items({
            weekday: joi.string().required().valid("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"),
            startTime: joi.string()
                .required(),
            endTime: joi.string()
                .required(),
        }),
});
