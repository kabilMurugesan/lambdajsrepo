export interface INotificationService {
  getNotificationList(
    event: any,
    page: any,
    pageSize: any,
    dateFilter: any,
    timeZone: any
  ): Promise<any>;
  makeNotificationRead(event: any, body: any): Promise<any>;
}
