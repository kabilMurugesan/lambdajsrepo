import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserSignupRepository } from '../interfaces/repo/IUserSignupRepository';
import { CreateUserSignupRequest } from '../dto/UserSignupDTO';
import { IUserSignupService } from '../interfaces/services/IUserSignupService';
// import { GlobalConstants } from '../constants/constants';

@injectable()
export class UserSignupService implements IUserSignupService {
  constructor(
    @inject(TYPES.IUserSignupRepository)
    private readonly UserSignupRepository: IUserSignupRepository
  ) {}
  async createUserSignup(
    createUserSignupPayload: CreateUserSignupRequest
  ): Promise<any> {
    const createUserSignup: any =
      await this.UserSignupRepository.createUserSignup(createUserSignupPayload);

    return createUserSignup;
  }
}
