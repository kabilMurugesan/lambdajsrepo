import { CreateUserSignupRequest } from "../../dto/UserSignupDTO";
import { User } from '../../entities/User';

export interface IUserSignupRepository {
  createUserSignup(
    CreateUserSignupRequest: CreateUserSignupRequest
  ): Promise<any>;
}
