import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { GlobalConstants } from '../constants/constants';
import { IRatingsReviewsRepository } from '../interfaces/repo/IRatingsReviewRepository';
import { editRatingsReviews, saveRatingsReviews } from '../dto/RatingsReview';
import { GuardRatings } from '../entities/ratings';
import { GuardReviews } from '../entities/reviews';
import { JobGuards } from '../entities/JobGuards';
import { UserProfile } from '../entities/UserProfile';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
import { Job } from '../entities/Job';

@injectable()
export class RatingsReviewsRepository implements IRatingsReviewsRepository {
    constructor(
        @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
        @inject(TYPES.INotificationRepository)
        private readonly NotificationRepository: INotificationRepository,
        @inject(TYPES.IPushService)
        private readonly pushService: IPushService,
        private readonly globalConstants = GlobalConstants
    ) { }
    async postRatingsAndReviews(
        saveRatingsReviewsPayload: saveRatingsReviews,
        user: any,
    ): Promise<any> {
        const userId = user.id;
        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const jobGuardRepo = await this.database.getRepository(JobGuards)
        const userProfileRepo = await this.database.getRepository(UserProfile);
        const jobRepo = await this.database.getRepository(Job)
        let insertedObj;
        const insertPromises = saveRatingsReviewsPayload.ratings.map(async (saveRatingsPayloads) => {
            let guardName = ""
            let customerName = ""
            if (saveRatingsPayloads.userType == "GUARD") {
                const ratedBy = await userProfileRepo.findOne({ where: { userId: userId } })

                const ratedTo = await userProfileRepo.findOne({ where: { userId: saveRatingsPayloads.ratedTo ? saveRatingsPayloads.ratedTo : saveRatingsPayloads.reviewedTo } })
                guardName = ratedBy.firstName + " " + ratedBy.lastName
                customerName = ratedTo.firstName + " " + ratedTo.lastName
            }
            if (saveRatingsPayloads.userType != "GUARD") {
                const ratedBy = await userProfileRepo.findOne({ where: { userId: userId } })

                const ratedTo = await userProfileRepo.findOne({ where: { userId: saveRatingsPayloads.ratedTo ? saveRatingsPayloads.ratedTo : saveRatingsPayloads.reviewedTo } })
                customerName = ratedBy.firstName + " " + ratedBy.lastName
                guardName = ratedTo.firstName + " " + ratedTo.lastName
            }
            if (saveRatingsPayloads.type === "rating") {
                insertedObj = await ratingsRepo.insert({
                    ratings: saveRatingsPayloads.ratings,
                    jobId: saveRatingsPayloads.jobId,
                    customerName: customerName,
                    guardName: guardName,
                    // guardId: saveRatingsPayloads.guardId,
                    isAppRate: saveRatingsPayloads.isAppRate,
                    ratedBy: userId,
                    type: saveRatingsPayloads.userType,
                    ratedTo: saveRatingsPayloads.ratedTo,
                    appRated: saveRatingsPayloads.plateformRating,
                    // userId: saveRatingsPayloads.userId,
                    updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                    createdBy: this.globalConstants.SYS_ADMIN_GUID,
                    updatedOn: new Date(),
                    createdOn: new Date(),
                });
            }
            if (saveRatingsPayloads.type === "review") {
                insertedObj = await ratingsRepo.update({ jobId: saveRatingsPayloads.jobId, ratedTo: saveRatingsPayloads.reviewedTo, ratedBy: userId }, {
                    reviews: saveRatingsPayloads.reviews
                });
            }
            const jobRefId = await jobRepo.findOne({ where: { id: saveRatingsPayloads.jobId } })
            // if (saveRatingsPayloads.isAppRate == "true") {
            //     console.log("update1");

            //     insertedObj = await ratingsRepo.update({ jobId: saveRatingsPayloads.jobId, ratedBy: userId }, {
            //         appRated: saveRatingsPayloads.ratings
            //     });
            // }
            if (saveRatingsPayloads.userType === "GUARD") {
                // console.log("update2");
                if (saveRatingsPayloads.isAppRate === "true" && saveRatingsPayloads.type === "rating") {
                    await userProfileRepo.update({ userId: userId }, {
                        IsAppRatingAdded: true
                    })
                }
                if (saveRatingsPayloads.type === "rating") {
                    await jobGuardRepo.update({ userId: userId, jobId: saveRatingsPayloads.jobId }, {
                        isUserRatingAdded: true
                    })
                    await this.sendJobStatusNotification(guardName, jobRefId.jobRefId, saveRatingsPayloads.ratedTo, saveRatingsPayloads.type);
                } if (saveRatingsPayloads.type != "rating") {
                    await jobGuardRepo.update({ userId: userId, jobId: saveRatingsPayloads.jobId }, {
                        isUserReviewAdded: true
                    })
                    await this.sendJobStatusNotification(guardName, jobRefId.jobRefId, saveRatingsPayloads.reviewedTo, saveRatingsPayloads.type);
                }
                // if (saveRatingsPayloads.type === "rating") {
                //     // await this.sendJobStatusNotification(guardName, saveRatingsPayloads.jobId, userId);
                //     await this.sendJobStatusNotification(customerName, jobRefId.jobRefId, saveRatingsPayloads.ratedTo, saveRatingsPayloads.type);
                // }
            }
            else if (saveRatingsPayloads.userType != "GUARD") {
                // console.log("update3");
                if (saveRatingsPayloads.isAppRate === "true" && saveRatingsPayloads.type === "rating") {
                    await userProfileRepo.update({ userId: userId }, {
                        IsAppRatingAdded: true
                    })
                }

                if (saveRatingsPayloads.type === "rating") {
                    await jobGuardRepo.update({ userId: saveRatingsPayloads.ratedTo, jobId: saveRatingsPayloads.jobId }, {
                        isGuardRatingAdded: true
                    })
                    await this.sendJobStatusNotification(customerName, jobRefId.jobRefId, saveRatingsPayloads.ratedTo, saveRatingsPayloads.type);
                } if (saveRatingsPayloads.type != "rating") {
                    await jobGuardRepo.update({ userId: saveRatingsPayloads.reviewedTo, jobId: saveRatingsPayloads.jobId }, {
                        isGuardReviewAdded: true
                    })
                    await this.sendJobStatusNotification(customerName, jobRefId.jobRefId, saveRatingsPayloads.reviewedTo, saveRatingsPayloads.type);
                }
                // if (saveRatingsPayloads.type === "rating") {
                //     // await this.sendJobStatusNotification(guardName, saveRatingsPayloads.jobId, userId);
                //     await this.sendJobStatusNotification(guardName, jobRefId.jobRefId, saveRatingsPayloads.ratedTo, saveRatingsPayloads.type);
                // }
            }

        });

        // Wait for all insertPromises to complete before continuing
        await Promise.all(insertPromises);
        return insertedObj
    }


    async deleteRatingsAndReviews(
        id: string,
        user: any,
        type: any,
    ): Promise<any> {
        const userId = user.id;
        console.log(userId);
        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const reviewsRepo = await this.database.getRepository(GuardReviews)
        if (type === "rating") {
            const response = await ratingsRepo.update({ id: id }, {
                isDeleted: true
            });
            return response
        } else if (type === "review") {
            const response = await ratingsRepo.update({ id: id }, {
                isDeleted: true
            });
            return response
        }
    }

    async getRatingsAndReviewsById(id: any, user: any, type: any): Promise<any> {
        const userId = user.id;
        console.log(userId);

        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const reviewsRepo = await this.database.getRepository(GuardReviews)
        let value = {}
        if (type === "user") {
            value = { ratedTo: id, isDeleted: false }
        } else if (type === "guard") {
            value = { ratedTo: id, isDeleted: false }
        } else if (type === "job") {
            value = { jobId: id, isDeleted: false }
        } else {
            value = { id: id, isDeleted: false }
        }
        const ratingsResponse: any = await ratingsRepo.find({
            where: value
        });
        let totalRatings = 0;

        const calculateRatingsPromises = ratingsResponse.map((rating: any) => {
            return new Promise<number | void>((resolve) => {
                // Assuming 'ratings' field contains numeric values as strings
                const ratingValue = parseFloat(rating.ratings);
                if (!isNaN(ratingValue)) {
                    totalRatings += ratingValue;
                }
                resolve();
            });
        });
        let totalRating = 0
        if (totalRatings > 0) {
            const calculateRating = Math.min(totalRatings, 5);
            totalRating = totalRating + calculateRating
        }

        // Wait for all promises to resolve
        await Promise.all(calculateRatingsPromises);
        const reviewResponse: any = await reviewsRepo.findAndCount({
            where: value
        });

        return { ratingsResponse, reviewResponse, totalRating }
    }

    async editRatingsAndReviews(
        editRatingsReviewsPayload: editRatingsReviews,
        user: any
    ): Promise<any> {
        const userId = user.id;
        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const reviewsRepo = await this.database.getRepository(GuardReviews)
        const jobGuardRepo = await this.database.getRepository(JobGuards)
        let insertedObj;
        if (editRatingsReviewsPayload.userType == "GUARD") {
            if (editRatingsReviewsPayload.type === "rating") {
                await jobGuardRepo.update({ userId: userId, jobId: editRatingsReviewsPayload.jobId }, {
                    isUserRatingAdded: true
                })
            } else if (editRatingsReviewsPayload.type === "review") {
                await jobGuardRepo.update({ userId: userId, jobId: editRatingsReviewsPayload.jobId }, {
                    isUserReviewAdded: true
                })
            }
        }
        else if (editRatingsReviewsPayload.userType == "User") {

            if (editRatingsReviewsPayload.type === "rating") {
                await jobGuardRepo.update({ userId: editRatingsReviewsPayload.ratedTo, jobId: editRatingsReviewsPayload.jobId }, {
                    isGuardRatingAdded: true
                })
            } else if (editRatingsReviewsPayload.type === "review") {
                await jobGuardRepo.update({ userId: editRatingsReviewsPayload.ratedTo, jobId: editRatingsReviewsPayload.jobId }, {
                    isGuardReviewAdded: true
                })
            }

        }
        if (editRatingsReviewsPayload.type === "rating") {
            insertedObj = await ratingsRepo.update({ id: editRatingsReviewsPayload.id }, {
                ratings: editRatingsReviewsPayload.ratings,
                jobId: editRatingsReviewsPayload.jobId,
                // guardId: editRatingsReviewsPayload.guardId,
                isAppRate: editRatingsReviewsPayload.isAppRate,
                ratedBy: userId,
                ratedTo: editRatingsReviewsPayload.ratedTo,
                type: editRatingsReviewsPayload.userType,
                // userId: editRatingsReviewsPayload.userId,
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                updatedOn: new Date(),
            });
        } else if (editRatingsReviewsPayload.type === "review") {
            insertedObj = await ratingsRepo.update({ id: editRatingsReviewsPayload.id }, {
                reviews: editRatingsReviewsPayload.reviews,
                type: editRatingsReviewsPayload.userType,
                ratedBy: userId,
                ratedTo: editRatingsReviewsPayload.reviewedTo,
                // userId: editRatingsReviewsPayload.userId,
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                updatedOn: new Date(),
            });
        }
        return insertedObj;
    }

    private async sendJobStatusNotification(Name: any, jobId: any, id: any, type: any) {

        let pushStatus = 'Congratulations!!';
        let message = `${Name} has given a star rating for his experience on the job #${jobId}. Spend some time to view the same please`
        if (type != "rating") {
            message = `${Name} has given review experience for the job #${jobId}. Spend some time to view the same please`
        }


        let notificationDetails =
            await this.NotificationRepository.saveNotification(
                id,
                'PUSH',
                `FIDO - Job ${pushStatus}`,
                message,
                'JOB_DETAIL',
                jobId
            );
        let returnMsg = await this.pushService.sendPush(
            `FIDO - Job ${pushStatus}`,
            message,
            [id],
            { jobId: jobId },
            notificationDetails
        );
        await this.NotificationRepository.updateNotificationStatus(
            notificationDetails.id,
            returnMsg
        );
    }
}
