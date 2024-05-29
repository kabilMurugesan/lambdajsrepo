import * as joi from 'joi';

const favoriteGuardSchema = joi.object({
    guardId: joi.string().required(),
    isFavorite: joi.boolean().allow(null, ''),
    id: joi.string().allow(null, '')
});

const unfavoriteGuardSchema = joi.object({
    id: joi.string().required(),
});

export { favoriteGuardSchema, unfavoriteGuardSchema };
