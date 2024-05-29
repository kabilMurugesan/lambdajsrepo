export interface SaveJobRequest {
  createdOn: Date;
  updatedOn: Date;
  updatedBy: any;
  createdBy: any;
  userId: any;
  jobName: string;
  guardCoverageId: string;
  guardServiceId: Array<string>;
  guardSecurityServiceId: string;
  noOfGuards: number;
  bookingReason: string;
  startDate: Date;
  endDate: Date;
  jobVenue: string;
  jobVenueLocationCoordinates: string;
  jobVenueRadius: string;
  checkList: Array<{
    date: string;
    time: string;
    description: string;
  }>;
  jobOccurenceDays: Array<{
    startTime: string;
    endTime: string;
    day: string;
  }>;
}

export interface EditJobRequest {
  createdOn: Date;
  updatedOn: Date;
  updatedBy: any;
  createdBy: any;
  jobId: any;
  userId: any;
  jobName: string;
  guardCoverageId: string;
  guardServiceId: Array<string>;
  guardSecurityServiceId: string;
  noOfGuards: number;
  bookingReason: string;
  startDate: Date;
  endDate: Date;
  jobVenue: string;
  jobVenueLocationCoordinates: string;
  jobVenueRadius: string;
  checkList: Array<{
    date: string;
    time: string;
    description: string;
  }>;
  jobOccurenceDays: Array<{
    startTime: string;
    endTime: string;
    day: string;
  }>;
}

export interface ConfirmJobRequest {
  jobId: any;
}

export interface UpdateGuardJobStatusRequest {
  jobId: any;
  status: number;
}

export interface guardPunchTimeRequest {
  jobId: any;
  guardCoordinates: string;
  teamId: any; //Incase if manatory in future
  isPunch: boolean;
}

export interface favoriteGuardRequest {
  guardId: string;
  isFavorite: any;
  id: any;
}
