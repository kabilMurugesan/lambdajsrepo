// import { User } from '../../entities/User';
import { CreateUserSignupRequest } from '../../dto/UserSignupDTO';

export interface IUserSignupService {
  createUserSignup(
    CreateUserSignupRequest: CreateUserSignupRequest
  ): Promise<any>;
}
