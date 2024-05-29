import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { INotificationService } from '../interfaces/services/INotificationService';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.INotificationRepository)
    private readonly NotificationRepository: INotificationRepository
  ) {}

  async getNotificationList(
    event: any,
    page: any,
    pageSize: any,
    dateFilter: any,
    timeZone: any
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    return await this.NotificationRepository.getAllNotification(
      dateFilter,
      timeZone,
      user,
      page,
      pageSize
    );
  }
  async makeNotificationRead(event: any, body: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const userId = user.id;
    return await this.NotificationRepository.makeNotificationRead(userId, body);
  }
}
