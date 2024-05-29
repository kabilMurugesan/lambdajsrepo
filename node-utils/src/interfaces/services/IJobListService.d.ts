export interface IJobListService {
  getJobListSummary(
    event: any,
    page: any,
    pageSize: any,
    status: any,
    getJobById: any
  ): Promise<any>;
  getJobDetailsById(event: any, jobId: any): Promise<any>;
  updateGuardJobStatus(
    event: any,
    updateGuardJobStatusPayload: any
  ): Promise<any>;
  updatePaymentWebhookDetails(webhookResponse: any): Promise<any>;
}
