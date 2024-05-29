import { SaveJobGuardsRequest } from '../../dto/AddingJobGuards';
import {
  ConfirmJobRequest,
  EditJobRequest,
  SaveJobRequest,
  guardPunchTimeRequest,
} from '../../dto/JobDTO';
import { Job } from '../../entities/Job';

export interface IJobRepository {
  editJob(event: any, editJobRequest: EditJobRequest): Promise<any>;
  saveJob(user: any, saveJobRequest: SaveJobRequest): Promise<Job>;
  getJobSummary(jobId: any): Promise<Job[]>;
  getJobGuards(confirmJobPayload: ConfirmJobRequest): Promise<any>;
  saveJobGuard(event: any, saveJobRequest: SaveJobGuardsRequest): Promise<any>;
  guardPunchTime(
    event: any,
    guardPunchTimeRequest: guardPunchTimeRequest
  ): Promise<any>;
  getCustomerPaymentDetails(userId: any): Promise<any>;
  updatePaymentStatus(
    paymentDtls: any,
    userId: string,
    jobId: string
  ): Promise<any>;
  savePayment(paymentData: any): Promise<any>;
  deleteJob(jobId: any, status: any): Promise<any>;
  getJobDetails(jobId: string): Promise<any>;
  getCrimeRateCommissionPercentage(
    county: string,
    municipality: string
  ): Promise<any>;
}
