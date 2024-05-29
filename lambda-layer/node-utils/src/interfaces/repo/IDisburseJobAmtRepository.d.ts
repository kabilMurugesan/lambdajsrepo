export interface IDisburseJobAmtRepository {
  getJobGuards(): Promise<any>;
  updateJobGuardsTransferStatus(jobGuardId: string, type: string): Promise<any>;
  getJobTeamGuards(value: any): Promise<any>
  getPriceJobGuardsTransferPrice(jobGuardId: string): Promise<any>;
  getTeamLeadId(jobGuardTeamId: string): Promise<any>;
}
