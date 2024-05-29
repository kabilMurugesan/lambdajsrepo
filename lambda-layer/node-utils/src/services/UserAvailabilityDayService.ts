import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserAvailabilityDayRepository } from '../interfaces/repo/IUserAvailabilityDayRepository';
import { IUserAvailabilityDayService } from '../interfaces/services/IUserAvailabilityDayService';
import { UserAvailabilityDayRequest } from '../dto/UserAvailabilityDayDTO';

@injectable()
export class UserAvailabilityDayService implements IUserAvailabilityDayService {
  constructor(
    @inject(TYPES.IUserAvailabilityDayRepository)
    private readonly UserRepository: IUserAvailabilityDayRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService
  ) {}

  async createUserAvailability(
    event: any,
    UserAvailabilityDayRequest: UserAvailabilityDayRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const createUserAvailability: any =
      await this.UserRepository.createUserAvailability(
        UserAvailabilityDayRequest,
        user
      );
    return createUserAvailability;
  }
}
