import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IGuardTeamRepository } from '../interfaces/repo/IGuardTeamRepository';
import { User } from '../entities/User';
import { Brackets, IsNull, Not, SelectQueryBuilder } from 'typeorm';
import { TeamMembers } from '../entities/TeamMembers';
import { GlobalConstants } from '../constants/constants';
import {
  SaveTeamMembersRequest,
  favoriteGuardRequest,
} from '../dto/GuardTeamDTO';
import { UserProfile } from '../entities/UserProfile';
import * as randomstring from 'randomstring';
import { FavoriteGuard } from '../entities/GuardFavourites';
import { GuardRatings } from '../entities/ratings';
import { State } from '../entities/State';
import { City } from '../entities/City';
import { Job } from '../entities/Job';
import { UserAvailabilityDay } from '../entities/UserAvailabilityDay';
import { error } from 'console';
import { Team } from '../entities/Team';
import { JobEventTypes } from '../entities/JobEventTypes';

@injectable()
export class GuardTeamRepository implements IGuardTeamRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    @inject(TYPES.IEmailService)
    private readonly emailService: IEmailService,
    private readonly globalConstants = GlobalConstants
  ) { }
  async getAllGuards(searchKeyword: string, user: any): Promise<User[]> {
    const userId = user.id;
    const repo = await this.database.getRepository(User);

    const queryBuilder: SelectQueryBuilder<User> =
      repo.createQueryBuilder('user');

    const response = await queryBuilder
      .select(['user.id', 'user.email'])
      .where((qb) => {
        qb.andWhere({
          status: 1,
          userType: 'GUARD',
          isEmailVerified: 1,
          id: Not(userId),
        });

        // Check if searchKeyword exists and is not empty before adding the filter
        if (searchKeyword !== undefined && searchKeyword !== '') {
          qb.andWhere('user.email LIKE :searchKeyword', {
            searchKeyword: `%${searchKeyword}%`,
          });
        }
      })
      .orderBy('user.email', 'ASC')
      .getMany();

    return response;
  }

  private async registerAndSendLoginCredentials(
    guardEmail: any,
    inviteeName: string
  ): Promise<any[]> {
    const repo = await this.database.getRepository(User);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const password = randomstring.generate(8);
    console.log('password: ', password);
    const userObj = {
      email: guardEmail,
      userType: 'GUARD',
      guardAccountType: 'INDIVIDUAL',
      status: 1,
      isEmailVerified: 1,
      createdOn: new Date(),
      updatedOn: new Date(),
      updatedBy: this.globalConstants.SYS_ADMIN_GUID,
      createdBy: this.globalConstants.SYS_ADMIN_GUID,
    };
    console.log('userObj: ', userObj);
    const insertResponse = await repo.insert(userObj);

    console.log('insertResponse: ', insertResponse);

    //inserting phone number in user details database
    await userProfileRepo.insert({
      userId: insertResponse.identifiers[0].id,
      updatedOn: new Date(),
      createdOn: new Date(),
      updatedBy: insertResponse.identifiers[0].id,
      createdBy: insertResponse.identifiers[0].id,
    });

    console.log('Create completed');
    console.log('Sending email initiated');
    // send invite team member email notification with username and password
    await this.emailService.sendEmail(
      this.globalConstants.EMAIL_TEMPLATE.INVITE_TEAM_MEMBER,
      guardEmail,
      {
        teamHead: inviteeName,
        receiver_name: 'Guard',
        username: guardEmail,
        password,
      }
    );

    console.log('Sending email completed', insertResponse.identifiers[0].id);

    return insertResponse.identifiers[0].id;
  }

  private async findOrCreateUserByEmail(
    guardEmail: any,
    inviteeName: string
  ): Promise<any> {
    const userRepo = await this.database.getRepository(User);
    const existingUser = await userRepo.findOne({
      where: {
        email: guardEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser && existingUser.id) {
      return existingUser.id;
    } else {
      return this.registerAndSendLoginCredentials(guardEmail, inviteeName);
    }
  }

  private async generateInsertObj(
    saveTeamMembersPayload: SaveTeamMembersRequest,
    userId: string,
    inviteeName: string
  ): Promise<any[]> {
    try {
      const insertObj: any[] = [];
      const processedEmails = new Set<any>();

      const repo = await this.database.getRepository(TeamMembers);
      const response = await repo.findOne({
        where: {
          userId,
        },
        select: {
          teamId: true,
        },
      });
      if (response && response.teamId !== undefined && response.teamId) {
        const teamId = response.teamId;
        for (const guardEmail of saveTeamMembersPayload.guardEmails) {
          if (!processedEmails.has(guardEmail)) {
            const registeredUserId = await this.findOrCreateUserByEmail(
              guardEmail,
              inviteeName
            );
            insertObj.push({
              teamId,
              userId: registeredUserId,
              createdOn: new Date(),
              updatedOn: new Date(),
              updatedBy: this.globalConstants.SYS_ADMIN_GUID,
              createdBy: this.globalConstants.SYS_ADMIN_GUID,
            });
            processedEmails.add(guardEmail);
          }
        }
      }
      return insertObj;
    } catch (error) {
      // Handle the error here
      console.error('An error occurred:', error);
      throw error; // You can rethrow the error or handle it as needed
    }
  }

  async saveTeamMembers(
    user: any,
    saveTeamMembersPayload: SaveTeamMembersRequest
  ): Promise<TeamMembers> {
    const userId = user.id;
    const inviteeName = user.firstName + ' ' + user.lastName;
    const repo = await this.database.getRepository(TeamMembers);
    const userProfileRepo = await this.database.getRepository(UserProfile);
    const insertObj = await this.generateInsertObj(
      saveTeamMembersPayload,
      userId,
      inviteeName
    );
    if (insertObj.length > 0) {
      await repo.insert(insertObj);
    }
    await userProfileRepo.update(
      { userId: userId },
      { IsTeamMemberAdded: true }
    );

    return <TeamMembers>{};
  }

  // async ChooseGuardList(
  //   jobId: any,
  //   type: any,
  //   user: any,
  //   teamId: any,
  //   page: any,
  //   pageSize: any,
  //   searchKeyword: string
  // ): Promise<any> {
  //   let searchWord = searchKeyword ? searchKeyword : '';
  //   let results;
  //   let pageType;
  //   let overallCount;
  //   if (type === 'individual') {
  //     const jobRepo = await this.database.getRepository(Job);
  //     const userAvailabilityDayRepo = await this.database.getRepository(UserAvailabilityDay);
  //     // const subQueryResult = await userAvailabilityDayRepo
  //     //   .createQueryBuilder('uad_sub')
  //     //   .select('DISTINCT user_id')
  //     //   .where(qb => {
  //     //     const subQuery = qb.subQuery()
  //     //       .select('jd_sub.day')
  //     //       .from('job_day', 'jd_sub')
  //     //       .where('jd_sub.job_id = :jobId', { jobId })
  //     //       .getQuery();
  //     //     return 'uad_sub.weekday IN ' + subQuery;
  //     //   })
  //     //   .getRawMany();

  //     // Extract user IDs from the subquery result
  //     // const userIds = subQueryResult.map(result => result.user_id);
  //     // const individualResult = await jobRepo
  //     //   .createQueryBuilder('j')
  //     //   .select([
  //     //     'u.id as userId',
  //     //     'gji.job_interest_id AS coverage_interest_id',
  //     //     'gji1.job_interest_id AS service_interest_id',
  //     //     'j.guard_coverage_id',
  //     //     'j.guard_service_id',
  //     //     'j.user_id as job_user_id',
  //     //     'u.*',
  //     //     'up.*',
  //     //     'ct.*',
  //     //     'st.*',
  //     //     'ct.name as city_name',
  //     //     'st.name as state_name',
  //     //     '(SUM(CAST(gr.ratings AS DECIMAL)) / COUNT(gr.rated_to)) * 100 AS guard_rating',
  //     //     'CONCAT(up.first_name, \' \', up.last_name) AS full_name',
  //     //     'fg.id AS favorite_guard_id',
  //     //     'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN 1 ELSE 0 END AS is_favorite_guard',
  //     //   ])
  //     //   .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
  //     //   .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
  //     //   .innerJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //     //   .innerJoin('user', 'u', 'u.id = uad.user_id')
  //     //   .innerJoin('user_profile', 'up', 'up.user_id = u.id')
  //     //   .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //     //   .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //     //   .innerJoin('state', 'st', 'up.state_id = st.id')
  //     //   .innerJoin('city', 'ct', 'up.city_id = ct.id')
  //     //   .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
  //     //   .leftJoin('guard_ratings', 'gr', 'gr.rated_to = uad.user_id')
  //     //   .leftJoin('favorite_guard', 'fg', 'fg.user_id = j.user_id and fg.guard_id = uad.user_id')
  //     //   .where('j.id = :jobId', { jobId })
  //     //   .andWhere('CONCAT(up.first_name, \' \', up.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
  //     //   .andWhere('uad.user_id IN (:...userIds)', { userIds: userIds })
  //     //   .andWhere('CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))')
  //     //   .andWhere('CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))')
  //     //   .groupBy('uad.user_id')
  //     //   .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId }).limit(pageSize)
  //     //   .offset((page - 1) * pageSize)
  //     //   .getRawMany();
  //     // const individualCountResult = await jobRepo
  //     //   .createQueryBuilder('j')
  //     //   .select([
  //     //     'u.id as userId',
  //     //     'gji.job_interest_id AS coverage_interest_id',
  //     //     'gji1.job_interest_id AS service_interest_id',
  //     //     'j.guard_coverage_id',
  //     //     'j.guard_service_id',
  //     //     'j.user_id as job_user_id',
  //     //     'u.*',
  //     //     'up.*',
  //     //     'ct.*',
  //     //     'st.*',
  //     //     'ct.name as city_name',
  //     //     'st.name as state_name',
  //     //     '(SUM(CAST(gr.ratings AS DECIMAL)) / COUNT(gr.rated_to)) * 100 AS guard_rating',
  //     //     'CONCAT(up.first_name, \' \', up.last_name) AS full_name',
  //     //     'fg.id AS favorite_guard_id',
  //     //     'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN 1 ELSE 0 END AS is_favorite_guard',
  //     //   ])
  //     //   .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
  //     //   .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
  //     //   .innerJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //     //   .innerJoin('user', 'u', 'u.id = uad.user_id')
  //     //   .innerJoin('user_profile', 'up', 'up.user_id = u.id')
  //     //   .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //     //   .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //     //   .innerJoin('state', 'st', 'up.state_id = st.id')
  //     //   .innerJoin('city', 'ct', 'up.city_id = ct.id')
  //     //   .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
  //     //   .leftJoin('guard_ratings', 'gr', 'gr.rated_to = uad.user_id')
  //     //   .leftJoin('favorite_guard', 'fg', 'fg.user_id = j.user_id and fg.guard_id = uad.user_id')
  //     //   .where('j.id = :jobId', { jobId })
  //     //   .andWhere('CONCAT(up.first_name, \' \', up.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
  //     //   .andWhere('uad.user_id IN (:...userIds)', { userIds: userIds })
  //     //   .andWhere('CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))')
  //     //   .andWhere('CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))')
  //     //   .groupBy('uad.user_id')
  //     //   .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId })
  //     //   .getRawMany();

  //     // if (individualResult && individualCountResult) {
  //     // const results = Array.isArray(individualResult) ? individualResult : [individualResult];
  //     // const paginationResult = Array.isArray(individualCountResult) ? individualCountResult : [individualCountResult];
  //     // const totalCount = paginationResult.length;
  //     // return {
  //     //   results, totalCount,
  //     //   totalPages: Math.ceil(totalCount / pageSize),
  //     //   currentPage: page,
  //     //   pageType: 'individual'
  //     // };

  //     const result = await jobRepo
  //       .createQueryBuilder('j')
  //       .select([
  //         'up.user_id AS userId',
  //         'gji.job_interest_id AS coverage_interest_id',
  //         'gji1.job_interest_id AS service_interest_id',
  //         'j.guard_coverage_id',
  //         'j.guard_service_id',
  //         'j.user_id AS job_user_id',
  //         'up.*',
  //         'ct.*',
  //         'st.*',
  //         'ct.name as city_name',
  //         'st.name as state_name',
  //         '(SUM(CAST(gr.ratings AS DECIMAL)) / COUNT(gr.rated_to)) * 100 AS guard_rating',
  //         'CONCAT(up.first_name, \' \', up.last_name) AS full_name',
  //         'fg.id AS favorite_guard_id',
  //         'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN 1 ELSE 0 END AS is_favorite_guard',
  //       ])
  //       .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
  //       .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
  //       .innerJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //       .innerJoin('user', 'u', 'u.id = uad.user_id')
  //       .innerJoin('user_profile', 'up', 'up.user_id = u.id')
  //       .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //       .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //       .innerJoin('state', 'st', 'up.state_id = st.id')
  //       .innerJoin('city', 'ct', 'up.city_id = ct.id')
  //       .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
  //       .leftJoin('guard_ratings', 'gr', 'gr.rated_to = uad.user_id')
  //       .leftJoin('favorite_guard', 'fg', 'fg.user_id = j.user_id AND fg.guard_id = uad.user_id')
  //       .where('j.id = :jobId', { jobId: jobId })
  //       .andWhere('CONCAT(up.first_name, \' \', up.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
  //       .andWhere(`CONCAT(date(uad2.start_time), 'T', SUBSTRING_INDEX(SUBSTRING_INDEX(jd.start_time, 'T', -1), '.', 1), 'Z') BETWEEN uad2.start_time AND uad2.end_time`)
  //       .andWhere(`CONCAT(date(uad2.end_time), 'T', SUBSTRING_INDEX(SUBSTRING_INDEX(jd.end_time , 'T', -1), '.', 1), 'Z') BETWEEN uad2.start_time AND uad2.end_time`)
  //       .groupBy('uad.user_id')
  //       .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd1.day) FROM job_day jd1 WHERE jd1.job_id = :jobId)', { jobId: jobId })
  //       .limit(10)
  //       .offset(0)
  //       .getRawMany();
  //     const resultLength = await jobRepo
  //       .createQueryBuilder('j')
  //       .select([
  //         'up.user_id AS userId',
  //         'gji.job_interest_id AS coverage_interest_id',
  //         'gji1.job_interest_id AS service_interest_id',
  //         'j.guard_coverage_id',
  //         'j.guard_service_id',
  //         'j.user_id AS job_user_id',
  //         'up.*',
  //         'CONCAT(up.first_name, \' \', up.last_name) AS full_name',
  //         'fg.id AS favorite_guard_id',
  //         'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN 1 ELSE 0 END AS is_favorite_guard',
  //       ])
  //       .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
  //       .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
  //       .innerJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //       .innerJoin('user_profile', 'up', 'up.user_id = uad.user_id')
  //       .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //       .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //       .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
  //       .leftJoin('favorite_guard', 'fg', 'fg.user_id = j.user_id AND fg.guard_id = uad.user_id')
  //       .where('j.id = :jobId', { jobId: jobId })
  //       .andWhere(`CONCAT(date(uad2.start_time), 'T', SUBSTRING_INDEX(SUBSTRING_INDEX(jd.start_time, 'T', -1), '.', 1), 'Z') BETWEEN uad2.start_time AND uad2.end_time`)
  //       .andWhere(`CONCAT(date(uad2.end_time), 'T', SUBSTRING_INDEX(SUBSTRING_INDEX(jd.end_time , 'T', -1), '.', 1), 'Z') BETWEEN uad2.start_time AND uad2.end_time`)
  //       .groupBy('uad.user_id')
  //       .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd1.day) FROM job_day jd1 WHERE jd1.job_id = :jobId)', { jobId: jobId })
  //       .getRawMany();
  //     const totalCount = resultLength.length;
  //     return {
  //       result, totalCount,
  //       totalPages: Math.ceil(totalCount / pageSize),
  //       currentPage: page,
  //       pageType: 'individual'
  //     };
  //     // } else {
  //     //   return error
  //     // }
  //   } else if (type === 'team') {
  //     const teamRepo = await this.database.getRepository(Team);
  //     const userAvailabilityRepo = await this.database.getRepository(UserAvailabilityDay);
  //     const userIDs = await userAvailabilityRepo
  //       .createQueryBuilder('uad')
  //       .select('uad.user_id')
  //       .leftJoin('job_day', 'jd', 'jd.day = uad.weekday')
  //       .leftJoin('job', 'j', 'j.id = jd.job_id')
  //       .leftJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //       .leftJoin('user', 'u', 'u.id = uad.user_id')
  //       .leftJoin('user_profile', 'up', 'up.user_id = u.id')
  //       .leftJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //       .leftJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //       .leftJoin('team_members', 'tm', 'tm.user_id = uad.user_id') // Join team_members to get access to tm.team_id
  //       .leftJoin('team', 't', 'tm.team_id = t.id') // Join team to get access to t.company_id
  //       .leftJoin('company', 'c', 'c.id = t.company_id')
  //       .where('j.id = :jobId AND c.company_name LIKE :searchWord', { jobId, searchWord: `%${searchWord}%` })
  //       .andWhere(
  //         'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
  //         'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //         'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //         'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
  //         'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //         'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))'
  //       )
  //       .groupBy('uad.user_id')
  //       .having(
  //         'COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)',
  //         { jobId }
  //       )
  //       .getRawMany();

  //     // Map the extracted user IDs to an array
  //     const userIdsArray = userIDs.map((item) => item.user_id);
  //     if (userIdsArray.length === 0) {

  //       return {
  //         results: [], totalCount: 0, totalPages: 1,
  //         currentPage: 1,
  //         pageType: 'team'
  //       }
  //     }

  //     const results = await teamRepo
  //       .createQueryBuilder('t')
  //       .addSelect('t.id', 'team_id')
  //       .addSelect(['t.*', 'c.*', 'subquery.team_member_count', 'subquery.teamMembers'])
  //       .innerJoin('company', 'c', 'c.id = t.company_id')
  //       .innerJoin(
  //         (subQuery) => {
  //           return subQuery
  //             .select(['tm.team_id', 'COUNT(DISTINCT tm.user_id) AS team_member_count', 'GROUP_CONCAT(DISTINCT tm.user_id) AS teamMembers'])
  //             .from('team_members', 'tm')
  //             .innerJoin(
  //               (subSubQuery) => {
  //                 return subSubQuery
  //                   .select(['tm.user_id', 'tm.team_id'])
  //                   .from('team_members', 'tm')
  //                   .where('tm.user_id IN (:...userIds)', { userIds: userIdsArray })
  //                   .groupBy('tm.user_id')
  //                   .addGroupBy('tm.team_id');
  //               },
  //               'subquery'
  //             )
  //             .where('tm.user_id = subquery.user_id AND tm.team_id = subquery.team_id') // Use tm.team_id within the subquery
  //             .groupBy('tm.team_id');
  //         },
  //         'subquery'
  //       )
  //       .where('t.id = subquery.team_id')
  //       .having('subquery.team_member_count >= (SELECT no_of_guards FROM job WHERE id = :jobId)', { jobId })
  //       .limit(pageSize)
  //       .offset((page - 1) * pageSize)
  //       .getRawMany();

  //     const totalResult = await teamRepo
  //       .createQueryBuilder('t')
  //       .addSelect('t.id', 'team_id')
  //       .addSelect(['t.*', 'c.*', 'subquery.team_member_count', 'subquery.teamMembers'])
  //       .innerJoin('company', 'c', 'c.id = t.company_id')
  //       .innerJoin(
  //         (subQuery) => {
  //           return subQuery
  //             .select(['tm.team_id', 'COUNT(DISTINCT tm.user_id) AS team_member_count', 'GROUP_CONCAT(DISTINCT tm.user_id) AS teamMembers'])
  //             .from('team_members', 'tm')
  //             .innerJoin(
  //               (subSubQuery) => {
  //                 return subSubQuery
  //                   .select(['tm.user_id', 'tm.team_id'])
  //                   .from('team_members', 'tm')
  //                   .where('tm.user_id IN (:...userIds)', { userIds: userIdsArray })
  //                   .groupBy('tm.user_id')
  //                   .addGroupBy('tm.team_id');
  //               },
  //               'subquery'
  //             )
  //             .where('tm.user_id = subquery.user_id AND tm.team_id = subquery.team_id') // Use tm.team_id within the subquery
  //             .groupBy('tm.team_id');
  //         },
  //         'subquery'
  //       )
  //       .where('t.id = subquery.team_id')
  //       .having('subquery.team_member_count >= (SELECT no_of_guards FROM job WHERE id = :jobId)', { jobId })
  //       .limit(pageSize)
  //       .offset((page - 1) * pageSize)
  //       .getRawMany();
  //     const totalCount = totalResult.length;
  //     return {
  //       results, totalCount, totalPages: Math.ceil(totalCount / pageSize),
  //       currentPage: page,
  //       pageType: 'team'
  //     }
  //   } else if (type === 'teamguard') {
  //     const userRepo = await this.database.getRepository(User);
  //     const results = await userRepo
  //       .createQueryBuilder('u')
  //       .select([
  //         'u.*',
  //         'up2.*',
  //         'ct.name AS cityName',
  //         'u.id AS userId',
  //         'CONCAT(up2.first_name, \' \', up2.last_name) AS full_name',
  //         'st.name AS state_name',
  //         // '(SELECT COALESCE((SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100, NULL) FROM guard_ratings gr WHERE gr.rated_to = up2.user_id) AS guard_rating',
  //         'fg.id AS favorite_guard_id',
  //         'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN CAST(1 AS SIGNED) ELSE CAST(0 AS SIGNED) END AS is_favorite_guard',
  //       ])
  //       .innerJoin('user_profile', 'up2', 'u.id = up2.user_id')
  //       .leftJoin('state', 'st', 'up2.state_id = st.id')
  //       .leftJoin('city', 'ct', 'up2.city_id = ct.id')
  //       // .leftJoin(
  //       //   (subQuery) => {
  //       //     subQuery
  //       //       .select([
  //       //         'rated_to',
  //       //         '(SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100 AS guard_rating',
  //       //       ])
  //       //       .from('guard_ratings', 'gr')
  //       //       .groupBy('rated_to');
  //       //   },
  //       //   'gr',
  //       //   'gr.rated_to = up2.user_id',
  //       // )
  //       .leftJoin('favorite_guard', 'fg', 'fg.guard_id = u.id')
  //       .leftJoin('job', 'job', 'job.user_id = fg.user_id AND job.id = :jobId', { jobId })
  //       .where((qb) => {
  //         const subQuery = qb
  //           .subQuery()
  //           .select('uad.user_id')
  //           .from('job', 'j')
  //           .leftJoin('job_day', 'jd', 'j.id = jd.job_id')
  //           .leftJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
  //           .leftJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //           .leftJoin('user', 'u', 'u.id = uad.user_id')
  //           .leftJoin('user_profile', 'up', 'up.user_id = u.id')
  //           .leftJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //           .leftJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //           .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
  //           .innerJoin('team_members', 'tm', 'tm.user_id = uad.user_id')
  //           .innerJoin('team', 't', 't.id = tm.team_id')
  //           .where('j.id = :jobId', { jobId })
  //           .andWhere('t.id = :teamId', { teamId })
  //           .andWhere('uad.user_id IS NOT NULL')
  //           .andWhere('tm.user_id IS NOT NULL')
  //           .andWhere('t.id IS NOT NULL')
  //           .andWhere(
  //             'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
  //             'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //             'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))',
  //           )
  //           .andWhere(
  //             'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
  //             'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //             'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))',
  //           )
  //           .groupBy('uad.user_id')
  //           .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId });

  //         return `u.id IN (${subQuery.getQuery()})`;
  //       })
  //       .andWhere('CONCAT(up2.first_name, \' \', up2.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
  //       .limit(pageSize)
  //       .offset((page - 1) * pageSize)
  //       .getRawMany();

  //     const resultLength = await userRepo
  //       .createQueryBuilder('u')
  //       .select([
  //         'u.*',
  //         'up2.*',
  //         'ct.name AS cityName',
  //         'u.id AS userId',
  //         'CONCAT(up2.first_name, \' \', up2.last_name) AS full_name',
  //         'st.name AS state_name',
  //         // '(SELECT COALESCE((SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100, NULL) FROM guard_ratings gr WHERE gr.rated_to = up2.user_id) AS guard_rating',
  //         'fg.id AS favorite_guard_id',
  //         'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN CAST(1 AS SIGNED) ELSE CAST(0 AS SIGNED) END AS is_favorite_guard',
  //       ])
  //       .innerJoin('user_profile', 'up2', 'u.id = up2.user_id')
  //       .leftJoin('state', 'st', 'up2.state_id = st.id')
  //       .leftJoin('city', 'ct', 'up2.city_id = ct.id')
  //       // .leftJoin(
  //       //   (subQuery) => {
  //       //     subQuery
  //       //       .select([
  //       //         'rated_to',
  //       //         '(SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100 AS guard_rating',
  //       //       ])
  //       //       .from('guard_ratings', 'gr')
  //       //       .groupBy('rated_to');
  //       //   },
  //       //   'gr',
  //       //   'gr.rated_to = up2.user_id',
  //       // )
  //       .leftJoin('favorite_guard', 'fg', 'fg.guard_id = u.id')
  //       .leftJoin('job', 'job', 'job.user_id = fg.user_id AND job.id = :jobId', { jobId })
  //       .where((qb) => {
  //         const subQuery = qb
  //           .subQuery()
  //           .select('uad.user_id')
  //           .from('job', 'j')
  //           .leftJoin('job_day', 'jd', 'j.id = jd.job_id')
  //           .leftJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
  //           .leftJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
  //           .leftJoin('user', 'u', 'u.id = uad.user_id')
  //           .leftJoin('user_profile', 'up', 'up.user_id = u.id')
  //           .leftJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
  //           .leftJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
  //           .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
  //           .innerJoin('team_members', 'tm', 'tm.user_id = uad.user_id')
  //           .innerJoin('team', 't', 't.id = tm.team_id')
  //           .where('j.id = :jobId', { jobId })
  //           .andWhere('t.id = :teamId', { teamId })
  //           .andWhere('uad.user_id IS NOT NULL')
  //           .andWhere('tm.user_id IS NOT NULL')
  //           .andWhere('t.id IS NOT NULL')
  //           .andWhere(
  //             'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
  //             'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //             'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))',
  //           )
  //           .andWhere(
  //             'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
  //             'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
  //             'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))',
  //           )
  //           .groupBy('uad.user_id')
  //           .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId });

  //         return `u.id IN (${subQuery.getQuery()})`;
  //       })
  //       .andWhere('CONCAT(up2.first_name, \' \', up2.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
  //       .getRawMany();
  //     const totalCount = resultLength.length;
  //     return {
  //       results, totalCount, totalPages: Math.ceil(totalCount / pageSize),
  //       currentPage: page,
  //       pageType: 'teamguard'
  //     }
  //   }

  //   // Calculate currentPage (assuming 'page' is the 1-based page index)
  //   const currentPage = page;
  //   const modifiedResponse = { pageType, results, currentPage };
  //   // const modifiedResponse = [{ ...response, pageType: 'team' }];
  //   return modifiedResponse;
  // }

  async ChooseGuardList(
    jobId: any,
    type: any,
    user: any,
    teamId: any,
    page: any,
    pageSize: any,
    searchKeyword: string
  ): Promise<any> {
    let searchWord = searchKeyword ? searchKeyword : '';
    let results;
    let pageType;
    let overallCount;
    // let userId = user.id
    if (type === 'individual') {
      const jobRepo = await this.database.getRepository(Job);
      const userAvailabilityDayRepo = await this.database.getRepository(UserAvailabilityDay);
      const jobEventTypesRepo = await this.database.getRepository(JobEventTypes);
      const subQueryResult = await userAvailabilityDayRepo
        .createQueryBuilder('uad_sub')
        .select('DISTINCT user_id')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('jd_sub.day')
            .from('job_day', 'jd_sub')
            .where('jd_sub.job_id = :jobId', { jobId })
            .getQuery();
          return 'uad_sub.weekday IN ' + subQuery;
        })
        .getRawMany();

      // Extract user IDs from the subquery result
      const userIds = subQueryResult.map(result => result.user_id);
      const individualResult = await jobRepo
        .createQueryBuilder('j')
        .select([
          'u.id as userId',
          'gji.job_interest_id AS coverage_interest_id',
          // 'gji1.job_interest_id AS service_interest_id',
          // 'j.guard_coverage_id',
          // 'j.guard_service_id',
          'j.user_id as job_user_id',
          'u.*',
          'up.*',
          'ct.*',
          'st.*',
          'ct.name as city_name',
          'st.name as state_name',
          '(SUM(CAST(gr.ratings AS DECIMAL)) / COUNT(gr.rated_to)) * 100 AS guard_rating',
          'CONCAT(up.first_name, \' \', up.last_name) AS full_name',
          'fg.id AS favorite_guard_id',
          'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN 1 ELSE 0 END AS is_favorite_guard',
        ])
        .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
        .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
        .innerJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
        .innerJoin('user', 'u', 'u.id = uad.user_id')
        .innerJoin('user_profile', 'up', 'up.user_id = u.id')
        .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
        // .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
        .innerJoin('guard_job_interest', 'gji2', 'j.guard_security_service_id=gji2.job_interest_id AND uad.user_id = gji2.user_id')
        .innerJoin('state', 'st', 'up.state_id = st.id')
        .innerJoin('city', 'ct', 'up.city_id = ct.id')
        // .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
        .leftJoin('guard_ratings', 'gr', 'gr.rated_to = uad.user_id')
        .leftJoin('favorite_guard', 'fg', 'fg.user_id = j.user_id and fg.guard_id = uad.user_id')
        .where('j.id = :jobId', { jobId })
        .andWhere('CONCAT(up.first_name, \' \', up.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
        .andWhere('uad.user_id IN (:...userIds)', { userIds: userIds })
        .andWhere(new Brackets((qb) => {
          qb.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
            .andWhere(
              new Brackets((qb2) => {
                qb2.where(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                );
              })
            )
            .orWhere(
              new Brackets((qb3) => {
                qb3.where(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                ).orWhere(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                );
              })
            );
        })
        )
        .andWhere(
          new Brackets((qb4) => {
            qb4.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
              .andWhere(
                new Brackets((qb5) => {
                  qb5.where(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                  );
                })
              )
              .orWhere(
                new Brackets((qb6) => {
                  qb6.where(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                  ).orWhere(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                  );
                })
              );
          })
        ).groupBy('uad.user_id')
        .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId })
        .andWhere('(SELECT COUNT(DISTINCT `gji_sub`.`job_interest_id`) FROM `guard_job_interest` `gji_sub` WHERE `gji_sub`.`user_id` = `uad`.`user_id` AND `gji_sub`.`job_interest_id` IN (SELECT `je`.`job_interest_id` FROM `job_event_types` `je` WHERE `je`.`job_id` = :jobId)) = (SELECT COUNT(DISTINCT `je_sub`.`job_interest_id`) FROM `job_event_types` `je_sub` WHERE `je_sub`.`job_id` = :jobId)', { jobId })
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .getRawMany();
      console.log(individualResult, "individualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResultindividualResult");

      const individualCountResult = await jobRepo
        .createQueryBuilder('j')
        .select([
          'u.id as userId',
          'gji.job_interest_id AS coverage_interest_id',
          // 'gji1.job_interest_id AS service_interest_id',
          // 'j.guard_coverage_id',
          // 'j.guard_service_id',
          'j.user_id as job_user_id',
          'u.*',
          'up.*',
          'ct.*',
          'st.*',
          'ct.name as city_name',
          'st.name as state_name',
          '(SUM(CAST(gr.ratings AS DECIMAL)) / COUNT(gr.rated_to)) * 100 AS guard_rating',
          'CONCAT(up.first_name, \' \', up.last_name) AS full_name',
          'fg.id AS favorite_guard_id',
          'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN 1 ELSE 0 END AS is_favorite_guard',
        ])
        .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
        .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
        .innerJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
        .innerJoin('user', 'u', 'u.id = uad.user_id')
        .innerJoin('user_profile', 'up', 'up.user_id = u.id')
        .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
        // .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
        .innerJoin('guard_job_interest', 'gji2', 'j.guard_security_service_id=gji2.job_interest_id AND uad.user_id = gji2.user_id')
        .innerJoin('state', 'st', 'up.state_id = st.id')
        .innerJoin('city', 'ct', 'up.city_id = ct.id')
        // .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
        .leftJoin('guard_ratings', 'gr', 'gr.rated_to = uad.user_id')
        .leftJoin('favorite_guard', 'fg', 'fg.user_id = j.user_id and fg.guard_id = uad.user_id')
        .where('j.id = :jobId', { jobId })
        .andWhere('CONCAT(up.first_name, \' \', up.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
        .andWhere('uad.user_id IN (:...userIds)', { userIds: userIds })
        .andWhere(new Brackets((qb) => {
          qb.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
            .andWhere(
              new Brackets((qb2) => {
                qb2.where(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                );
              })
            )
            .orWhere(
              new Brackets((qb3) => {
                qb3.where(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                ).orWhere(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                );
              })
            );
        })
        )
        .andWhere(
          new Brackets((qb4) => {
            qb4.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
              .andWhere(
                new Brackets((qb5) => {
                  qb5.where(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                  );
                })
              )
              .orWhere(
                new Brackets((qb6) => {
                  qb6.where(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                  ).orWhere(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                  );
                })
              );
          })
        ).groupBy('uad.user_id')
        .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId })
        .andWhere('(SELECT COUNT(DISTINCT `gji_sub`.`job_interest_id`) FROM `guard_job_interest` `gji_sub` WHERE `gji_sub`.`user_id` = `uad`.`user_id` AND `gji_sub`.`job_interest_id` IN (SELECT `je`.`job_interest_id` FROM `job_event_types` `je` WHERE `je`.`job_id` = :jobId)) = (SELECT COUNT(DISTINCT `je_sub`.`job_interest_id`) FROM `job_event_types` `je_sub` WHERE `je_sub`.`job_id` = :jobId)', { jobId })
        .getRawMany();

      if (individualResult && individualCountResult) {
        const results = Array.isArray(individualResult) ? individualResult : [individualResult];
        const paginationResult = Array.isArray(individualCountResult) ? individualCountResult : [individualCountResult];
        const totalCount = paginationResult.length;
        return {
          results, totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: page,
          pageType: 'individual'
        };
      } else {
        return error
      }
    } else if (type === 'team') {
      const teamRepo = await this.database.getRepository(Team);
      const userAvailabilityRepo = await this.database.getRepository(UserAvailabilityDay);
      const jobRepo = await this.database.getRepository(Job);
      const subQueryResult = await userAvailabilityRepo
        .createQueryBuilder('uad_sub')
        .select('DISTINCT user_id')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('jd_sub.day')
            .from('job_day', 'jd_sub')
            .where('jd_sub.job_id = :jobId', { jobId })
            .getQuery();
          return 'uad_sub.weekday IN ' + subQuery;
        })
        .getRawMany();
      const userAvailabilityIds = subQueryResult.map(result => result.user_id);
      const userIDs = await jobRepo
        .createQueryBuilder('j')
        .select('uad.user_id')
        .innerJoin('job_day', 'jd', 'j.id = jd.job_id')
        .innerJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
        // .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
        // .leftJoin('job_day', 'jd', 'jd.day = uad.weekday')
        // .leftJoin('job', 'j', 'j.id = jd.job_id')
        .leftJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
        .leftJoin('user', 'u', 'u.id = uad.user_id')
        .leftJoin('user_profile', 'up', 'up.user_id = u.id')
        .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
        // .leftJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
        .innerJoin('guard_job_interest', 'gji2', 'j.guard_security_service_id=gji2.job_interest_id AND uad.user_id = gji2.user_id')
        // .leftJoin('team_members', 'tm', 'tm.user_id = uad.user_id') // Join team_members to get access to tm.team_id
        // .leftJoin('team', 't', 'tm.team_id = t.id') // Join team to get access to t.company_id
        // .innerJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
        .innerJoin('team_members', 'tm', 'tm.user_id = uad.user_id')
        .innerJoin('team', 't', 't.id = tm.team_id')
        .leftJoin('company', 'c', 'c.id = t.company_id')
        .where('j.id = :jobId', { jobId })
        .andWhere('uad.user_id IS NOT NULL')
        .andWhere('tm.user_id IS NOT NULL')
        .andWhere('t.id IS NOT NULL')
        .andWhere('c.company_name LIKE :searchWord', { searchWord: `%${searchWord}%` })
        // .andWhere(
        //   'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
        //   'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
        //   'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
        //   'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, \'T\', -1), \'Z\', \'\'), CHAR))) BETWEEN ' +
        //   'CONCAT(DATE(j.start_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, \'T\', -1), \'Z\', \'\'), CHAR))) AND ' +
        //   'CONCAT(DATE(j.end_date), \'T\', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, \'T\', -1), \'Z\', \'\'), CHAR)))'
        // )
        // .groupBy('uad.user_id')
        // .having(
        //   'COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)',
        //   { jobId }
        // )
        .andWhere('uad.user_id IN (:...userIds)', { userIds: userAvailabilityIds })
        .andWhere(new Brackets((qb) => {
          qb.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
            .andWhere(
              new Brackets((qb2) => {
                qb2.where(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                );
              })
            )
            .orWhere(
              new Brackets((qb3) => {
                qb3.where(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                ).orWhere(
                  `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                );
              })
            );
        })
        )
        .andWhere(
          new Brackets((qb4) => {
            qb4.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
              .andWhere(
                new Brackets((qb5) => {
                  qb5.where(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                  );
                })
              )
              .orWhere(
                new Brackets((qb6) => {
                  qb6.where(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                  ).orWhere(
                    `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                  );
                })
              );
          })
        ).groupBy('uad.user_id')
        .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId })
        .andWhere('(SELECT COUNT(DISTINCT `gji_sub`.`job_interest_id`) FROM `guard_job_interest` `gji_sub` WHERE `gji_sub`.`user_id` = `uad`.`user_id` AND `gji_sub`.`job_interest_id` IN (SELECT `je`.`job_interest_id` FROM `job_event_types` `je` WHERE `je`.`job_id` = :jobId)) = (SELECT COUNT(DISTINCT `je_sub`.`job_interest_id`) FROM `job_event_types` `je_sub` WHERE `je_sub`.`job_id` = :jobId)', { jobId })
        .getRawMany();

      // Map the extracted user IDs to an array
      const userIdsArray = userIDs.map((item) => item.user_id);
      if (userIdsArray.length === 0) {

        return {
          results: [], totalCount: 0, totalPages: 0,
          currentPage: 1,
          pageType: 'team'
        }
      }
      const results = await teamRepo
        .createQueryBuilder('t')
        .addSelect('t.id', 'team_id')
        .addSelect(['t.*', 'c.*', 'subquery.team_member_count', 'subquery.teamMembers'])
        .innerJoin('company', 'c', 'c.id = t.company_id')
        .innerJoin(
          (subQuery) => {
            return subQuery
              .select(['tm.team_id', 'COUNT(DISTINCT tm.user_id) AS team_member_count'])
              .addSelect('GROUP_CONCAT(DISTINCT tm.user_id) AS teamMembers')
              .from('team_members', 'tm')
              .innerJoin(
                (subSubQuery) => {
                  return subSubQuery
                    .select(['tm.user_id', 'tm.team_id'])
                    .from('team_members', 'tm')
                    .where('tm.user_id IN (:...userIds)', { userIds: userIdsArray })
                    .groupBy('tm.user_id')
                    .addGroupBy('tm.team_id');
                },
                'subquery'
              )
              .where('tm.user_id = subquery.user_id AND tm.team_id = subquery.team_id') // Use tm.team_id within the subquery
              .groupBy('tm.team_id');
          },
          'subquery'
        )
        .where('t.id = subquery.team_id')
        .andWhere('c.company_name LIKE :searchWord', { searchWord: `%${searchWord}%` })
        .having('subquery.team_member_count >= (SELECT no_of_guards FROM job WHERE id = :jobId)', { jobId })
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .getRawMany();
      const totalResult = await teamRepo
        .createQueryBuilder('t')
        .addSelect('t.id', 'team_id')
        .addSelect(['t.*', 'c.*', 'subquery.team_member_count', 'subquery.teamMembers'])
        .innerJoin('company', 'c', 'c.id = t.company_id')
        .innerJoin(
          (subQuery) => {
            return subQuery
              .select(['tm.team_id', 'COUNT(DISTINCT tm.user_id) AS team_member_count'])
              .addSelect('GROUP_CONCAT(DISTINCT tm.user_id) AS teamMembers')
              .from('team_members', 'tm')
              .innerJoin(
                (subSubQuery) => {
                  return subSubQuery
                    .select(['tm.user_id', 'tm.team_id'])
                    .from('team_members', 'tm')
                    .where('tm.user_id IN (:...userIds)', { userIds: userIdsArray })
                    .groupBy('tm.user_id')
                    .addGroupBy('tm.team_id');
                },
                'subquery'
              )
              .where('tm.user_id = subquery.user_id AND tm.team_id = subquery.team_id') // Use tm.team_id within the subquery
              .groupBy('tm.team_id');
          },
          'subquery'
        )
        .where('t.id = subquery.team_id')
        .andWhere('c.company_name LIKE :searchWord', { searchWord: `%${searchWord}%` })
        .having('subquery.team_member_count >= (SELECT no_of_guards FROM job WHERE id = :jobId)', { jobId })
        .getRawMany();
      const totalCount = totalResult.length;
      return {
        results, totalCount, totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageType: 'team'
      }
    } else if (type === 'teamguard') {
      const userRepo = await this.database.getRepository(User);
      const userAvailabilityRepo = await this.database.getRepository(UserAvailabilityDay);
      const subQueryResult = await userAvailabilityRepo
        .createQueryBuilder('uad_sub')
        .select('DISTINCT user_id')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('jd_sub.day')
            .from('job_day', 'jd_sub')
            .where('jd_sub.job_id = :jobId', { jobId })
            .getQuery();
          return 'uad_sub.weekday IN ' + subQuery;
        })
        .getRawMany();
      const userAvailabilityIds = subQueryResult.map(result => result.user_id);
      const results = await userRepo
        .createQueryBuilder('u')
        .select([
          'u.*',
          'up2.*',
          'ct.name AS cityName',
          'u.id AS userId',
          'CONCAT(up2.first_name, \' \', up2.last_name) AS full_name',
          'st.name AS state_name',
          // '(SELECT COALESCE((SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100, NULL) FROM guard_ratings gr WHERE gr.rated_to = up2.user_id) AS guard_rating',
          'fg.id AS favorite_guard_id',
          'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN CAST(1 AS SIGNED) ELSE CAST(0 AS SIGNED) END AS is_favorite_guard',
        ])
        .innerJoin('user_profile', 'up2', 'u.id = up2.user_id')
        .leftJoin('state', 'st', 'up2.state_id = st.id')
        .leftJoin('city', 'ct', 'up2.city_id = ct.id')
        // .leftJoin(
        //   (subQuery) => {
        //     subQuery
        //       .select([
        //         'rated_to',
        //         '(SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100 AS guard_rating',
        //       ])
        //       .from('guard_ratings', 'gr')
        //       .groupBy('rated_to');
        //   },
        //   'gr',
        //   'gr.rated_to = up2.user_id',
        // )
        //  .leftJoin('favorite_guard', 'fg', `fg.guard_id = u.id AND fg.user_id = ${userId}`)
        .leftJoin('job', 'job', 'job.id = :jobId', { jobId })
        .leftJoin('favorite_guard', 'fg', 'fg.guard_id = u.id AND job.user_id = fg.user_id')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('uad.user_id')
            .from('job', 'j')
            .leftJoin('job_day', 'jd', 'j.id = jd.job_id')
            .leftJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
            .leftJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
            .innerJoin('user', 'u', 'u.id = uad.user_id')
            .innerJoin('user_profile', 'up', 'up.user_id = u.id')
            .innerJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
            // .innerJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
            .innerJoin('guard_job_interest', 'gji2', 'j.guard_security_service_id=gji2.job_interest_id AND uad.user_id = gji2.user_id')
            // .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
            .innerJoin('team_members', 'tm', 'tm.user_id = uad.user_id')
            .innerJoin('team', 't', 't.id = tm.team_id')
            .where('j.id = :jobId', { jobId })
            .andWhere('t.id = :teamId', { teamId })
            .andWhere('uad.user_id IS NOT NULL')
            .andWhere('tm.user_id IS NOT NULL')
            .andWhere('t.id IS NOT NULL')
            .andWhere('uad.user_id IN (:...userIds)', { userIds: userAvailabilityIds })
            .andWhere(new Brackets((qb) => {
              qb.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
                .andWhere(
                  new Brackets((qb2) => {
                    qb2.where(
                      `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                    );
                  })
                )
                .orWhere(
                  new Brackets((qb3) => {
                    qb3.where(
                      `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                    ).orWhere(
                      `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                    );
                  })
                );
            })
            )
            .andWhere(
              new Brackets((qb4) => {
                qb4.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
                  .andWhere(
                    new Brackets((qb5) => {
                      qb5.where(
                        `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                      );
                    })
                  )
                  .orWhere(
                    new Brackets((qb6) => {
                      qb6.where(
                        `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                      ).orWhere(
                        `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                      );
                    })
                  );
              })
            ).groupBy('uad.user_id')
            .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId })
            .andWhere('(SELECT COUNT(DISTINCT `gji_sub`.`job_interest_id`) FROM `guard_job_interest` `gji_sub` WHERE `gji_sub`.`user_id` = `uad`.`user_id` AND `gji_sub`.`job_interest_id` IN (SELECT `je`.`job_interest_id` FROM `job_event_types` `je` WHERE `je`.`job_id` = :jobId)) = (SELECT COUNT(DISTINCT `je_sub`.`job_interest_id`) FROM `job_event_types` `je_sub` WHERE `je_sub`.`job_id` = :jobId)', { jobId });

          return `u.id IN (${subQuery.getQuery()})`;
        })
        .andWhere('CONCAT(up2.first_name, \' \', up2.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
        .groupBy('u.id')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .getRawMany();

      const resultLength = await userRepo
        .createQueryBuilder('u')
        .select([
          'u.*',
          'up2.*',
          'ct.name AS cityName',
          'u.id AS userId',
          'CONCAT(up2.first_name, \' \', up2.last_name) AS full_name',
          'st.name AS state_name',
          // '(SELECT COALESCE((SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100, NULL) FROM guard_ratings gr WHERE gr.rated_to = up2.user_id) AS guard_rating',
          'fg.id AS favorite_guard_id',
          'CASE WHEN fg.user_id IS NOT NULL AND fg.is_favorite IS NOT NULL AND fg.is_favorite = true THEN CAST(1 AS SIGNED) ELSE CAST(0 AS SIGNED) END AS is_favorite_guard',
        ])
        .innerJoin('user_profile', 'up2', 'u.id = up2.user_id')
        .leftJoin('state', 'st', 'up2.state_id = st.id')
        .leftJoin('city', 'ct', 'up2.city_id = ct.id')
        // .leftJoin(
        //   (subQuery) => {
        //     subQuery
        //       .select([
        //         'rated_to',
        //         '(SUM(CAST(ratings AS DECIMAL)) / COUNT(rated_to)) * 100 AS guard_rating',
        //       ])
        //       .from('guard_ratings', 'gr')
        //       .groupBy('rated_to');
        //   },
        //   'gr',
        //   'gr.rated_to = up2.user_id',
        // )
        .leftJoin('favorite_guard', 'fg', 'fg.guard_id = u.id')
        .leftJoin('job', 'job', 'job.user_id = fg.user_id AND job.id = :jobId', { jobId })
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('uad.user_id')
            .from('job', 'j')
            .leftJoin('job_day', 'jd', 'j.id = jd.job_id')
            .leftJoin('user_availability_day', 'uad', 'jd.day = uad.weekday')
            .leftJoin('user_availability_date', 'uad2', 'uad2.user_availability_id = uad.id')
            .leftJoin('user', 'u', 'u.id = uad.user_id')
            .leftJoin('user_profile', 'up', 'up.user_id = u.id')
            .leftJoin('guard_job_interest', 'gji', 'j.guard_coverage_id = gji.job_interest_id AND uad.user_id = gji.user_id')
            // .leftJoin('guard_job_interest', 'gji1', 'j.guard_service_id = gji1.job_interest_id AND uad.user_id = gji1.user_id')
            .leftJoin('guard_job_interest', 'gji2', 'j.guard_security_service_id=gji2.job_interest_id AND uad.user_id = gji2.user_id')
            .leftJoin('job_guards', 'jg', 'jg.user_id = uad.user_id')
            .innerJoin('team_members', 'tm', 'tm.user_id = uad.user_id')
            .innerJoin('team', 't', 't.id = tm.team_id')
            .where('j.id = :jobId', { jobId })
            .andWhere('t.id = :teamId', { teamId })
            .andWhere('uad.user_id IS NOT NULL')
            .andWhere('tm.user_id IS NOT NULL')
            .andWhere('t.id IS NOT NULL')
            .andWhere(new Brackets((qb) => {
              qb.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
                .andWhere(
                  new Brackets((qb2) => {
                    qb2.where(
                      `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                    );
                  })
                )
                .orWhere(
                  new Brackets((qb3) => {
                    qb3.where(
                      `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                    ).orWhere(
                      `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.start_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                    );
                  })
                );
            })
            )
            .andWhere(
              new Brackets((qb4) => {
                qb4.where('DATEDIFF(uad2.end_time, uad2.start_time) = 0')
                  .andWhere(
                    new Brackets((qb5) => {
                      qb5.where(
                        `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                      );
                    })
                  )
                  .orWhere(
                    new Brackets((qb6) => {
                      qb6.where(
                        `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.start_time, 'T', -1), 'Z', ''), CHAR))) AND 
               CONCAT(DATE(j.start_date), 'T', '23:59:59')`
                      ).orWhere(
                        `CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(jd.end_time, 'T', -1), 'Z', ''), CHAR))) BETWEEN 
               CONCAT(DATE(j.start_date), 'T', '00:00:00') AND 
               CONCAT(DATE(j.start_date), 'T', TIME(CONVERT(REPLACE(SUBSTRING_INDEX(uad2.end_time, 'T', -1), 'Z', ''), CHAR)))`
                      );
                    })
                  );
              })
            ).groupBy('uad.user_id')
            .having('COUNT(DISTINCT uad.weekday) = (SELECT COUNT(DISTINCT jd_sub.day) FROM job_day jd_sub WHERE jd_sub.job_id = :jobId)', { jobId })
            .andWhere('(SELECT COUNT(DISTINCT `gji_sub`.`job_interest_id`) FROM `guard_job_interest` `gji_sub` WHERE `gji_sub`.`user_id` = `uad`.`user_id` AND `gji_sub`.`job_interest_id` IN (SELECT `je`.`job_interest_id` FROM `job_event_types` `je` WHERE `je`.`job_id` = :jobId)) = (SELECT COUNT(DISTINCT `je_sub`.`job_interest_id`) FROM `job_event_types` `je_sub` WHERE `je_sub`.`job_id` = :jobId)', { jobId })
          return `u.id IN (${subQuery.getQuery()})`;
        })
        .andWhere('CONCAT(up2.first_name, \' \', up2.last_name) LIKE :searchWord', { searchWord: `%${searchWord}%` })
        .groupBy('u.id')
        .getRawMany();
      const totalCount = resultLength.length;
      return {
        results, totalCount, totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageType: 'teamguard'
      }
    }

    // Calculate currentPage (assuming 'page' is the 1-based page index)
    const currentPage = page;
    const modifiedResponse = { pageType, results, currentPage };
    // const modifiedResponse = [{ ...response, pageType: 'team' }];
    return modifiedResponse;
  }

  async postFavoriteGuard(
    user: any,
    favoriteGuardRequest: favoriteGuardRequest
  ): Promise<any> {
    const userId = user.id;
    const date = new Date();
    const favoriteGuardRepo = await this.database.getRepository(FavoriteGuard);
    const isAlreadyAdded = await favoriteGuardRepo.findOne({
      where: { userId: userId, guardId: favoriteGuardRequest.guardId },
    });
    if (isAlreadyAdded && isAlreadyAdded?.isFavorite == true) {
      return { data: '', message: 'User Already Added to Favorites.' };
    } else if (isAlreadyAdded && isAlreadyAdded.isFavorite == false) {
      const favoriteGuard = await favoriteGuardRepo.update(
        {
          userId: userId,
          guardId: favoriteGuardRequest.guardId,
        },
        {
          isFavorite: true,
          updatedOn: date,
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        }
      );
      return favoriteGuard;
    } else {
      const favoriteGuard = await favoriteGuardRepo.insert({
        userId: userId,
        guardId: favoriteGuardRequest.guardId,
        isFavorite: favoriteGuardRequest.isFavorite,
        createdBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        createdOn: date,
        updatedOn: date,
      });

      return favoriteGuard;
    }
  }
  async unFavoriteGuard(
    user: any,
    favoriteGuardRequest: favoriteGuardRequest
  ): Promise<any> {
    const userId = user.id;

    const favoriteGuardRepo = await this.database.getRepository(FavoriteGuard);

    const date = new Date();

    const favoriteGuard = await favoriteGuardRepo.update(
      {
        id: favoriteGuardRequest.id,
        guardId: favoriteGuardRequest.guardId,
      },
      {
        isFavorite: false,
        updatedBy: this.globalConstants.SYS_ADMIN_GUID,
        updatedOn: date,
      }
    );

    return favoriteGuard;
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
  async getFavoriteGuard(user: any, page: any, pageSize: any): Promise<any> {
    const userId = user.id;

    const favoriteGuardRepo = await this.database.getRepository(FavoriteGuard);
    const queryBuilder = await favoriteGuardRepo
      .createQueryBuilder('favoriteGuard')
      .where('favoriteGuard.userId= :userId', { userId: userId })
      .andWhere('favoriteGuard.isFavorite= :isFavorite', { isFavorite: true })
      .leftJoinAndSelect('favoriteGuard.userProfile', 'userProfile')
      .leftJoinAndSelect('userProfile.user', 'user')
      .andWhere('user.userType= :userType', { userType: 'GUARD' })
      .andWhere('user.status= :status', { status: 1 })
      .orderBy('favoriteGuard.createdOn', 'DESC')

    const [favouriteResult, totalCount] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    await Promise.all(
      favouriteResult.map(async (result) => {
        const firstName = result.userProfile.firstName;
        const lastName = result.userProfile.lastName;
        const fullName = await this.setName(firstName, lastName);
        const userProfile_guard_job_rate = result.userProfile.guardJobRate
        const userProfile_profile_photo_file_name = result.userProfile.profilePhotoFileName
        const userProfile_is_cert_verification_added = result.userProfile.user.isCertificateVerified

        result.fullName = fullName;
        result.userProfile_guard_job_rate = userProfile_guard_job_rate;
        result.userProfile_is_cert_verification_added = userProfile_is_cert_verification_added
        result.userProfile_profile_photo_file_name = userProfile_profile_photo_file_name
        const addressLine1 = result.userProfile.addressLine1;
        const addressLine2 = result.userProfile.addressLine2;

        const fullAddress = await this.setAddress(addressLine1, addressLine2);

        result.fullAddress = fullAddress;

        const ratingsRepo = await this.database.getRepository(GuardRatings);
        const stateRepo = await this.database.getRepository(State);
        const cityRepo = await this.database.getRepository(City);
        const stateNameCheck = await stateRepo.findOne({
          where: {
            id: result.userProfile.stateId,
          },
        });
        const cityNameCheck = await cityRepo.findOne({
          where: {
            id: result.userProfile.cityId,
          },
        });
        let stateName = '';
        if (stateNameCheck) {
          stateName = stateNameCheck.name;
        }
        result.stateName = stateName;
        let cityName = '';
        if (cityNameCheck) {
          cityName = cityNameCheck.name;
        }
        result.cityName = cityName;
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
        const reviewResponseCount: any = await ratingsRepo
          .createQueryBuilder('guard_ratings')
          .where('guard_ratings.rated_to = :userId', { userId: userId })
          .andWhere(
            'guard_ratings.reviews IS NOT NULL AND guard_ratings.reviews <> :emptyString',
            { emptyString: '' }
          )
          .getCount();
        result.reviewCount = reviewResponseCount;
        result.totalRating = mappedRating;
      })
    );

    return {
      data: favouriteResult,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
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
}
