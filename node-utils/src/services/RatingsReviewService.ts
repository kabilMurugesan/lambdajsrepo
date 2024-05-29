import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IRatingsReviewsRepository } from '../interfaces/repo/IRatingsReviewRepository';
import { IRatingsReviewsService } from '../interfaces/services/IRatingsReviewsService';
import { saveRatingsReviews, editRatingsReviews } from '../dto/RatingsReview';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';

@injectable()
export class RatingsReviewsService implements IRatingsReviewsService {
    constructor(
        @inject(TYPES.IRatingsReviewsRepository)
        private readonly RatingsReviewsRepository: IRatingsReviewsRepository,
        @inject(TYPES.IAuthService)
        private readonly authService: IAuthService
    ) { }
    async postRatingsAndReviews(
        saveRatingsReviewsPayload: saveRatingsReviews,
        event: any
    ): Promise<any> {
        const user = await this.authService.decodeJwt(event);
        const resendOtp: any = await this.RatingsReviewsRepository.postRatingsAndReviews(
            saveRatingsReviewsPayload, user
        );
        return resendOtp;
    }
    async editRatingsAndReviews(
        editRatingsReviewsPayload: editRatingsReviews,
        event: any,
    ): Promise<any> {
        const user = await this.authService.decodeJwt(event);
        const resendOtp: any = await this.RatingsReviewsRepository.editRatingsAndReviews(
            editRatingsReviewsPayload, user
        );
        return resendOtp;
    }
    async getRatingsAndReviewsById(id: string, event: any, type: any): Promise<any> {
        const user = await this.authService.decodeJwt(event);
        return await this.RatingsReviewsRepository.getRatingsAndReviewsById(id, user, type);
    }
    async deleteRatingsAndReviews(id: string, event: any, type: any): Promise<any> {
        const user = await this.authService.decodeJwt(event);
        return await this.RatingsReviewsRepository.deleteRatingsAndReviews(id, user, type);
    }

    // private async sendJobStatusNotification(
    //     saveRatingsReviewsPayload: any,
    //     saveRatings: any,
    //     user: any
    // ) {
    //     let pushStatus = `Congratulations ${saveRatings.titleName}!!`;
    //     let message = `${saveRatings.rartedByName} has given a star rating and reviewed his experience for the job  ${saveRatingsReviewsPayload.jobId}. Spend some time to view the same please!! ” - Body content`
    //     let notificationDetails =
    //         await this.NotificationRepository.saveNotification(
    //             saveRatingsReviewsPayload.ratedTo,
    //             'PUSH',
    //             `FIDO - ${pushStatus}`,
    //             message,
    //             'JOB_DETAIL',
    //             saveRatingsReviewsPayload.jobId
    //         );
    //     let returnMsg = await this.pushService.sendPush(
    //         `FIDO - ${pushStatus}`,
    //         saveRatings.jobStatusResponse.jobName,
    //         [user.userId],
    //         { jobId: saveRatingsReviewsPayload.jobId },
    //         notificationDetails
    //     );
    //     await this.NotificationRepository.updateNotificationStatus(
    //         notificationDetails.id,
    //         returnMsg
    //     );
    // }
}
