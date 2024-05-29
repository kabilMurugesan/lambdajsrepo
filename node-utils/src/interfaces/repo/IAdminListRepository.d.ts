export interface IListRepository {
  getGuardList(searchKeyword: string, page: number, pageSize: number, platform: any): Promise<any>;
  getGuardTeamList(searchKeyword: string, teamId: string, page: number, pageSize: number, guardInterestId: any, platform: any): Promise<any>;
  getAllList(searchKeyword: string, page: number, pageSize: number, platform: any): Promise<any>;
  getGuardsList(searchKeyword: string, page: number, pageSize: number, type: string, guardInterestId: any, platform: any): Promise<any>;
  getTransactionList(page: number, pageSize: number): Promise<any>
  getUserDetailsById(id: string, type: string, page: any, pageSize: any, jobId: any, event: any): Promise<any>;
  getJobList(searchKeyword: string, page: number, pageSize: number): Promise<any>;
  getDashboard(type: string): Promise<any>;
  getRatingsReview(page: number, pageSize: number): Promise<any>;
}
