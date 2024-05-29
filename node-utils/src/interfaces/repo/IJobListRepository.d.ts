export interface IJobListRepository {
  getJobListSummary(
    event: any,
    page: any,
    pageSize: any,
    status: any,
    getJobById: any
  ): Promise<any>;
  getJobDetailsById(event: any, jobId: any): Promise<any>;
  updateGuardJobStatus(
    user: any,
    updateGuardJobStatusPayload: any
  ): Promise<any>;
}
