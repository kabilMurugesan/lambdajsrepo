import { editRatingsReviews, saveRatingsReviews } from "../../dto/RatingsReview";

export interface IRatingsReviewsRepository {
    getRatingsAndReviewsById(id: any, event: any, type: any): Promise<any>;
    postRatingsAndReviews(saveRatingsReviews: saveRatingsReviews, event: any): Promise<any>
    editRatingsAndReviews(editRatingsReviews: editRatingsReviews, event: any): Promise<any>
    deleteRatingsAndReviews(id: any, event: any, type: any): Promise<any>
}
