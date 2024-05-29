import { UserAvailabilityDayRequest } from '../../dto/UserAvailabilityDayDTO';
import { UserAvailabilityDay } from '../../entities/UserAvailabilityDay';

export interface IUserAvailabilityDayService {
  createUserAvailability(
    event: any,
    UserAvailabilityDayRequest: UserAvailabilityDayRequest
  ): Promise<UserAvailabilityDay>;
}
