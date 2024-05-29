import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IListRepository } from '../interfaces/repo/IAdminListRepository';
import { Team } from '../entities/Team';
import { TeamMembers } from '../entities/TeamMembers';
import { UserProfile } from '../entities/UserProfile';
import { Between, Brackets, FindManyOptions, In, IsNull, Not } from 'typeorm';
import { Company } from '../entities/Company';
import { GuardJobInterest } from '../entities/GuardJobInterest';
// import { externalConfig } from '../configuration/externalConfig';
import { checkList } from '../entities/CheckList';
import { Job } from '../entities/Job';
import { JobGuards } from '../entities/JobGuards';
import { JobInterest } from '../entities/JobInterest';
import { GuardRatings } from '../entities/ratings';
import { GuardReviews } from '../entities/reviews';
import { JobGuardCoordinates } from '../entities/GuardCoordinates';
import moment from 'moment';
import { User } from '../entities/User';
import { Payments } from '../entities/Payments';
import { JobDay } from '../entities/JobDays';
import { Chats } from '../entities/Chats';
import { FavoriteGuard } from '../entities/GuardFavourites';
import { JobEventTypes } from '../entities/JobEventTypes';
import { completedCheckList } from '../entities/CompletedCheckList';

@injectable()
export class ListRepository implements IListRepository {
  // private readonly awsData: any = externalConfig.AWS;

  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService // @inject(TYPES.IAwsService) private readonly awsService: IAwsService
  ) {}
  async getGuardList(
    searchKeyword: string,
    page: number,
    pageSize: number,
    platform: any
  ): Promise<any> {
    const teamRepository = await this.database.getRepository(Team);
    const queryBuilder = await teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect(
        'team.teamMembers',
        'teamMembers',
        'team.id = teamMembers.teamId'
      )
      .leftJoinAndSelect('team.company', 'company')
      .leftJoin('teamMembers.userProfile', 'userProfile')
      .leftJoin('userProfile.user', 'user')
      .andWhere('(user.status = :status1 OR user.status = :status2)', {
        status1: 1,
        status2: 2,
      })
      // .andWhere('teamMembers.isLead = :isLead', { isLead: true })
      .orderBy('team.createdOn', 'DESC');
    if (searchKeyword) {
      const sanitizedKeyword = `%${searchKeyword.replace(/[\\%_]/g, '\\$&')}%`;
      if (platform === 'mobile') {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(`team.name LIKE :nameKeyword`, {
              nameKeyword: sanitizedKeyword,
            });
          })
        );
      }
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('company.companyEmail LIKE :emailKeyword', {
            emailKeyword: sanitizedKeyword,
          }).orWhere(`team.name LIKE :nameKeyword`, {
            nameKeyword: sanitizedKeyword,
          });
        })
      );
    }

    const [results, totalCount] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageType: 'team',
    };
  }

  private setName(firstName: any, lastName: any) {
    let fullName = '-';

    if (firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    } else if (firstName) {
      fullName = firstName;
    } else if (lastName) {
      fullName = lastName;
    }

    return fullName;
  }

  private setAddress(addressLine1: any, addressLine2: any) {
    let fullAddress = '-';

    if (addressLine1 && addressLine2) {
      fullAddress = `${addressLine1} ${addressLine2}`;
    } else if (addressLine1) {
      fullAddress = addressLine1;
    } else if (addressLine2) {
      fullAddress = addressLine2;
    }

    return fullAddress;
  }

  async getGuardTeamList(
    searchKeyword: string,
    teamId: string,
    page: number,
    pageSize: number,
    guardInterestId: any,
    platform: any
  ): Promise<any> {
    const teamRepository = await this.database.getRepository(TeamMembers);
    const queryBuilder = await teamRepository
      .createQueryBuilder('teamMembers')
      .leftJoinAndSelect('teamMembers.userProfile', 'userProfile')
      .leftJoinAndSelect('userProfile.user', 'user')
      .leftJoinAndSelect('userProfile.state', 'state')
      // .leftJoinAndSelect('userProfile.state', 'state', 'userProfile.srbStateId != "" AND userProfile.srbStateId IS NOT NULL')
      .where('teamMembers.team_id = :teamId', { teamId: teamId })
      .leftJoinAndSelect('user.guardJobInterest', 'guardJobInterest')
      .andWhere('(user.status = :status1 OR user.status = :status2)', {
        status1: 1,
        status2: 2,
      })
      // .andWhere('user.status = :status', { status: 1 })
      .orderBy('userProfile.createdOn', 'DESC');
    if (searchKeyword) {
      const sanitizedKeyword = `%${searchKeyword.replace(/[\\%_]/g, '\\$&')}%`;
      if (platform === 'mobile') {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(
              `CONCAT(userProfile.firstName, ' ', userProfile.lastName) LIKE :nameKeyword`,
              { nameKeyword: sanitizedKeyword }
            );
          })
        );
      }
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email LIKE :emailKeyword', {
            emailKeyword: sanitizedKeyword,
          }).orWhere(
            `CONCAT(userProfile.firstName, ' ', userProfile.lastName) LIKE :nameKeyword`,
            { nameKeyword: sanitizedKeyword }
          );
        })
      );
    }
    if (guardInterestId) {
      queryBuilder.andWhere(
        'guardJobInterest.jobInterestId = :guardJobInterestId',
        {
          guardJobInterestId: guardInterestId, // Replace with the actual ID you want to filter by
        }
      );
    }

    const [results, totalCount] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    // let profilePhotoFileName = '';
    await Promise.all(
      results.map(async (result) => {
        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const reviewsRepo = await this.database.getRepository(GuardReviews);
        // const ratingsResponse: any = await ratingsRepo.find({
        //   where: {
        //     ratedTo: result.userProfile.userId,
        //     isDeleted: false,
        //   },
        // });
        // let totalRating = 0;
        // const calculateRatingsPromises = ratingsResponse.map((rating: any) => {
        //   return new Promise<number | void>((resolve) => {
        //     // Assuming 'ratings' field contains numeric values as strings
        //     const ratingValue = parseFloat(rating.ratings);
        //     if (!isNaN(ratingValue)) {
        //       totalRatings += ratingValue;
        //     }
        //     console.log('Rating Value:', ratingValue, 'Total Ratings:', totalRatings);
        //     resolve();
        //   });
        // });
        // await Promise.all(calculateRatingsPromises);

        // let totalRatings = 0;

        const queryBuilder = ratingsRepo
          .createQueryBuilder('guardRatings')
          .select([
            'AVG(CAST(guardRatings.ratings AS DECIMAL(10,2))) AS totalRatings',
          ])
          .where('guardRatings.ratedTo = :userId', {
            userId: result.userProfile.userId,
          })
          .andWhere('guardRatings.isDeleted = false')
          .groupBy('guardRatings.ratedTo');

        const results = await queryBuilder.getRawOne();

        const totalRating = results ? parseFloat(results.totalRatings) : 0;
        let mappedRating = 0;
        if (totalRating > 0) {
          mappedRating = await this.mapTotalRatingToRepresentation(totalRating);
        }
        // Wait for all promises to resolve
        console.log(mappedRating);

        // if (totalRatings > 0) {
        //   const calculateRating = Math.min(totalRatings, 5);
        //   totalRating = Math.round(calculateRating * 10) / 10;
        // }
        // Wait for all promises to resolve
        const reviewResponse: any = await ratingsRepo
          .createQueryBuilder('guard_ratings')
          .where('guard_ratings.rated_to = :userId', {
            userId: result.userProfile.userId,
          })
          .andWhere(
            'guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString',
            { emptyString: '' }
          )
          .getCount();
        result.reviewCount = reviewResponse;

        result.totalRating = mappedRating;
        const firstName = result.userProfile.firstName;
        const lastName = result.userProfile.lastName;
        const fullName = this.setName(firstName, lastName);

        result.fullName = fullName;
        const addressLine1 = result.userProfile.addressLine1;
        const addressLine2 = result.userProfile.addressLine2;
        const fullAddress = this.setAddress(addressLine1, addressLine2);

        result.fullAddress = fullAddress;
      })
    );

    return {
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageType: 'teamindividual',
    };
  }
  async getAllList(
    searchKeyword: string,
    page: number,
    pageSize: number,
    platform: any
  ): Promise<any> {
    const teamRepository = await this.database.getRepository(UserProfile);
    const queryBuilder = await teamRepository
      .createQueryBuilder('userProfile')
      .innerJoinAndSelect(
        'userProfile.user',
        'user',
        'userProfile.userId=user.id'
      )
      .leftJoinAndSelect('userProfile.state', 'state')
      .leftJoinAndSelect('userProfile.city', 'city')
      // .leftJoinAndSelect('userProfile.state', 'state', 'userProfile.srbStateId != "" AND userProfile.srbStateId IS NOT NULL')
      .andWhere('(user.status = :status1 OR user.status = :status2)', {
        status1: 1,
        status2: 2,
      })
      .andWhere('user.userType = :userType', { userType: 'CUSTOMER' })
      // .andWhere('user.guardAccountType = :guardAccountType', { guardAccountType: `CUSTOMER` })
      .orderBy('userProfile.createdOn', 'DESC');
    if (searchKeyword) {
      const sanitizedKeyword = `%${searchKeyword.replace(/[\\%_]/g, '\\$&')}%`;
      if (platform === 'mobile') {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(
              `CONCAT(userProfile.firstName, ' ', userProfile.lastName) LIKE :nameKeyword`,
              { nameKeyword: sanitizedKeyword }
            );
          })
        );
      }
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email LIKE :emailKeyword', {
            emailKeyword: sanitizedKeyword,
          }).orWhere(
            `CONCAT(userProfile.firstName, ' ', userProfile.lastName) LIKE :nameKeyword`,
            { nameKeyword: sanitizedKeyword }
          );
        })
      );
    }

    const [results, totalCount] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // let profilePhotoFileName = ''; // Initialize default value
    await Promise.all(
      results.map(async (result) => {
        const firstName = result.firstName;
        const lastName = result.lastName;
        const fullName = this.setName(firstName, lastName);

        result.fullName = fullName;
        const addressLine1 = result.addressLine1;
        const addressLine2 = result.addressLine2;

        const fullAddress = this.setAddress(addressLine1, addressLine2);

        result.fullAddress = fullAddress;
      })
    );

    return {
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageType: 'customer',
    };
  }
  async getGuardsList(
    searchKeyword: string,
    page: number,
    pageSize: number,
    type: string,
    guardInterestId: any,
    platform: any
  ): Promise<any> {
    const teamRepository = await this.database.getRepository(UserProfile);
    // const userType = type == `individual` ? 'INDIVIDUAL' : ''
    const queryBuilder = await teamRepository
      .createQueryBuilder('userProfile')
      .innerJoinAndSelect(
        'userProfile.user',
        'user',
        'userProfile.userId=user.id'
      )
      .leftJoinAndSelect('userProfile.state', 'state')
      // .leftJoinAndSelect('userProfile.state', 'state', 'userProfile.srbStateId != "" AND userProfile.srbStateId IS NOT NULL')
      .andWhere('user.isEmailVerified = :isEmailVerified', {
        isEmailVerified: true,
      })
      .andWhere('user.userType = :userType', { userType: 'GUARD' })
      // .andWhere('user.status = :status', { status: 1 })
      .andWhere('(user.status = :status1 OR user.status = :status2)', {
        status1: 1,
        status2: 2,
      })
      .leftJoinAndSelect('user.guardJobInterest', 'guardJobInterest')
      .orderBy('userProfile.createdOn', 'DESC');
    if (searchKeyword) {
      const sanitizedKeyword = `%${searchKeyword.replace(/[\\%_]/g, '\\$&')}%`;
      if (platform === 'mobile') {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(
              `CONCAT(userProfile.firstName, ' ', userProfile.lastName) LIKE :nameKeyword`,
              { nameKeyword: sanitizedKeyword }
            );
          })
        );
      }
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email LIKE :emailKeyword', {
            emailKeyword: sanitizedKeyword,
          }).orWhere(
            `CONCAT(userProfile.firstName, ' ', userProfile.lastName) LIKE :nameKeyword`,
            { nameKeyword: sanitizedKeyword }
          );
        })
      );
    }
    if (guardInterestId) {
      queryBuilder.andWhere(
        'guardJobInterest.jobInterestId = :guardJobInterestId',
        {
          guardJobInterestId: guardInterestId, // Replace with the actual ID you want to filter by
        }
      );
    }
    const [results, totalCount] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    await Promise.all(
      results.map(async (result) => {
        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const reviewsRepo = await this.database.getRepository(GuardReviews);
        // const ratingsResponse: any = await ratingsRepo.find({
        //   where: {
        //     ratedTo: result.userId,
        //     isDeleted: false,
        //   },
        // });
        // let totalRatings = 0;
        // console.log('222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222')
        // const calculateRatingsPromises = ratingsResponse.map((rating: any) => {
        //   return new Promise<number | void>((resolve) => {
        //     // Assuming 'ratings' field contains numeric values as strings
        //     const ratingValue = parseFloat(rating.ratings);
        //     if (!isNaN(ratingValue)) {
        //       totalRatings += ratingValue;
        //     }
        //     console.log('Rating Value:', ratingValue, 'Total Ratings:', totalRatings, "111111111111111111111111111111111111111111111111111111111111111111111111111111111");
        //     resolve();
        //   });
        // });
        // await Promise.all(calculateRatingsPromises);
        // let totalRating = 0;
        // if (totalRatings > 0) {
        //   const calculateRating = Math.min(totalRatings, 5);
        //   totalRating = Math.round(calculateRating * 10) / 10;
        // }
        // Wait for all promises to resolve
        // const query = await ratingsRepo
        //   .createQueryBuilder()
        //   .select('COALESCE(SUM(CAST(guardRatings.ratings AS DECIMAL(10,2))), 0)', 'totalRatings')
        //   .from(GuardRatings, 'guardRatings')
        //   .where('guardRatings.ratedTo = :userId', { userId: result.userId })
        //   .andWhere('guardRatings.isDeleted = false');

        // const totalRatings = await query.getRawOne();
        // let totalRating = totalRatings ? parseFloat(result.totalRatings) : 0;

        const queryBuilder = ratingsRepo
          .createQueryBuilder('guardRatings')
          .select([
            'AVG(CAST(guardRatings.ratings AS DECIMAL(10,2))) AS totalRatings',
          ])
          .where('guardRatings.ratedTo = :userId', { userId: result.userId })
          .andWhere('guardRatings.isDeleted = false')
          .groupBy('guardRatings.ratedTo');

        const results = await queryBuilder.getRawOne();

        const totalRating = results ? parseFloat(results.totalRatings) : 0;
        let mappedRating = 0;
        if (totalRating > 0) {
          mappedRating = await this.mapTotalRatingToRepresentation(totalRating);
        }
        // Wait for all promises to resolve
        console.log(mappedRating);

        const reviewResponse: any = await ratingsRepo
          .createQueryBuilder('guard_ratings')
          .where('guard_ratings.rated_to = :userId', { userId: result.userId })
          .andWhere(
            'guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString',
            { emptyString: '' }
          )
          .getCount();
        result.reviewCount = reviewResponse;
        const firstName = result.firstName;
        const lastName = result.lastName;
        const fullName = this.setName(firstName, lastName);

        result.fullName = fullName;
        const addressLine1 = result.addressLine1;
        const addressLine2 = result.addressLine2;
        const fullAddress = this.setAddress(addressLine1, addressLine2);

        result.fullAddress = fullAddress;
        result.totalRating = mappedRating;
        result.profileImageUrl = ''; // Initialize default value
      })
    );

    return {
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageType: 'individual',
    };
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
  async getUserDetailsById(
    id: any,
    type: any,
    page: any,
    pageSize: any,
    jobId: any,
    user: any
  ): Promise<any> {
    const incomingUserId = user.id;
    // const userRepo = await this.database.getRepository(User);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const companyRepo = await this.database.getRepository(Company);
    // const guardInterestRepo = await this.database.getRepository(
    //     GuardJobInterest
    // );
    const guardJobRepo = await this.database.getRepository(JobGuards);
    const checkListRepo = await this.database.getRepository(checkList);
    const completedCheckListRepo = await this.database.getRepository(
      completedCheckList
    );
    const jobRepo = await this.database.getRepository(Job);
    const favouriteRepo = await this.database.getRepository(FavoriteGuard);
    const reviewRepo = await this.database.getRepository(GuardReviews);
    const jobDayRepository = await this.database.getRepository(JobDay);
    const guardCoordinatesRepo = await this.database.getRepository(
      JobGuardCoordinates
    );
    if (type == 'company') {
      const companyCheck: any = await companyRepo.findOneBy({
        id: id,
      });
      if (!companyCheck) {
        return { data: '', message: 'Please Enter companyId.' };
      }
      const response = await companyRepo
        .createQueryBuilder('company')
        .where('company.id = :id', { id: id })
        .getOne();
      return response;
    }
    if (type == 'user') {
      const userCheck: any = await userProfileRepo.findOneBy({
        userId: id,
      });
      if (!userCheck) {
        return { data: '', message: 'Please Enter UserId.' };
      }
      const userId = id;
      const response = await userProfileRepo
        .createQueryBuilder('userProfile')
        .leftJoinAndSelect('userProfile.state', 'state')
        .leftJoinAndSelect('userProfile.city', 'city')
        .where('userProfile.userId = :userId', { userId: id })
        .innerJoinAndSelect('userProfile.user', 'user')
        .getOne();
      // let profilePhotoFileName = ''; // Initialize default value

      if (response) {
        const firstName = response.firstName;
        const lastName = response.lastName;
        const fullName = this.setName(firstName, lastName);

        response.fullName = fullName;

        const addressLine1 = response.addressLine1;
        const addressLine2 = response.addressLine2;
        const fullAddress = this.setAddress(addressLine1, addressLine2);

        response.fullAddress = fullAddress;
      }
      const ratingsRepo = await this.database.getRepository(GuardRatings);
      const reviewsRepo = await this.database.getRepository(GuardReviews);
      const ratingsResponse: any = await ratingsRepo.find({
        where: {
          ratedTo: userId,
          isDeleted: false,
          isAppRate: false,
        },
      });
      // let totalRatings = 0;

      const queryBuilder = ratingsRepo
        .createQueryBuilder('guardRatings')
        .select([
          'AVG(CAST(guardRatings.ratings AS DECIMAL(10,2))) AS totalRatings',
        ])
        .where('guardRatings.ratedTo = :userId', { userId: userId })
        .andWhere('guardRatings.isDeleted = false')
        .groupBy('guardRatings.ratedTo');

      const results = await queryBuilder.getRawOne();

      const totalRating = results ? parseFloat(results.totalRatings) : 0;
      let mappedRating = 0;
      if (totalRating > 0) {
        mappedRating = await this.mapTotalRatingToRepresentation(totalRating);
      }
      // Wait for all promises to resolve
      console.log(mappedRating);

      let pageSize = 3;
      let page = 1;
      const reviewResponse: any = await ratingsRepo
        .createQueryBuilder('guard_ratings')
        .where('guard_ratings.ratedTo = :id', { id })
        .andWhere('guard_ratings.isDeleted = false')
        .andWhere('guard_ratings.isAppRate = false')
        .andWhere(
          'guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString',
          { emptyString: '' }
        )
        .orderBy('guard_ratings.createdOn', 'DESC')
        .take(pageSize)
        .skip((page - 1) * pageSize)
        .getManyAndCount();
      const [reviews, reviewCount] = reviewResponse;
      // const reviewCountResponse: any = await ratingsRepo.findAndCount({
      //   where: {
      //     ratedTo: userId,
      //     isDeleted: false,
      //     isAppRate: false,
      //     reviews: Not(IsNull()),
      //   },
      //   order: {
      //     createdOn: 'DESC',
      //   },
      // });
      // const [revie, reviewResponseCount] = reviewCountResponse;
      const reviewResponseCount: any = await ratingsRepo
        .createQueryBuilder('guard_ratings')
        .where('guard_ratings.rated_to = :userId', { userId: userId })
        .andWhere(
          'guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString',
          { emptyString: '' }
        )
        .getCount();
      await Promise.all(
        reviews.map(async (result: any) => {
          const userName = await userProfileRepo.findOne({
            where: { userId: result.ratedBy },
          });
          const firstName = userName.firstName;
          const lastName = userName.lastName;
          const fullName = this.setName(firstName, lastName);

          const ratings = await ratingsRepo.findOne({
            where: { jobId: result.jobId },
          });
          result.ratings = ratings.ratings;
          result.fullName = fullName;

          result.profilePhotoFileName = userName.profilePhotoFileName;
        })
      );
      response.reviews = reviews;
      response.totalRating = mappedRating;
      response.reviewCount = reviewResponseCount;

      if (jobId) {
        const jobUser = await jobRepo.findOne({ where: { id: jobId } });
        if (jobUser) {
          const isFavoriteGuard = await favouriteRepo.findOne({
            where: { guardId: userId, userId: jobUser.userId },
          });
          if (isFavoriteGuard) {
            response.is_favorite_guard = isFavoriteGuard.isFavorite;
            response.favorite_guard_id = isFavoriteGuard.id;
          } else {
            (response.is_favorite_guard = false),
              (response.favorite_guard_id = '');
          }
        }
      }
      if (
        response.user.userType !== '' &&
        response.user.userType !== null &&
        response.user.userType == 'GUARD'
      ) {
        const userId = response.userId;
        const jobRepo = await this.database.getRepository(JobGuards);
        const guardJobInterestRepository = await this.database.getRepository(
          GuardJobInterest
        );
        let query = jobRepo
          .createQueryBuilder('JobGuards')
          .innerJoinAndSelect('JobGuards.job', 'job')
          .where('JobGuards.userId = :userId', { userId: userId })
          .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
          .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
          .orderBy('job.createdOn', 'DESC');
        const [results, jobCount] = await query
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .getManyAndCount();
        // const jobResponse: any = await jobRepo.findAndCount({
        //   where: {
        //     userId: userId,
        //   },
        //   order: {
        //     createdOn: 'DESC',
        //   },
        // });
        const jobCompletedResponse: any = await jobRepo.findAndCount({
          where: {
            userId: userId,
            jobStatus: 2,
          },
          order: {
            createdOn: 'DESC',
          },
        });

        const guardInterests = await guardJobInterestRepository
          .createQueryBuilder('guardJobInterest')
          .select('jobInterest.interestName', 'interestName')
          .addSelect('jobInterest.interestType', 'interestType')
          .innerJoin('guardJobInterest.jobInterest', 'jobInterest')
          .where('guardJobInterest.userId = :userId', { userId })
          .getRawMany();

        // const [job, jobCount] = jobResponse;
        const jobCompletedCount = jobCompletedResponse[1];
        response.jobCount = jobCount;
        response.guardInterests = guardInterests;
        response.jobCompletedCount = jobCompletedCount;
      }
      response.about = `Hi this is ${response?.firstName} living in ${response?.addressLine1}`;
      response.worksAt = '';
      const teamNameRepo = await this.database.getRepository(TeamMembers);
      const teamNames = await teamNameRepo
        .createQueryBuilder('teamMembers')
        .innerJoinAndSelect('teamMembers.team', 'team')
        .where('teamMembers.userId = :userId', { userId })
        .getMany();
      const teamNamesList = teamNames
        .map((teamMember) => teamMember.team.name)
        .join(', ');
      response.teamNamesList = teamNamesList;
      return response;
    }
    if (type === 'job') {
      let query = guardJobRepo
        .createQueryBuilder('jobGuards')
        .innerJoin('jobGuards.job', 'job')
        .select([
          'job.jobRefId as jobRefId',
          'job.userId as userId',
          'job.jobName as jobName',
          'job.guardCoverageId as guardCoverageId',
          // 'job.guardServiceId as guardServiceId',
          'job.noOfGuards as noOfGuards',
          'job.bookingReason as bookingReason',
          'job.startDate as startDate',
          'job.endDate as endDate',
          'job.jobVenue as jobVenue',
          'job.jobVenueLocationCoordinates as jobVenueLocationCoordinates',
          'job.jobVenueRadius as jobVenueRadius',
          'job.jobCost as jobCost',
          'job.createdOn as createdOn',
          'job.id as id',
          'jobGuards.jobStatus as jobStatus',
          'jobGuards.isPunch as isPunch',
          'jobGuards.userId as guardId',
          'job.totalCost as totalCost',
          'job.guardSecurityServiceId as guardSecurityServiceId',
        ])
        .where('jobGuards.id = :id', { id: id })
        .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
        .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
        .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', {
          isJobDeletedByAdmin: false,
        });
      const response = await query.getRawOne();
      console.log(response, 'response');
      // return response

      let jobGuardsCount = await guardJobRepo.findAndCount({
        where: {
          jobId: response.id,
        },
      });
      const isGuardFavourite = await favouriteRepo.findOne({
        where: { guardId: response.guardId, userId: response.userId },
      });
      if (isGuardFavourite) {
        response.is_favorite_guard = true;
      } else {
        response.is_favorite_guard = false;
      }
      let selectedGuardName: { guardName: string }[] = [];
      if (jobGuardsCount && jobGuardsCount.length > 0) {
        const interestNamesPromises = jobGuardsCount[0].map(async (guard) => {
          let User = await userProfileRepo.findOne({
            where: {
              userId: guard.userId,
            },
          });
          let guardName = this.setName(User.firstName, User.lastName);
          let profilePhotoFileName = User.profilePhotoFileName;
          let userId = guard.userId;
          return {
            guardName: guardName,
            profilePhotoFileName: profilePhotoFileName,
            userId: userId,
          };
        });
        selectedGuardName = await Promise.all(interestNamesPromises);
      }

      let status = 'PENDING';
      if (response.jobStatus === 1) {
        status = 'ACCEPTED';
      } else if (response.jobStatus === 2) {
        status = 'REJECTED';
      } else if (response.jobStatus === 3) {
        status = 'COMPLETED';
      } else if (response.jobStatus === 4) {
        status = 'CANCELLED';
      }
      let User = await userProfileRepo.findOne({
        where: {
          userId: response.userId,
        },
      });
      let createdUser = this.setName(User.firstName, User.lastName);
      let profilePhotoFileName = User.profilePhotoFileName;
      const guardCoverage = await this.getJobInterestDetails(
        response.guardCoverageId
      );
      // const guardService = await this.getJobInterestDetails(
      //   response.guardServiceId
      // );
      response.guardService = await this.getJobServiceTypeDetails(
        response.id,
        2
      );
      const guardSecurityService = await this.getJobInterestDetails(
        response.guardSecurityServiceId
      );
      // const duration = await this.calculateDuration(
      //     response.startDate,
      //     response.endDate
      // );
      let totalhrs = await guardJobRepo.findOne({
        where: { jobId: response.id },
      });
      let totalJobHours = totalhrs.totalJobHours;

      // Extracting the hours and minutes from the decimal representation
      let hours = Math.floor(totalJobHours); // Extracting the whole hours
      let minutes = Math.round((totalJobHours - hours) * 60); // Converting the remaining decimal to minutes

      // If the minutes equal 60, adjust the hours and set the minutes to zero
      if (minutes === 60) {
        hours++;
        minutes = 0;
      }

      // Creating a string representation in hours and minutes
      let timeString = `${hours} hrs`;
      if (minutes > 0) {
        timeString += ` ${minutes} min`;
      }

      let startTimeCheck = await jobDayRepository.findOne({
        where: { jobId: response.id },
      });

      response.startTime = startTimeCheck.startTime;

      const checkLists = await checkListRepo.find({
        where: {
          jobId: response.id,
        },
      });
      const updatedUserCheckLists = checkLists.map(async (checkList) => {
        const completedCheckList = await completedCheckListRepo.findOne({
          where: { checkListId: checkList.id, userId: incomingUserId },
        });

        if (completedCheckList) {
          checkList.isCheckListCompleted = 2;
        } else {
          checkList.isCheckListCompleted = 0;
        }
        return checkList;
      });

      const chatRepo = await this.database.getRepository(Chats);
      const chatDetails = await chatRepo.findOneBy({ jobId: response.id });

      let isAllGuardRatingAdded = false;
      let isAllGuardReviewAdded = false;

      const [customerRatings, ratingCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, isGuardRatingAdded: true },
      });
      const [customerReviews, reviewCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, isGuardReviewAdded: true },
      });
      if (ratingCount == response.noOfGuards) {
        isAllGuardRatingAdded = true;
      }
      if (reviewCount == response.noOfGuards) {
        isAllGuardReviewAdded = true;
      }
      const checkListRepository = await checkListRepo.find({
        where: {
          jobId: response.id,
        },
        select: ['id'],
      });
      const checkListIds = checkListRepository.map((checkList) => checkList.id);

      const allMatch = await Promise.all(checkListIds);
      const completedCheckLists = await completedCheckListRepo.find({
        where: {
          checkListId: In(allMatch),
          userId: incomingUserId,
        },
      });
      let isCheckListCompleted = true;
      if (completedCheckLists.length != checkListRepository.length) {
        isCheckListCompleted = false;
      }

      return {
        ...response,
        jobGuardsCount,
        status,
        guardCoverage,
        // guardService,
        guardSecurityService,
        duration: timeString,
        checkLists,
        createdUser,
        // guardNames,
        selectedGuardName,
        profilePhotoFileName,
        isJobChatCreated: chatDetails ? true : false,
        isAllGuardRatingAdded: isAllGuardRatingAdded,
        isAllGuardReviewAdded: isAllGuardReviewAdded,
        updatedUserCheckLists,
        isCheckListCompleted,
      };
    }
    if (type === 'adminjob') {
      let query = guardJobRepo
        .createQueryBuilder('jobGuards')
        .innerJoin('jobGuards.job', 'job')
        .select([
          'job.jobRefId as jobRefId',
          'job.userId as userId',
          'job.jobName as jobName',
          'job.guardCoverageId as guardCoverageId',
          // 'job.guardServiceId as guardServiceId',
          'job.noOfGuards as noOfGuards',
          'job.bookingReason as bookingReason',
          'job.startDate as startDate',
          'job.endDate as endDate',
          'job.jobVenue as jobVenue',
          'job.jobVenueLocationCoordinates as jobVenueLocationCoordinates',
          'job.jobVenueRadius as jobVenueRadius',
          'job.jobCost as jobCost',
          'job.createdOn as createdOn',
          'job.id as id',
          'jobGuards.jobStatus as jobStatus',
          'job.totalCost as totalCost',
          'job.guardSecurityServiceId as guardSecurityServiceId',
        ])
        .where('jobGuards.jobId = :jobId', { jobId: id })
        .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
        .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true });
      // .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', {
      //   isJobDeletedByAdmin: false,
      // });
      const response = await query.getRawOne();
      console.log(response, 'response');
      // return response

      let jobGuardsCount = await guardJobRepo.findAndCount({
        where: {
          jobId: id,
        },
      });
      // console.log("111111111111111111111111111111111111111111111111111111111111111111111111");

      // const ispunchcheck = await guardJobRepo.findOne({ where: { userId: isPunchUserId, jobId: id } })

      let selectedGuardName: { guardName: string }[] = [];
      if (jobGuardsCount && jobGuardsCount.length > 0) {
        const interestNamesPromises = jobGuardsCount[0].map(async (guard) => {
          let status = 'PENDING';

          if (guard.jobStatus === 1) {
            status = 'ACCEPTED';
          } else if (guard.jobStatus === 2) {
            status = 'REJECTED';
          } else if (guard.jobStatus === 3) {
            status = 'COMPLETED';
          } else if (guard.jobStatus === 4) {
            status = 'CANCELLED';
          }
          let User = await userProfileRepo.findOne({
            where: {
              userId: guard.userId,
            },
          });
          let guardName = this.setName(User.firstName, User.lastName);
          let profilePhotoFileName = User.profilePhotoFileName;
          let userId = guard.userId;
          return {
            guardName: guardName,
            profilePhotoFileName: profilePhotoFileName,
            userId: userId,
            status: status,
          };
        });
        selectedGuardName = await Promise.all(interestNamesPromises);
      }

      const [guardAccept, acceptedCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, jobStatus: 1 },
      });
      const [guardPending, PendingCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, jobStatus: 0 },
      });
      const [guardComplete, completedCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, jobStatus: 3 },
      });
      const [guardReject, rejectedCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, jobStatus: 2 },
      });
      const [guardCancell, cancelledCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, jobStatus: 4 },
      });
      let status = 'ACCEPTED';
      if (PendingCount != 0 && PendingCount > 0) {
        status = 'PENDING';
      }
      if (acceptedCount == response.noOfGuards) {
        status = 'ACCEPTED';
      } else if (completedCount == response.noOfGuards) {
        status = 'COMPLETED';
      } else if (rejectedCount > 0) {
        status = 'REJECTED';
      }
      if (cancelledCount > 0) {
        status = 'CANCELLED';
      }
      let isOneGuardAccepted = false;
      if (acceptedCount >= 1 || completedCount >= 1) {
        isOneGuardAccepted = true;
      }
      let User = await userProfileRepo.findOne({
        where: {
          userId: response.userId,
        },
      });
      let createdUser = this.setName(User.firstName, User.lastName);
      let profilePhotoFileName = User.profilePhotoFileName;
      const guardCoverage = await this.getJobInterestDetails(
        response.guardCoverageId
      );
      response.guardService = await this.getJobServiceTypeDetails(
        response.id,
        2
      );
      // const guardService = await this.getJobInterestDetails(
      //   response.guardServiceId
      // );
      const guardSecurityService = await this.getJobInterestDetails(
        response.guardSecurityServiceId
      );
      // const duration = await this.calculateDuration(
      //     response.startDate,
      //     response.endDate
      // );
      let totalhrs = await guardJobRepo.findOne({
        where: { jobId: response.id },
      });
      let totalJobHours = totalhrs.totalJobHours;

      // Extracting the hours and minutes from the decimal representation
      let hours = Math.floor(totalJobHours); // Extracting the whole hours
      let minutes = Math.round((totalJobHours - hours) * 60); // Converting the remaining decimal to minutes

      // If the minutes equal 60, adjust the hours and set the minutes to zero
      if (minutes === 60) {
        hours++;
        minutes = 0;
      }

      // Creating a string representation in hours and minutes
      let timeString = `${hours} hrs`;
      if (minutes > 0) {
        timeString += ` ${minutes} min`;
      }

      let startTimeCheck = await jobDayRepository.findOne({
        where: { jobId: response.id },
      });

      response.startTime = startTimeCheck.startTime;

      const checkLists = await checkListRepo
        .createQueryBuilder('checkList')
        .select([
          'checkList.id AS id',
          'checkList.jobId AS jobId',
          'checkList.date As date',
          'checkList.time AS time',
          'checkList.userId AS userId',
          'checkList.description AS description',
          'checkList.isCheckListCompleted AS isCheckListCompleted',
          'checkList.createdOn AS createdOn',
          'checkList.updatedOn AS updatedOn',
        ])
        .where('checkList.jobId = :id', { id: id })
        .orderBy(
          'CONCAT(SUBSTRING(checkList.date, 1, 10), " ", checkList.time)',
          'ASC'
        )
        .getRawMany();
      const chatRepo = await this.database.getRepository(Chats);
      const chatDetails = await chatRepo.findOneBy({ jobId: id });
      let isAllGuardRatingAdded = false;
      let isAllGuardReviewAdded = false;

      const [customerRatings, ratingCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, isGuardRatingAdded: true },
      });
      const [customerReviews, reviewCount] = await guardJobRepo.findAndCount({
        where: { jobId: response.id, isGuardReviewAdded: true },
      });
      if (ratingCount == response.noOfGuards) {
        isAllGuardRatingAdded = true;
      }
      if (reviewCount == response.noOfGuards) {
        isAllGuardReviewAdded = true;
      }

      return {
        ...response,
        jobGuardsCount,
        status,
        guardCoverage,
        // guardService,
        guardSecurityService,
        duration: timeString,
        checkLists,
        createdUser,
        // guardNames,
        selectedGuardName,
        profilePhotoFileName,
        isJobChatCreated: chatDetails ? true : false,
        isAllGuardRatingAdded: isAllGuardRatingAdded,
        isAllGuardReviewAdded: isAllGuardReviewAdded,
        isOneGuardAccepted: isOneGuardAccepted,
        // isPunch: ispunchcheck.isPunch
      };
    }
    if (type === 'checklist') {
      const checkLists = await checkListRepo.find({
        where: {
          jobId: id,
        },
      });
      return {
        checkLists,
      };
    }
    if (type === 'biometrics') {
      const jobGuardCoordinatesRepository = await this.database.getRepository(
        JobGuardCoordinates
      );

      const jobGuardsRepo = await this.database.getRepository(JobGuards);
      const userProfileRepo = await this.database.getRepository(UserProfile);
      const totalCountQuery = await jobGuardCoordinatesRepository
        .createQueryBuilder('jgc')
        .select('COUNT(DISTINCT jgc.userId)', 'total')
        .where('jgc.jobId = :jobId', { jobId: id })
        .andWhere('jgc.guardCoordinates IS NOT NULL')
        .getRawOne();

      const totalCount = parseInt(totalCountQuery.total, 10);
      const totalPages = Math.ceil(totalCount / pageSize);
      const result = await jobGuardCoordinatesRepository
        .createQueryBuilder('jgc')
        .select('MIN(jgc.createdOn)', 'firstCheckinTime')
        .addSelect('MAX(jgc.createdOn)', 'endCheckoutTime')
        .addSelect('jgc.jobId', 'jobId')
        .addSelect('jgc.userId', 'guardId')
        .where('jgc.jobId = :jobId', { jobId: id })
        .andWhere('jgc.guardCoordinates IS NOT NULL')
        .groupBy('jgc.userId')
        .orderBy('jgc.createdOn', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getRawMany();

      const biometericsResults = await Promise.all(
        result.map(async (results) => {
          const totalHours = await jobGuardsRepo.findOne({
            where: { jobId: results.jobId },
          });
          let lastCheckoutTime = '';
          if (totalHours.jobStatus == 3 || totalHours.jobStatus == 3) {
            lastCheckoutTime = totalHours.updatedOn;
          }
          results.totalTours = totalHours ? totalHours.totalJobHours : '';
          const userName = await userProfileRepo.findOne({
            where: { userId: results.guardId },
          });
          results.guardName = userName
            ? userName.firstName + ' ' + userName.lastName
            : '';
          ///need to work on future once punch in is completed //////////////
          const guardCoordinatesWithInRadius =
            await jobGuardCoordinatesRepository.findAndCount({
              where: {
                jobId: results.jobId,
                userId: results.guardId,
                isGuardWithInRadius: false,
              },
            });

          const lengthOfArray = guardCoordinatesWithInRadius[0].length;
          const totalTimeInMinutes = lengthOfArray * 30;

          // Convert minutes to hours
          // const totalTimeInHours = totalTimeInMinutes / 60;
          // results.outOfJob = totalTimeInHours;
          // Calculate hours and minutes
          const hours = Math.floor(totalTimeInMinutes / 60);
          const minutes = totalTimeInMinutes % 60;
          results.outOfJob = `${hours}hrs ${minutes}mins`;
          results.lastCheckoutTime = lastCheckoutTime;
          return results;
        })
      );
      return {
        biometericsResults,
        totalCount,
        totalPages,
        currentPage: page,
      };
    }
    if (type === 'guardReview') {
      const ratingsRepo = await this.database.getRepository(GuardRatings);
      const reviewsRepo = await this.database.getRepository(GuardReviews);
      // const reviewResponse: any = await ratingsRepo.findAndCount({
      //   where: {
      //     ratedTo: id,
      //     isDeleted: false,
      //     isAppRate: false,
      //     reviews: Not(IsNull()),
      //   },
      //   order: {
      //     createdOn: 'DESC',
      //   },
      //   take: pageSize,
      //   skip: (page - 1) * pageSize,
      // });
      const reviewResponse: any = await ratingsRepo
        .createQueryBuilder('guard_ratings')
        .where('guard_ratings.ratedTo = :id', { id })
        .andWhere('guard_ratings.isDeleted = false')
        .andWhere('guard_ratings.isAppRate = false')
        .andWhere(
          'guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString',
          { emptyString: '' }
        )
        .orderBy('guard_ratings.createdOn', 'DESC')
        .take(pageSize)
        .skip((page - 1) * pageSize)
        .getManyAndCount();
      const [reviews, reviewCount] = reviewResponse;
      const totalPages = Math.ceil(reviewCount / pageSize);
      await Promise.all(
        reviews.map(async (result: any) => {
          const userName = await userProfileRepo.findOne({
            where: { userId: result.ratedBy },
          });
          const firstName = userName.firstName;
          const lastName = userName.lastName;
          const fullName = this.setName(firstName, lastName);

          const ratings = await ratingsRepo.findOne({
            where: { jobId: result.jobId },
          });
          result.ratings = ratings.ratings;
          result.fullName = fullName;

          result.profilePhotoFileName = userName.profilePhotoFileName;
        })
      );
      // response.reviews = reviews
      const response = {
        reviews: reviews,
        pagination: {
          totalCount: reviewCount,
          totalPages: totalPages,
          currentPage: page,
        },
      };

      return response;
      // return reviews
    }
  }
  private async getJobInterestDetails(jobInterestId: any): Promise<any> {
    const jobInterestRepo = await this.database.getRepository(JobInterest);
    const guardInterest = await jobInterestRepo.findOneBy({
      id: jobInterestId,
    });
    return guardInterest.interestName;
  }
  private async calculateDuration(
    startTime: Date,
    endTime: Date
  ): Promise<string> {
    if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
      return 'Invalid date range';
    }

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 'Invalid date range';
    }

    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const remainingMs = durationMs % (1000 * 60 * 60);
    const minutes = Math.floor(remainingMs / (1000 * 60));

    if (durationMs >= 24 * 60 * 60 * 1000) {
      // If duration is 24 hours or more, return days
      const days = Math.floor(durationMs / (24 * 60 * 60 * 1000));
      return `${days} days`;
    } else {
      // If duration is less than 24 hours, return hours and minutes
      return `${hours} hrs ${minutes} mins`;
    }
  }

  async getJobList(
    searchKeyword: string,
    page: number,
    pageSize: number
  ): Promise<any> {
    const jobRepository = await this.database.getRepository(Job);
    const userRepository = await this.database.getRepository(UserProfile);
    const jobDayRepository = await this.database.getRepository(JobDay);
    let query = jobRepository
      .createQueryBuilder('job')
      .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
      .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
      // .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', { isJobDeletedByAdmin: false })
      .orderBy('job.createdOn', 'DESC');

    if (searchKeyword !== undefined && searchKeyword != '') {
      query = query.andWhere('job.jobName LIKE :jobName', {
        jobName: `%${searchKeyword}%`,
      });
    }

    query = query.skip((page - 1) * pageSize).take(pageSize);
    const response = await query.getMany();

    const guardJobRepo = await this.database.getRepository(JobGuards);

    // Map jobStatus to corresponding fetch interest names
    const interestNamesPromises = response.map(async (jobInterest) => {
      const guardCoverage = await this.getJobInterestDetails(
        jobInterest.guardCoverageId
      );
      // const guardService = await this.getJobInterestDetails(
      //   jobInterest.guardServiceId
      // );
      let guardServiceArrayValue = await this.getJobServiceTypeDetails(
        jobInterest.id,
        2
      );
      let guardServiceArray = guardServiceArrayValue.split(',');
      let guardService;
      if (guardServiceArray.length > 1) {
        guardService = guardServiceArray[0].trim() + ',...';
      } else {
        guardService = guardServiceArray[0].trim();
      }
      const guardSecurityService = await this.getJobInterestDetails(
        jobInterest.guardSecurityServiceId
      );

      let startTimeCheck = await jobDayRepository.findOne({
        where: { jobId: jobInterest.id },
      });
      let startTime = '';
      if (startTimeCheck && startTimeCheck.starTime) {
        startTime = startTimeCheck.startTime;
      }
      // const duration = await this.calculateDuration(
      //     jobInterest.startDate,
      //     jobInterest.endDate
      // );
      let totalhrs = await guardJobRepo.findOne({
        where: { jobId: jobInterest.id },
      });
      // // Find the specific record by ID
      const settingToUpdate = await userRepository.findOne({
        where: { userId: jobInterest.userId },
      });
      let profilePhotoFileName = settingToUpdate.profilePhotoFileName;
      let totalJobHours;
      if (totalhrs && totalhrs.totalJobHours) {
        totalJobHours = totalhrs.totalJobHours;
      }

      // Extracting the hours and minutes from the decimal representation
      let hours;
      if (totalJobHours && totalJobHours != undefined) {
        hours = Math.floor(totalJobHours);
      } // Extracting the whole hours
      let minutes;
      if (hours && hours != undefined) {
        minutes = Math.round((totalJobHours - hours) * 60);
      } // Converting the remaining decimal to minutes

      // If the minutes equal 60, adjust the hours and set the minutes to zero
      if (hours && minutes && minutes === 60) {
        hours++;
        minutes = 0;
      }

      // Creating a string representation in hours and minutes
      let timeString = `${hours} hrs`;
      if (minutes && minutes > 0) {
        timeString += ` ${minutes} min`;
      }

      return {
        ...jobInterest,
        // status,
        guardCoverage,
        guardService,
        guardSecurityService,
        duration: timeString,
        profilePhotoFileName,
        startTime,
      };
    });

    const responseWithInterestNames = await Promise.all(interestNamesPromises);

    let totalCountJob = jobRepository
      .createQueryBuilder('job')
      .andWhere('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
      .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
      // .andWhere('job.isJobDeletedByAdmin= :isJobDeletedByAdmin', { isJobDeletedByAdmin: false })
      .orderBy('job.createdOn', 'DESC');

    if (searchKeyword !== undefined && searchKeyword != '') {
      totalCountJob = totalCountJob.andWhere('job.jobName LIKE :jobName', {
        jobName: `%${searchKeyword}%`,
      });
    }

    const overallJobCount = await totalCountJob.getMany();

    // return responseWithInterestNames;
    const totalCount = await overallJobCount.length; // Total count of jobs

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
      results: responseWithInterestNames,
      pageType: 'job',
    };
  }
  async getDashboard(type: string): Promise<any> {
    const jobRepository = await this.database.getRepository(Job);
    const userProfileRepository = await this.database.getRepository(
      UserProfile
    );
    const userRepository = await this.database.getRepository(User);
    const jobGuardRepository = await this.database.getRepository(JobGuards);
    const teamRepository = await this.database.getRepository(Team);
    const ratingsRepository = await this.database.getRepository(GuardRatings);

    const customerCount = await userRepository.count({
      where: { status: 1, userType: 'CUSTOMER' },
    });
    const individualCount = await userRepository.count({
      where: {
        guardAccountType: In(['INDIVIDUAL', 'TEAMMEMBER']),
        userType: 'GUARD',
        status: 1,
      },
    });
    const teamCount = await teamRepository
      .createQueryBuilder('team')
      .innerJoinAndSelect('team.teamMembers', 'teamMembers')
      .leftJoin('teamMembers.userProfile', 'userProfile')
      .leftJoin('userProfile.user', 'user')
      .where('teamMembers.isLead = :isLead', { isLead: true })
      .andWhere('user.status = :status', { status: 1 })
      .groupBy('team.id')
      .getCount();

    // const openJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('jg.*')
    //   .addSelect('COUNT(jg.job_id)', 'job_guard_count')
    //   .leftJoin(Job, 'j', 'j.id = jg.job_id')
    //   .where('jg.job_status = :status', { status: 0 })
    //   .andWhere('j.is_job_created=:isCreated', { isCreated: true })
    //   .groupBy('jg.job_id')
    //   .having('COUNT(j.id) = job_guard_count')
    //   .getRawMany();

    // const openJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('COUNT(j.id)', 'job_count')
    //   .leftJoin('jg.job', 'j')
    //   .where('jg.job_status = :status', { status: 0 })
    //   .andWhere(subQuery => {
    //     const subQueryAlias = subQuery
    //       .subQuery()
    //       .select('COUNT(*)')
    //       .from('job_guards', 'jgSub')
    //       .leftJoin('jgSub.job', 'jSub')
    //       .where('jSub.id = j.id')
    //       .andWhere('j.is_job_created = :isCreated', { isCreated: 1 })
    //       .andWhere('j.is_job_deleted_by_admin = :isDeleted', { isDeleted: false })
    //       .andWhere('jgSub.job_status = :status', { status: 0 })
    //       .groupBy('jSub.id')
    //       .getQuery();

    //     return `(${subQueryAlias}) > 0`;
    //   })
    //   .groupBy('jg.job_id')
    //   .getRawMany();

    const openJob = await jobGuardRepository
      .createQueryBuilder('jg')
      .select('jg.id', 'id')
      .innerJoin('jg.job', 'j', 'j.id = jg.job_id')
      .where('jg.job_status = :status', { status: 0 })
      .andWhere('j.is_job_created = :isCreated', { isCreated: 1 })
      .andWhere('j.is_job_deleted_by_admin = :isDeleted', { isDeleted: 0 })
      .groupBy('jg.job_id')
      .getRawMany();

    // const jobCount = openJob ? openJob.length : 0;
    // console.log("Job Count:", jobCount);
    // const closedJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('jg.*')
    //   .addSelect('COUNT(jg.job_id)', 'job_guard_count')
    //   .leftJoin(Job, 'j', 'j.id = jg.job_id')
    //   .where('jg.job_status = :status', { status: 3 })
    //   .andWhere('j.is_job_created=:isCreated', { isCreated: true })
    //   .groupBy('jg.job_id')
    //   .having('COUNT(j.id) = job_guard_count')
    //   .getRawMany();

    // const closedJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('COUNT(j.id)', 'job_count')
    //   .leftJoin('jg.job', 'j')
    //   .where('jg.job_status = :status', { status: 3 })
    //   .andWhere((subQuery) => {
    //     const subQueryAlias = subQuery
    //       .subQuery()
    //       .select('COUNT(*)')
    //       .from('job_guards', 'jgSub')
    //       .leftJoin('jgSub.job', 'jSub')
    //       .where('jSub.id = j.id')
    //       .andWhere('j.is_job_created = :isCreated', { isCreated: 1 })
    //       .andWhere('jgSub.job_status = :status', { status: 3 })
    //       .groupBy('jSub.id')
    //       .getQuery();

    //     return `(${subQueryAlias}) = j.no_of_guards`;
    //   })
    //   .groupBy('jg.job_id')
    //   .getRawMany();

    // const closedJob = await jobGuardRepository
    //   .createQueryBuilder('j')
    //   .select('j.id', 'id')
    //   .from(Job, 'j')
    //   .where((subQuery) => {
    //     const subQueryAlias = subQuery
    //       .subQuery()
    //       .select('1')
    //       .from(JobGuards, 'jg')
    //       .where('jg.job_id = j.id')
    //       .andWhere('jg.job_status != :status', { status: 3 })
    //       .getQuery();

    //     return 'NOT EXISTS ' + subQueryAlias;
    //   })
    //   .andWhere('j.is_job_created = :isCreated', { isCreated: 1 })
    //   .andWhere('j.is_job_deleted_by_admin = :isDeleted', { isDeleted: 0 })
    //   .getRawMany();
    const closedJob = await jobRepository
      .createQueryBuilder('j')
      .select('j.id', 'id')
      .innerJoin(JobGuards, 'jg', 'j.id = jg.job_id')
      .where('j.is_job_created = :isCreated', { isCreated: 1 })
      .andWhere('j.is_job_deleted_by_admin = :isDeleted', { isDeleted: 0 })
      .groupBy('j.id')
      .having(
        'COUNT(CASE WHEN jg.job_status = 3 THEN 1 ELSE NULL END) = COUNT(*)'
      )
      .getRawMany();

    // const declinedJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('jg.*')
    //   .addSelect('COUNT(jg.job_id)', 'job_guard_count')
    //   .leftJoin(Job, 'j', 'j.id = jg.job_id')
    //   .where(
    //     '(jg.job_status = :status2 AND j.no_of_guards = 1) OR (jg.job_status != :status2 AND j.no_of_guards > 1)',
    //     { status2: 2 }
    //   )
    //   .andWhere('j.is_job_created=:isCreated', { isCreated: true })
    //   .groupBy('jg.job_id')
    //   .having(
    //     '(jg.job_status = :status2 AND COUNT(jg.job_id) = job_guard_count) OR (jg.job_status != :status2 AND COUNT(jg.job_id) != job_guard_count)',
    //     { status2: 2 }
    //   )
    //   .getRawMany();

    // const declinedJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('COUNT(j.id)', 'job_count')
    //   .leftJoin('jg.job', 'j')
    //   .where('jg.job_status = :status', { status: 2 })
    //   .andWhere((subQuery) => {
    //     const subQueryAlias = subQuery
    //       .subQuery()
    //       .select('COUNT(*)')
    //       .from('job_guards', 'jgSub')
    //       .leftJoin('jgSub.job', 'jSub')
    //       .where('jSub.id = j.id')
    //       .andWhere('j.is_job_created = :isCreated', { isCreated: 1 })
    //       .andWhere('jgSub.job_status = :status', { status: 2 })
    //       .groupBy('jSub.id')
    //       .getQuery();

    //     return `(${subQueryAlias}) = j.no_of_guards`;
    //   })
    //   .groupBy('jg.job_id')
    //   .getRawMany();

    const declinedJob = await jobRepository
      .createQueryBuilder('j')
      .select('j.id', 'id')
      .innerJoin(JobGuards, 'jg', 'j.id = jg.job_id')
      .where('j.is_job_created = :isCreated', { isCreated: 1 })
      .andWhere('j.is_job_deleted_by_admin = :isDeleted', { isDeleted: 0 })
      .groupBy('j.id')
      .having(
        'COUNT(CASE WHEN jg.job_status = 2 THEN 1 ELSE NULL END) = COUNT(*)'
      )
      .getRawMany();

    const cancelledJob = await jobRepository
      .createQueryBuilder('j')
      .select('j.id', 'id')
      .innerJoin(JobGuards, 'jg', 'j.id = jg.job_id')
      .where('j.is_job_created = :isCreated', { isCreated: 1 })
      .andWhere('j.is_job_deleted_by_admin = :isDeleted', { isDeleted: 0 })
      .groupBy('j.id')
      .having(
        'COUNT(CASE WHEN jg.job_status = 4 THEN 1 ELSE NULL END) = COUNT(*)'
      )
      .getRawMany();

    // const cancelledJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('jg.*')
    //   .addSelect('COUNT(jg.job_id)', 'job_guard_count')
    //   .leftJoin(Job, 'j', 'j.id = jg.job_id')
    //   .where('jg.job_status = :status', { status: 4 })
    //   .andWhere('j.is_job_created=:isCreated', { isCreated: true })
    //   .groupBy('jg.job_id')
    //   .having('COUNT(j.id) = job_guard_count')
    //   .getRawMany();
    // const cancelledJob = await jobGuardRepository
    //   .createQueryBuilder('jg')
    //   .select('COUNT(j.id)', 'job_count')
    //   .leftJoin('jg.job', 'j')
    //   .where('jg.job_status = :status', { status: 4 })
    //   .andWhere((subQuery) => {
    //     const subQueryAlias = subQuery
    //       .subQuery()
    //       .select('COUNT(*)')
    //       .from('job_guards', 'jgSub')
    //       .leftJoin('jgSub.job', 'jSub')
    //       .where('jSub.id = j.id')
    //       .andWhere('j.is_job_created = :isCreated', { isCreated: 1 })
    //       .andWhere('jgSub.job_status = :status', { status: 4 })
    //       .groupBy('jSub.id')
    //       .getQuery();

    //     return `(${subQueryAlias}) = j.no_of_guards`;
    //   })
    //   .groupBy('jg.job_id')
    //   .getRawMany();

    const totalCost = await jobRepository
      .createQueryBuilder('job')
      .where('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
      .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
      .andWhere('job.totalCost IS NOT NULL')
      .andWhere('job.jobCost IS NOT NULL')
      .andWhere('job.paymentStatus = :paymentStatus', { paymentStatus: true })
      .select('SUM(job.totalCost - job.jobCost)', 'costDifferenceSum')
      .getRawMany();

    const frequentlyJobPosted = await jobRepository
      .createQueryBuilder('job')
      .where('job.isGuardAdded= :isGuardAdded', { isGuardAdded: true })
      .andWhere('job.isJobCreated= :isJobCreated', { isJobCreated: true })
      .select('job.userId')
      .addSelect('COUNT(job.userId)', 'jobCount')
      .groupBy('job.userId')
      .orderBy('jobCount', 'DESC')
      .limit(1)
      .getRawOne();
    let frequentlyPostedCustomer = '';

    if (frequentlyJobPosted) {
      const { job_user_id } = frequentlyJobPosted;
      const userName = await userProfileRepository.findOne({
        where: { userId: job_user_id },
      });
      frequentlyPostedCustomer = this.setName(
        userName.firstName,
        userName.lastName
      );
    }
    const frequentlyGuardJob = await jobGuardRepository
      .createQueryBuilder('jobRepository')
      .where('jobRepository.jobStatus= :jobStatus', { jobStatus: 3 })
      .leftJoin('jobRepository.user', 'user')
      .where('user.userType= :userType', { userType: 'GUARD' })
      .select('jobRepository.userId')
      .addSelect('COUNT(jobRepository.userId)', 'jobCount')
      .groupBy('jobRepository.userId')
      .orderBy('jobCount', 'DESC')
      .limit(1)
      .getRawOne();
    let frequentlyContactedGuard = '';

    if (frequentlyGuardJob) {
      const { jobRepository_user_id } = frequentlyGuardJob;
      const userName = await userProfileRepository.findOne({
        where: { userId: jobRepository_user_id },
      });
      frequentlyContactedGuard = this.setName(
        userName.firstName,
        userName.lastName
      );
    }
    const year = moment().year(); // Get the current year
    if (type === 'chart') {
      const monthCounts = [];

      for (let i = 0; i < 12; i++) {
        const currentMonth = moment().subtract(i, 'months');
        const currentYear = currentMonth.year();

        // Check if the month is within the current year
        if (currentYear === year) {
          const startOfMonth = currentMonth.startOf('month').toDate();
          const endOfMonth = currentMonth.endOf('month').toDate();

          const count = await jobRepository.count({
            where: {
              createdOn: Between(startOfMonth, endOfMonth),
              isGuardAdded: true,
              isJobCreated: true,
            },
          });

          monthCounts.push({
            monthName: currentMonth.format('MMM'), // Use 'MMM' for abbreviated month names
            count,
          });
        } else {
          // If the month is not in the current year, push 0 count for that month
          monthCounts.push({
            monthName: currentMonth.format('MMM'),
            count: 0,
          });
        }
      }

      // Sort the monthCounts array based on month order
      monthCounts.sort((a, b) => {
        const monthNames = moment.monthsShort(); // Get an array of abbreviated month names
        return (
          monthNames.indexOf(a.monthName) - monthNames.indexOf(b.monthName)
        );
      });

      const weekdayCounts: { [key: string]: number } = {};
      const currentTime = moment.utc();
      const startOfCurrentWeek = currentTime.clone().startOf('week');

      for (let i = 0; i < 7; i++) {
        const currentDate = startOfCurrentWeek.clone().add(i, 'days');
        const dayName = currentDate.format('ddd');

        const startOfDay = currentDate.startOf('day').utc().toDate();
        const endOfDay = currentDate
          .endOf('day')
          .utc()
          .subtract(1, 'millisecond')
          .toDate(); // Adjusted end time

        const jobsCount = await jobRepository.count({
          where: {
            createdOn: Between(startOfDay, endOfDay),
            isGuardAdded: true,
            isJobCreated: true,
          },
        });

        weekdayCounts[dayName] = jobsCount;
      }

      const yearCounts: { [key: string]: number } = {}; // Object to store counts for each year
      const now = moment.utc(); // Current UTC time

      // Loop through the past 10 years
      for (let i = 0; i < 10; i++) {
        const currentYear = now.clone().subtract(i, 'years').year().toString(); // Get current year

        // Set start and end dates for the year
        const startOfYear = now
          .clone()
          .subtract(i, 'years')
          .startOf('year')
          .toDate();
        const endOfYear = now
          .clone()
          .subtract(i, 'years')
          .endOf('year')
          .toDate();

        // Count jobs created within the year
        const jobsCount = await jobRepository.count({
          where: {
            createdOn: Between(startOfYear, endOfYear),
            isGuardAdded: true,
            isJobCreated: true,
          },
        });

        yearCounts[currentYear] = jobsCount; // Store the count for the respective year
      }
      return {
        yearCounts: yearCounts,
        weekdayCounts: weekdayCounts,
        monthCounts: monthCounts,
      };
    }
    let mostFrequentTeamName = '';
    const frequentlyContactedTeam = await jobGuardRepository
      .createQueryBuilder('jobRepository')
      .select('jobRepository.jobId')
      .addSelect('jobRepository.teamId')
      .addSelect('COUNT(jobRepository.jobId)', 'jobCount')
      .where('jobRepository.teamId IS NOT NULL')
      .groupBy('jobRepository.jobId, jobRepository.teamId')
      .orderBy('jobCount', 'DESC')
      .limit(1)
      .getRawOne();
    if (frequentlyContactedTeam) {
      const { jobRepository_team_id } = frequentlyContactedTeam;

      const mostFrequentTeam = await teamRepository.findOne({
        where: { id: jobRepository_team_id },
        // Load the 'team' relation
      });
      mostFrequentTeamName = mostFrequentTeam.name;
    }
    // .where('teamMembers.team_id = :teamId', { teamId: teamId })
    let topRatedGuard = '';
    // For the top-rated guard (guardId)
    const topRatedGuardFinding = await ratingsRepository
      .createQueryBuilder('rating')
      .select('rating.ratedTo')
      .where('rating.type=:type', { type: 'CUSTOMER' })
      .addSelect('AVG(rating.ratings)', 'averageRating')
      .groupBy('rating.ratedTo')

      .orderBy('averageRating', 'DESC')
      .limit(1)
      .getRawOne();
    if (topRatedGuardFinding) {
      const { rating_guard_id } = topRatedGuardFinding;
      const userName = await userProfileRepository.findOne({
        where: { userId: rating_guard_id },
      });
      topRatedGuard = this.setName(userName.firstName, userName.lastName);
    } else {
      console.log('No ratings found for guards.');
    }
    let topRatedUser = '';
    // For the top-rated user (userId)
    const topRatedUserFinding = await ratingsRepository
      .createQueryBuilder('rating')
      .select('rating.ratedTo')
      .where('rating.type=:type', { type: 'GUARD' })
      .addSelect('AVG(rating.ratings)', 'averageRating')
      .groupBy('rating.ratedTo')
      .orderBy('averageRating', 'DESC')
      .limit(1)
      .getRawOne();
    if (topRatedUserFinding) {
      const { rating_user_id } = topRatedUserFinding;
      console.log(rating_user_id);

      const userName = await userProfileRepository.findOne({
        where: { userId: rating_user_id },
      });
      topRatedUser = this.setName(userName.firstName, userName.lastName);
    } else {
      console.log('No ratings found for users.');
    }

    return {
      topRatedGuard: topRatedGuard,
      topRatedUser: topRatedUser,
      mostFrequentTeamName: mostFrequentTeamName,
      frequentlyContactedGuard: frequentlyContactedGuard,
      frequentlyPostedCustomer: frequentlyPostedCustomer,
      customerCount: customerCount,
      individualCount: individualCount,
      teamCount: teamCount,
      openJob: openJob.length,
      closedJob: closedJob.length,
      cancelledJob: cancelledJob.length,
      declinedJob: declinedJob.length,
      totalCost,
      topRatedTeam: '',
    };
  }
  async getTransactionList(page: number, pageSize: number): Promise<any> {
    const options: FindManyOptions<Payments> = {};
    const conditions: any[] = [{ paymentStatus: 1 }];
    options.where = conditions;
    options.take = Number(pageSize);
    page && pageSize ? (options.skip = (page - 1) * pageSize) : '';
    options.order = {
      ['updatedOn']: 'DESC',
    };

    options.relations = ['job'];

    const repo = await this.database.getRepository(Payments);
    const jobRepo = await this.database.getRepository(Job);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const [results, count] = await repo.findAndCount(options);
    const mappedResults = await Promise.all(
      results.map(async (payment) => {
        let adminprofit = 0;
        const getAdminProfitAmount = await jobRepo.findOne({
          where: { id: payment.jobId },
        });
        if (
          getAdminProfitAmount.totalCost &&
          getAdminProfitAmount.jobCost &&
          getAdminProfitAmount.transactionCost
        ) {
          console.log(
            Number(getAdminProfitAmount.totalCost) -
              (Number(getAdminProfitAmount.jobCost) +
                Number(getAdminProfitAmount.transactionCost)),
            'getAdminProfitAmount.totalCost - (getAdminProfitAmount.jobCost + getAdminProfitAmount.transactionCost)'
          );

          adminprofit =
            (await Number(getAdminProfitAmount.totalCost)) -
            (Number(getAdminProfitAmount.jobCost) +
              Number(getAdminProfitAmount.transactionCost));
        } else {
          // Handle the case where one or more values are null
          console.error('One or more values are null');
        }

        // adminprofit = getAdminProfitAmount.totalCost - (getAdminProfitAmount.jobCost + getAdminProfitAmount.transactionCost)
        let paidByUser = '';
        let paidToUser = '';
        const paidJob = await jobRepo.findOne({ where: { id: payment.jobId } });
        let paidBy = await userProfileRepo.findOne({
          where: { userId: paidJob.userId },
        });
        let paidTo = await userProfileRepo.findOne({
          where: { userId: payment.paidTo },
        });
        paidByUser = paidBy.firstName + ' ' + paidBy.lastName;
        paidToUser = paidTo.firstName + ' ' + paidTo.lastName;
        return {
          transactionId: `#${payment.transactionId}`,
          jobId: payment.jobId,
          amount: payment.amount,
          txnType: payment.txnType,
          last4: payment.last4,
          createdOn: payment.createdOn,
          jobName: payment.job ? payment.job.jobName : null,
          jobRefId: payment.job ? `#${payment.job.jobRefId}` : null,
          paymentSource: payment.job ? payment.job.paymentSource : null,
          paymentType: payment.paymentType !== 'card' ? 'bank account' : 'card',
          paidByUser: paidByUser,
          paidToUser: paidToUser,
          paidAccountId: payment.paidAccountId ? payment.paidAccountId : null,
          adminprofit: adminprofit
            ? parseFloat(adminprofit.toFixed(2))
            : adminprofit,
        };
      })
    );

    const response: any = {
      pageType: 'transaction',
      count,
      results: mappedResults,
      pages: pageSize ? Math.ceil(count / pageSize) : 1,
    };

    return response;
  }

  async getRatingsReview(page: number, pageSize: number): Promise<any> {
    const guardRatingsRepository = await this.database.getRepository(
      GuardRatings
    );
    const groupedResults: {
      [jobId: string]: {
        jobId: any;
        jobRefId: any;
        guard: any[];
        customer: any[];
      };
    } = {};

    const queryBuilder = guardRatingsRepository
      .createQueryBuilder('guardRatings')
      .leftJoin('guardRatings.Job', 'Job')
      .select([
        'guardRatings.jobId',
        'guardRatings.ratings',
        'guardRatings.reviews',
        'guardRatings.type',
        'guardRatings.isAppRate',
        'guardRatings.isDeleted',
        'guardRatings.ratedBy',
        'guardRatings.ratedTo',
        'guardRatings.createdBy',
        'guardRatings.createdOn',
        'guardRatings.updatedBy',
        'guardRatings.updatedOn',
        'guardRatings.appRated',
        'guardRatings.customerName',
        'guardRatings.guardName',
        'Job.jobRefId',
      ])
      .addSelect(['guardRatings.jobId', 'guardRatings.type'])
      .addOrderBy('guardRatings.createdOn', 'DESC')
      .where('Job.jobRefId IS NOT NULL');
    const results = await queryBuilder.getMany();
    const totalCount = results.length;
    // Assuming results is an array of objects as in the first code snippet
    results.forEach(async (result) => {
      const jobId = result.jobId;
      const type = result.type;
      const jobRefId = `#${result.Job.jobRefId}`;

      if (!groupedResults[jobId]) {
        groupedResults[jobId] = {
          jobId: jobId,
          jobRefId: jobRefId,
          guard: [],
          customer: [],
        };
      }

      if (type === 'CUSTOMER') {
        groupedResults[jobId].customer.push(result);
      } else if (type === 'GUARD') {
        groupedResults[jobId].guard.push(result);
      }
    });
    const groupedResultsCount = Object.keys(groupedResults).length;
    // Pagination logic
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = Object.values(groupedResults).slice(
      startIndex,
      startIndex + pageSize
    );
    const response: any = {
      pageType: 'ratings',
      totalCount: groupedResultsCount,
      data: paginatedResults,
      pages: pageSize ? Math.ceil(groupedResultsCount / pageSize) : 1,
      currentPage: page,
    };

    return response;
  }

  private async getJobServiceTypeDetails(
    jobId: string,
    interestType: any
  ): Promise<string> {
    const jobInterestRepo = await this.database.getRepository(JobInterest);

    const jobInterests = await jobInterestRepo
      .createQueryBuilder('ji')
      .select('ji.interest_name', 'interest_name')
      .innerJoin(JobEventTypes, 'jet', 'jet.job_interest_id = ji.id')
      .where('jet.job_id = :jobId', { jobId })
      .andWhere('ji.interest_type = :interestType', { interestType })
      .getRawMany<{ interest_name: string }>();

    // Extract job interest names and join them into a comma-separated string
    const jobInterestNames: string = jobInterests
      .map((interest) => interest.interest_name)
      .join(', ');

    console.log(jobInterestNames);
    return jobInterestNames;
  }
}
