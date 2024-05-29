import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IUserAvailabilityDayRepository } from '../interfaces/repo/IUserAvailabilityDayRepository';
import { UserAvailabilityDayRequest } from '../dto/UserAvailabilityDayDTO';
import { UserAvailabilityDay } from '../entities/UserAvailabilityDay';
import { UserAvailabilityDate } from '../entities/UserAvailabilityTime';
import { GlobalConstants } from '../constants/constants';
import { NotFoundException } from '../shared/errors/all.exceptions';
import { UserProfile } from '../entities/UserProfile';
import { JobGuards } from '../entities/JobGuards';
import { In, Not } from 'typeorm';

@injectable()
export class UserAvailabilityDayRepository
  implements IUserAvailabilityDayRepository
{
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
    private readonly globalConstants = GlobalConstants
  ) {}
  async createUserAvailability(
    UserAvailabilityDayPayload: UserAvailabilityDayRequest,
    user: any
  ): Promise<any> {
    const userId = user.id;
    const repo = await this.database.getRepository(UserAvailabilityDay);
    const UserAvailability = await this.database.getRepository(
      UserAvailabilityDate
    );
    const userRepo = await this.database.getRepository(UserProfile);
    const isValidUserProfile = await repo.findOneBy({
      userId,
    });
    if (isValidUserProfile) {
      //check whether user is assigned a job
      const jobGuardsRepo = await this.database.getRepository(JobGuards);
      const isGuardAssignedJob = await jobGuardsRepo.findOneBy({
        userId,
        jobStatus: Not(In([2, 3, 4])),
      });
      if (isGuardAssignedJob && isGuardAssignedJob.length > 0) {
        return Promise.reject(
          new NotFoundException(
            'Unable to edit availability timing because the guard is currently assigned to a job.'
          )
        );
      }
      await repo.delete({ userId: userId });
      await UserAvailability.delete({ userId: userId });
    }
    // inserting new value in database
    const insertPromises = UserAvailabilityDayPayload.availabilityDay.map(
      async (UserAvailabilityDayPayloads) => {
        const insertResult = await repo.insert({
          weekday: UserAvailabilityDayPayloads.weekday,
          userId: userId,
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
          createdBy: this.globalConstants.SYS_ADMIN_GUID,
          updatedOn: new Date(),
          createdOn: new Date(),
        });
        const generatedMaps = insertResult.generatedMaps;
        if (generatedMaps.length === 0) {
          throw new Error('Auto-generated ID not found');
        }

        const generatedId = generatedMaps[0].id;

        await UserAvailability.insert({
          userAvailabilityId: generatedId,
          // weekday: UserAvailabilityDayPayloads.weekday,
          userId: userId,
          startTime: UserAvailabilityDayPayloads.startTime,
          endTime: UserAvailabilityDayPayloads.endTime,
          updatedOn: new Date(),
          createdOn: new Date(),
          updatedBy: this.globalConstants.SYS_ADMIN_GUID,
          createdBy: this.globalConstants.SYS_ADMIN_GUID,
        });
      }
    );

    // Wait for all insertPromises to complete before continuing
    await Promise.all(insertPromises);

    const response: any = await repo.findAndCountBy({
      userId: userId,
    });
    if (!response) {
      return Promise.reject(new NotFoundException('User profile not exist'));
    }
    await userRepo.update({ userId: userId }, { isJobTimingAdded: true });
    const userDetails: UserProfile = await userRepo.findOneBy({
      userId,
    });
    return { ...response, ...userDetails };
  }
}
