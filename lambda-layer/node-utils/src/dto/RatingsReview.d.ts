export interface saveRatingsReviews {
    ratings: Array<{
        jobId: string,
        ratings: string,
        type: string,
        reviews: string,
        isAppRate: string,
        userType: string,
        // userId: string,
        ratedTo: string,
        reviewedTo: string
        plateformRating: string
    }>;
    // guardId: string,

}

export interface editRatingsReviews {
    // guardId: string,
    jobId: string,
    ratings: string,
    type: string,
    id: string,
    reviews: string,
    isAppRate: string,
    userType: string,
    // userId: string,
    ratedTo: string,
    reviewedTo: string
}

