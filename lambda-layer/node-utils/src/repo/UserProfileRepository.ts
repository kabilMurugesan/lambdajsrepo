import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IUserProfileRepository } from '../interfaces/repo/IUserProfileRepository';
import {
  CreateUserProfileRequest,
  SaveJobInterestRequest,
} from '../dto/UserProfileDTO';
import { UserProfile } from '../entities/UserProfile';
import { JobInterest } from '../entities/JobInterest';
import { NotFoundException } from '../shared/errors/all.exceptions';
import { IsNull, Not, SelectQueryBuilder } from 'typeorm';
import { GuardJobInterest } from '../entities/GuardJobInterest';
import { GlobalConstants } from '../constants/constants';
import { User } from '../entities/User';
import { UserStripeDetails } from '../entities/UserStripeDetails';
import { GuardRatings } from '../entities/ratings';
import { GuardReviews } from '../entities/reviews';
import { JobGuards } from '../entities/JobGuards';
import { ChatParticipants } from '../entities/ChatParticipants';
import { Payments } from '../entities/Payments';
import { UserAvailabilityDate } from '../entities/UserAvailabilityTime';
import { TeamMembers } from '../entities/TeamMembers';
import { Team } from '../entities/Team';

@injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    @inject(TYPES.IAwsService) private readonly awsService: IAwsService,
    private readonly globalConstants = GlobalConstants
  ) { }
  async createUserProfile(
    createUserProfilePayload: CreateUserProfileRequest,
    user: any
  ): Promise<UserProfile> {
    const userId = user.id;
    const repo = await this.database.getRepository(UserProfile);
    const isValidUserProfile = await repo.findOneBy({
      userId,
    });
    if (isValidUserProfile) {
      if (
        createUserProfilePayload.firstName !== undefined &&
        createUserProfilePayload.firstName !== ''
      ) {
        createUserProfilePayload.isProfileInfoAdded = true;
      }
      if (
        createUserProfilePayload.aPostLicenseNo !== undefined &&
        createUserProfilePayload.aPostLicenseNo !== ''
      ) {
        createUserProfilePayload.isCertVerificationAdded = true;
        createUserProfilePayload.IsApostAdded = true;
      }
      if (
        createUserProfilePayload.srbLicenseNo !== undefined &&
        createUserProfilePayload.srbLicenseNo !== ''
      ) {
        createUserProfilePayload.isCertVerificationAdded = true;
        createUserProfilePayload.IsAsrbAdded = true;
      }
      if (
        createUserProfilePayload.guardJobRate !== undefined &&
        createUserProfilePayload.guardJobRate
      ) {
        createUserProfilePayload.isJobRateAdded = true;
      }

      createUserProfilePayload.updatedOn = new Date();
      createUserProfilePayload.isProfileInfoAdded = true;
      await repo.update({ userId }, createUserProfilePayload);
    } else {
      return Promise.reject(new NotFoundException('User profile not exist'));
    }
    const response = await repo
      .createQueryBuilder('userProfile')
      .where('userProfile.userId = :userId', { userId })
      .innerJoinAndSelect('userProfile.user', 'user')
      .getOne();
    return response;
  }

  private async generateInsertObj(
    saveJobInterestPayload: SaveJobInterestRequest,
    userId: string
  ): Promise<any[]> {
    const insertObj: any[] = [];

    saveJobInterestPayload.items.forEach((item) => {
      insertObj.push({
        jobInterestId: item,
        userId,
        createdOn: new Date(),
        updatedOn: new Date(),
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
      });
    });

    return insertObj;
  }

  async saveJobInterest(
    saveJobInterestPayload: SaveJobInterestRequest,
    user: any
  ): Promise<GuardJobInterest> {
    const userId = user.id;
    const repo = await this.database.getRepository(GuardJobInterest);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const isAlreadyExist = await repo.findOneBy({
      userId,
    });

    if (isAlreadyExist) {
      await repo.delete({ userId });
    }

    const insertObj = await this.generateInsertObj(
      saveJobInterestPayload,
      userId
    );
    await repo.insert(insertObj);
    await userProfileRepo.update({ userId }, { isJobInterestAdded: true });
    const response = await userProfileRepo.findOneBy({
      userId,
    });
    return response; //<GuardJobInterest>
  }

  async getJobInterest(user: any): Promise<JobInterest[]> {
    const userId = user.id;
    const repo = await this.database.getRepository(JobInterest);

    const queryBuilder: SelectQueryBuilder<JobInterest> =
      repo.createQueryBuilder('jobInterest');

    const response = await queryBuilder
      .select([
        'jobInterest.id',
        'jobInterest.interestName',
        'jobInterest.description',
        'jobInterest.displayOrder',
        'jobInterest.interestType',
      ])
      .leftJoinAndSelect(
        'jobInterest.guardJobInterests',
        'guardJobInterest',
        'guardJobInterest.userId = :userId',
        { userId }
      )
      .where('jobInterest.status = :status', { status: 1 })
      .orderBy('jobInterest.displayOrder', 'ASC')
      .getMany();

    return response;
  }

  async getUserProfile(cognitoUserId: any): Promise<User[]> {
    const userRepo = await this.database.getRepository(User);
    const response = await userRepo.findOneBy({
      cognitoUserId,
    });
    return response;
  }

  private async calculateTotalRating(ratingsResponse: any) {
    let totalRatings = 0;
    let totalRating = 0;

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

    await Promise.all(calculateRatingsPromises);

    if (totalRatings > 0) {
      const calculateRating = Math.min(totalRatings, 5);
      totalRating += calculateRating;
    }

    return totalRating;
  }

  private async checkAdminChatEnabled(
    userId: string,
    superAdminDetails: any
  ): Promise<any> {
    const chatParticipantsRepo = await this.database.getRepository(
      ChatParticipants
    );

    const targetUserIds = [userId, superAdminDetails.id];
    const chatDetails = await chatParticipantsRepo
      .createQueryBuilder('chatParticipant')
      .innerJoin('chatParticipant.chats', 'chat')
      .select('chatParticipant.chatId', 'chatId')
      .groupBy('chatParticipant.chatId')
      .having('COUNT(DISTINCT chatParticipant.userId) = :userCount', {
        userCount: targetUserIds.length,
      })
      .andWhere('chatParticipant.userId IN (:...userIds)', {
        userIds: targetUserIds,
      })
      .andWhere(
        "(chat.isDeleted = :isDeleted AND (chat.jobId IS NULL OR chat.jobId = ''))",
        {
          isDeleted: 0,
        }
      )
      .getRawOne();

    return chatDetails ? chatDetails.chatId : null;
  }
  private async mapTotalRatingToRepresentation(totalRating: any) {
    const decimalPart = totalRating - Math.floor(totalRating); // Extract the decimal part

    if (decimalPart >= 0.9) {
      return Math.ceil(totalRating); // Round up to the nearest integer
    } else if (decimalPart >= 0.51 && decimalPart <= 0.89) {
      return Math.floor(totalRating) + 0.5; // Round down to the nearest half
    } else if (decimalPart >= 0.1 && decimalPart <= 0.5) {
      return Math.floor(totalRating); // Round down to the nearest integer
    } // Add similar conditions for other ranges

    // If no matching range is found, return the original total rating
    return totalRating;
  }
  async getUserProfileById(cognitoUserId: any): Promise<any> {
    const userRepo = await this.database.getRepository(User);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const ratingsRepo = await this.database.getRepository(GuardRatings);
    const paymentsRepo = await this.database.getRepository(Payments);
    const TeamRepo = await this.database.getRepository(Team);
    const TeamMembersRepo = await this.database.getRepository(TeamMembers);
    const userCheck: any = await userRepo.findOneBy({
      cognitoUserId,
    });
    const userId = userCheck.id;
    const response = await userProfileRepo
      .createQueryBuilder('userProfile')
      .where('userProfile.userId = :userId', { userId })
      .innerJoinAndSelect('userProfile.user', 'user')
      .leftJoinAndSelect(
        'userProfile.state',
        'state',
        'userProfile.stateId != "" AND userProfile.stateId IS NOT NULL'
      )
      .getOne();
    // const ratingsResponse: any = await ratingsRepo.find({
    //   where: { ratedTo: userId },
    // });
    // let totalRatings = await this.calculateTotalRating(ratingsResponse);
    const queryBuilder = ratingsRepo.createQueryBuilder('guardRatings')
      .select(['AVG(CAST(guardRatings.ratings AS DECIMAL(10,2))) AS totalRatings'])
      .where('guardRatings.ratedTo = :userId', { userId: userId })
      .andWhere('guardRatings.isDeleted = false')
      .groupBy('guardRatings.ratedTo');

    const results = await queryBuilder.getRawOne();

    const totalRating = results ? parseFloat(results.totalRatings) : 0;
    let mappedRating = 0
    if (totalRating > 0) {
      mappedRating = await this.mapTotalRatingToRepresentation(totalRating);
    }
    const reviewResponse: any = await ratingsRepo.createQueryBuilder('guard_ratings')
      .where('guard_ratings.rated_to = :userId', { userId })
      .andWhere('guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString', { emptyString: '' })
      .getCount();

    if (userCheck.userType === 'GUARD') {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get 1-12 month range
      const currentYear = currentDate.getFullYear();

      const monthlySum = await paymentsRepo
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('payment.paidTo = :userId', { userId: userId })
        .andWhere('MONTH(payment.createdOn) = :month', { month: currentMonth })
        .andWhere('YEAR(payment.createdOn) = :year', { year: currentYear })
        .getRawOne();

      // Yearly Sum
      const yearlySum = await paymentsRepo
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('payment.paidTo = :userId', { userId: userId })
        .andWhere('YEAR(payment.createdOn) = :year', { year: currentYear })
        .getRawOne();

      // Overall Sum
      const allTimeSum = await paymentsRepo
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('payment.paidTo = :userId', { userId: userId })
        .getRawOne();
      response.amountEarned = {
        monthly: monthlySum.sum,
        yearly: yearlySum.sum,
        allTime: allTimeSum.sum,
      };
    }
    response.totalRating = mappedRating;
    response.reviewResponse = reviewResponse;
    const isTeamMemberAddedSuccessfully = await userProfileRepo
      .createQueryBuilder('userProfile')
      .where('userProfile.userId = :userId', { userId })
      .andWhere('userProfile.IsTeamMemberAdded=:IsTeamMemberAdded', { IsTeamMemberAdded: true })
      .getOne();
    if (isTeamMemberAddedSuccessfully) {
      const isTeamNameCheck = await TeamMembersRepo.findOne({ where: { userId: userId, isLead: true } })
      if (isTeamNameCheck) {
        const teamName = await TeamRepo.findOne({ where: { id: isTeamNameCheck.teamId } })
        response.teamName = teamName.name
      }
    }
    const superAdminDetails: any = await userRepo.findOneBy({
      userType: 'SUPERADMIN',
    });
    response.adminChatId = await this.checkAdminChatEnabled(
      userId,
      superAdminDetails
    );
    return response;
  }
  async createStripeCustomer(stripeDtls: any): Promise<any> {
    const repo = await this.database.getRepository(UserStripeDetails);
    await repo.insert(stripeDtls);
    const userRepo = await this.database.getRepository(UserProfile);
    await userRepo.update(
      { userId: stripeDtls.userId },
      { isStripeDetailsAdded: true }
    );
  }

  async addSuccessInfoToProfile(user: any): Promise<UserProfile> {
    const userId = user.id;
    const repo = await this.database.getRepository(UserProfile);
    const isValidUserProfile = await repo.findOneBy({
      userId,
    });
    if (isValidUserProfile) {
      await repo.update({ userId: userId }, { IsSuccessInfoAdded: true });
    } else {
      return Promise.reject(new NotFoundException('User profile not exist'));
    }
    // let profileImageUrl = '';
    // const getUserProfileId: any = await repo.findOneBy({
    //   userId,
    // });
    const response = await repo
      .createQueryBuilder('userProfile')
      .where('userProfile.userId = :userId', { userId })
      .innerJoinAndSelect('userProfile.user', 'user')
      .getOne();
    // if (
    //   getUserProfileId.profilePhotoFileName != '' &&
    //   getUserProfileId.profilePhotoFileName != null
    // ) {
    //   const profileImage = await this.awsService.getPreSignedUrl(
    //     `${this.awsData.profileImageFolder}/${getUserProfileId.profilePhotoFileName}`,
    //     900, "image"
    //   );
    //   if (profileImage != null && profileImage != '') {
    //     profileImageUrl = profileImage;
    //   } else {
    //     profileImageUrl = '';
    //   }
    // }
    // response.profileImageUrl = profileImageUrl;
    return response;
  }

  async getUserDetails(userId: any): Promise<any> {
    const repo = await this.database.getRepository(UserProfile);
    const response = await repo
      .createQueryBuilder('userProfile')
      .select([
        'userProfile.firstName AS firstName',
        'userProfile.lastName AS lastName',
        'userProfile.userId AS userId',
        'u.email AS email',
      ])
      .innerJoin('user', 'u', 'userProfile.userId = u.id')
      .where('userProfile.userId = :userId', { userId })
      .getRawOne();
    return response;
  }

  async getUserAvailabilityById(user: any): Promise<any> {
    const userId = user.id
    const userAvailabilityRepo = await this.database.getRepository(UserAvailabilityDate);
    const response: any = await userAvailabilityRepo.createQueryBuilder('ua')
      .select(['ud.weekday AS weekday', 'ua.start_time AS startTime', 'ua.end_time AS endTime'])
      .innerJoin('user_availability_day', 'ud', 'ua.user_availability_id = ud.id')
      .where('ua.user_id = :userId', { userId: userId })
      .getRawMany();

    const mappedResponses = await response.map((res: any) => ({
      id: this.mapWeekdayFromDatabase(res.weekday),
      weekday: res.weekday,
      startTime: res.startTime,
      endTime: res.endTime,
    }));
    const sortedMappedResponses = mappedResponses.sort((a: any, b: any) => a.id - b.id);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Create a new array to store the modified response with isSelected property
    const modifiedResponse = await daysOfWeek.map((day, i) => {
      const availability = response.find((item: any) => item.weekday === day);
      return { day, isSelected: availability ? true : false, id: i };
    });

    return { availabilityDay: sortedMappedResponses, weekdays: modifiedResponse }


  }
  private mapWeekdayFromDatabase(weekday: string) {
    const daysMapping: Record<string, number> = {
      'Sun': 0,
      'Mon': 1,
      'Tue': 2,
      'Wed': 3,
      'Thu': 4,
      'Fri': 5,
      'Sat': 6,
    };

    return daysMapping[weekday];
  }
}
