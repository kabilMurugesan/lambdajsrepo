import {
  CreateUserProfileRequest,
  SaveJobInterestRequest,
} from '../../dto/UserProfileDTO';
import { UserProfile } from '../../entities/UserProfile';
import { JobInterest } from '../../entities/JobInterest';
import { GuardJobInterest } from '../../entities/GuardJobInterest';
import { User } from '../../entities/User';

export interface IUserProfileRepository {
  createUserProfile(
    CreateUserProfileRequest: CreateUserProfileRequest,
    user: any
  ): Promise<UserProfile>;
  getJobInterest(user: any): Promise<JobInterest[]>;
  saveJobInterest(
    user: any,
    SaveJobInterestRequest: SaveJobInterestRequest
  ): Promise<GuardJobInterest>;
  getUserProfile(cognitoUserId: any): Promise<User[]>;
  getUserProfileById(user: any): Promise<UserProfile>;
  createStripeCustomer(stripeDtls: any): Promise<any>;
  addSuccessInfoToProfile(event: any): Promise<UserProfile>;
  getUserDetails(userId: any): Promise<any>;
  getUserAvailabilityById(event: any): Promise<any>;
}
