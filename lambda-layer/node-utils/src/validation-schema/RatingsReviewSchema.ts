import * as joi from 'joi';


const saveRatings = joi.object({
    ratings: joi.array()
        .required()
        .items({
            jobId: joi.string().required(),
            ratings: joi.string().required(),
            type: joi.string().required(),
            isAppRate: joi.string().required(),
            userType: joi.string().required(),
            ratedTo: joi.string().required(),
            plateformRating: joi.string().required(),
        }),
});

// const saveRatings = joi.object({
//     // guardId: joi.string().required(),
// jobId: joi.string().required(),
// ratings: joi.string().required(),
//     type: joi.string().required(),
//         isAppRate: joi.string().required(),
//             userType: joi.string().required(),
//                 ratedTo: joi.string().required(),

// });

const editRatings = joi.object({
    // guardId: joi.string().required(),
    jobId: joi.string().required(),
    ratings: joi.string().required(),
    type: joi.string().required(),
    id: joi.string().required(),
    isAppRate: joi.string().required(),
    userType: joi.string().required(),
    // userId: joi.string().required(),
    ratedTo: joi.string().required(),
});

const saveReviews = joi.object({
    // guardId: joi.string().required(),
    jobId: joi.string().required(),
    reviews: joi.string().required(),
    type: joi.string().required(),
    isAppRate: joi.string().required(),
    userType: joi.string().required(),
    // userId: joi.string().required(),
    reviewedTo: joi.string().required(),
    plateformRating: joi.string().required(),
});

const editReviews = joi.object({
    // guardId: joi.string().required(),
    jobId: joi.string().required(),
    reviews: joi.string().required(),
    type: joi.string().required(),
    id: joi.string().required(),
    isAppRate: joi.string().required(),
    userType: joi.string().required(),
    // userId: joi.string().required(),
    reviewedTo: joi.string().required()
});

export { saveRatings, editRatings, saveReviews, editReviews };






