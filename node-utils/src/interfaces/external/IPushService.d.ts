declare interface IPushService {
  sendPush(
    title: string,
    heading: string,
    userIds: string[],
    data: any,
    notificationDetails: any
  ): Promise<any>;
}
