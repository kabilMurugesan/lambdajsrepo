import { UserAvailabilityDayRequest } from "../../dto/UserAvailabilityDayDTO";
import { UserAvailabilityDay } from "../../entities/UserAvailabilityDay";


export interface IUserAvailabilityDayRepository {
    createUserAvailability(
        user: any,
        UserAvailabilityDayRequest: UserAvailabilityDayRequest
    ): Promise<UserAvailabilityDay>;
}