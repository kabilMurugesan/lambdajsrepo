import { SaveJobGuardsRequest } from '../../dto/AddingJobGuards';
import { ConfirmJobRequest, EditJobRequest, SaveJobRequest, guardPunchTimeRequest } from '../../dto/JobDTO';
import { Job } from '../../entities/Job';

export interface IJobService {
  editJob(event: any, editJobRequest: EditJobRequest): Promise<any>;
  saveJob(event: any, saveJobRequest: SaveJobRequest): Promise<Job>;
  getJobSummary(jobId: any): Promise<Job[]>;
  confirmJob(event: any, confirmJobPayload: ConfirmJobRequest): Promise<Job>;
  saveJobGuard(event: any, saveJobRequest: SaveJobGuardsRequest): Promise<any>;
  guardPunchTime(event: any, guardPunchTimeRequest: guardPunchTimeRequest): Promise<any>
  deleteJob(jobId: any, status: any): Promise<any>
}
