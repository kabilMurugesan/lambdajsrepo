import { Notification } from '../../entities/Notification';

export interface INotificationRepository {
  updateNotificationStatus(id: string, returnMsg: any): Promise<any>;
  saveNotification(
    user_id: string,
    type: string,
    title: string,
    message: string,
    landingPage: string,
    landingPageId: string
  ): Promise<Notification>;

  getAllNotification(
    dateFilter: any,
    timeZone: any,
    user: any,
    page: any,
    pageSize: any
  ): Promise<any>;
  makeNotificationRead(userId: string, body: any): Promise<any>;
}
