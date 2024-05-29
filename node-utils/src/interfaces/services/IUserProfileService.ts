import {
  CreateUserProfileRequest,
  SaveJobInterestRequest,
} from '../../dto/UserProfileDTO';
import { UserProfile } from '../../entities/UserProfile';
import { JobInterest } from '../../entities/JobInterest';
import { GuardJobInterest } from '../../entities/GuardJobInterest';

export interface IUserProfileService {
  createUserProfile(
    event: any,
    CreateUserProfileRequest: CreateUserProfileRequest
  ): Promise<UserProfile>;
  getJobInterest(event: any): Promise<JobInterest[]>;
  saveJobInterest(
    event: any,
    SaveJobInterestRequest: SaveJobInterestRequest
  ): Promise<GuardJobInterest>;
  getUserProfileById(user: any): Promise<UserProfile>;
  addSuccessInfoToProfile(event: any): Promise<UserProfile>
  getUserAvailabilityById(event: any): Promise<any>;
}
