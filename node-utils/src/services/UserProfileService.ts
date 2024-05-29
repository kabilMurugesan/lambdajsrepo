import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserProfileRepository } from '../interfaces/repo/IUserProfileRepository';
import {
  CreateUserProfileRequest,
  SaveJobInterestRequest,
} from '../dto/UserProfileDTO';
import { IUserProfileService } from '../interfaces/services/IUserProfileService';
import { UserProfile } from '../entities/UserProfile';
import { JobInterest } from '../entities/JobInterest';
import { GuardJobInterest } from '../entities/GuardJobInterest';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';

@injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @inject(TYPES.IUserProfileRepository)
    private readonly UserRepository: IUserProfileRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.IStripeService)
    private readonly stripeService: IStripeService,
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
  ) { }

  async createUserProfile(
    event: any,
    createUserProfilePayload: CreateUserProfileRequest
  ): Promise<UserProfile> {
    const user = await this.authService.decodeJwt(event);
    const createUserProfile: UserProfile =
      await this.UserRepository.createUserProfile(
        createUserProfilePayload,
        user
      );
    const repo = await this.database.getRepository(UserProfile);
    const userResponse = await repo.findOneBy({
      userId: user.id,
    });
    if (
      createUserProfilePayload.firstName !== undefined &&
      createUserProfilePayload.firstName !== '' &&
      userResponse.isStripeDetailsAdded == false
    ) {
      const stripeData = {
        email: user.email,
        name: `${createUserProfilePayload.firstName} ${createUserProfilePayload.lastName}`,
      };
      const stripeResponse = await this.stripeService.createCustomer(
        stripeData
      );
      if (stripeResponse && stripeResponse.id) {
        const stripeDtls = {
          stripeCustomerId: stripeResponse.id,
          userId: user.id,
          createdBy: user.id,
          updatedBy: user.id,
          updatedOn: new Date(),
          createdOn: new Date(),
        };
        await this.UserRepository.createStripeCustomer(stripeDtls);
      }
    }
    return createUserProfile;
  }

  async saveJobInterest(
    event: any,
    saveJobInterestPayload: SaveJobInterestRequest
  ): Promise<GuardJobInterest> {
    const user = await this.authService.decodeJwt(event);
    const saveJobInterest: GuardJobInterest =
      await this.UserRepository.saveJobInterest(saveJobInterestPayload, user);
    return saveJobInterest;
  }

  async getJobInterest(event: any): Promise<JobInterest[]> {
    const user = await this.authService.decodeJwt(event);
    const jobInterest: JobInterest[] = await this.UserRepository.getJobInterest(
      user
    );

    // Use the type annotation for the reduce function
    const groupedData: GroupedData = jobInterest.reduce((acc, item) => {
      const interestTypeName =
        item.interestType === 1 ? 'How Long?' : 'Service Type';

      if (!acc[item.interestType]) {
        acc[item.interestType] = {
          name: interestTypeName,
          values: [],
        };
      }

      const itemResponse: any = {
        id: item.id,
        itemName: item.interestName,
        itemDescription: item.description,
        isInterested: item.guardJobInterests.length > 0 ? 1 : 0,
      };

      acc[item.interestType].values.push(itemResponse);

      return acc;
    }, {} as GroupedData); // Initialize acc as an empty object with the GroupedData type

    // Convert the grouped data object into an array
    const result = Object.values(groupedData);
    return result;
  }

  async getUserProfileById(event: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const jobInterest: any = await this.UserRepository.getUserProfileById(
      user.cognitoUserId
    );

    // Use the type annotation for the reduce function
    return jobInterest;
  }

  async getUserAvailabilityById(event: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userAvailabilityResult: any = await this.UserRepository.getUserAvailabilityById(
      user
    );

    // Use the type annotation for the reduce function
    return userAvailabilityResult;
  }
  async addSuccessInfoToProfile(
    event: any,
  ): Promise<UserProfile> {
    const user = await this.authService.decodeJwt(event);
    const createUserProfile: UserProfile =
      await this.UserRepository.addSuccessInfoToProfile(
        user
      );
    return createUserProfile;
  }
}

interface GroupedData {
  [key: number]: {
    name: string;
    values: JobInterest[];
  };
}




