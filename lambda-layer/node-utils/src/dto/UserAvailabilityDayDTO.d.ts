export interface UserAvailabilityDayRequest {
    userId: string;
    availabilityDay: Array<{
        weekday: string;
        startTime: string;
        endTime: string;
    }>;
}