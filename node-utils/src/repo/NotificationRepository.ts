import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { INotificationRepository } from '../interfaces/repo/INotificationRepository';
import { Notification } from '../entities/Notification';
import { Between, FindManyOptions, IsNull, LessThan, Not } from 'typeorm';
import moment from 'moment';
// import moment from 'moment-timezone';

@injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService
  ) {}
  async saveNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    landingPage: string,
    landingPageId: string
  ): Promise<Notification> {
    const repo = await this.database.getRepository(Notification);
    // save the params to notification
    const notification = new Notification();
    notification.userId = userId;
    notification.type = type;
    notification.title = title;
    notification.message = message;
    notification.landingPage = landingPage;
    notification.landingPageId = landingPageId;
    notification.status = 'PENDING';
    notification.isRead = false;
    notification.createdBy = userId;
    notification.createdOn = new Date();
    notification.updatedBy = userId;
    notification.updatedOn = new Date();
    const response = await repo.save(notification);

    return response;
  }

  async updateNotificationStatus(
    notificationId: string,
    returnMsg: any
  ): Promise<any> {
    const repo = await this.database.getRepository(Notification);
    await repo.update(
      { id: notificationId },
      {
        responseCode: returnMsg.responseCode,
        responseMsg: returnMsg.responseMsg,
        status: returnMsg.status,
        updatedOn: new Date(),
      }
    );
  }

  async makeNotificationRead(userId: string, body: any): Promise<any> {
    const repo = await this.database.getRepository(Notification);
    const updateParams = {
      isRead: true,
      updatedOn: new Date(),
    };

    if (body && body.notificationId) {
      await repo.update({ id: body.notificationId }, updateParams);
    } else {
      await repo.update({ userId }, updateParams);
    }
  }

  // async getAllNotification(
  //   // dateFilter: any,
  //   // timeZone: any,
  //   user: any
  // ): Promise<any> {
  //   const userId = user.id;
  //   const repo = await this.database.getRepository(Notification);
  //   // const currentDate = moment().tz(timeZone);
  //   // const startOfDay = currentDate.clone().startOf('day');
  //   // const endOfDay = currentDate.clone().endOf('day');
  //   // const startOfDayUTC = startOfDay
  //   // .clone()
  //   // .utc()
  //   // .format('YYYY-MM-DD HH:mm:ss');
  //   let queryBuilder = repo
  //     .createQueryBuilder('notification')
  //     .select([
  //       'notification.message',
  //       'notification.title',
  //       'notification.landingPage',
  //       'notification.landingPageId',
  //       'notification.isRead',
  //     ])
  //     .where('notification.userId = :userId', { userId });
  //   // if (dateFilter === 'TODAY') {
  //   //   const endOfDayUTC = endOfDay.clone().utc().format('YYYY-MM-DD HH:mm:ss');
  //   //   queryBuilder = queryBuilder
  //   //     .andWhere('notification.createdOn >= :startOfDayUTC', {
  //   //       startOfDayUTC,
  //   //     })
  //   //     .andWhere('notification.createdOn <= :endOfDayUTC', {
  //   //       endOfDayUTC,
  //   //     });
  //   // } else {
  //   //   queryBuilder = queryBuilder.andWhere(
  //   //     'notification.createdOn < :startOfDayUTC',
  //   //     {
  //   //       startOfDayUTC,
  //   //     }
  //   //   );
  //   // }
  //   queryBuilder = queryBuilder.orderBy('notification.createdOn', 'DESC');

  //   const response = await queryBuilder.getMany();
  //   return response;
  // }
  async getAllNotification(
    dateFilter: any,
    timeZone: any,
    user: any,
    page: any,
    pageSize: any
  ): Promise<any> {
    const userId = user.id;
    console.log('userId', userId);

    const options: FindManyOptions<Notification> = {};
    const conditions: any = {
      userId,
      status: 'COMPLETED',
      type: 'PUSH',
      message: Not(IsNull()), //////added for extra validation
    };

    let currentDate: any;
    let startOfDay: any;
    let endOfDay: any;
    let startOfDayUTC: any;
    let endOfDayUTC: any;
    let todayUnreadCount = 0;
    let previousDayUnreadCount = 0;
    let unreadCount = 0;

    if (dateFilter !== undefined && timeZone != undefined && timeZone != '') {
      currentDate = moment().tz(timeZone);
      startOfDay = currentDate.clone().startOf('day');
      endOfDay = currentDate.clone().endOf('day');
      startOfDayUTC = startOfDay.clone().utc().format('YYYY-MM-DD HH:mm:ss');

      if (dateFilter === 'TODAY') {
        endOfDayUTC = endOfDay.clone().utc().format('YYYY-MM-DD HH:mm:ss');

        conditions.createdOn = Between(startOfDayUTC, endOfDayUTC);
      } else {
        conditions.createdOn = LessThan(startOfDayUTC);
      }
    }

    options.where = conditions;
    options.take = Number(pageSize);

    if (page && pageSize) {
      options.skip = (page - 1) * pageSize;
    }

    options.order = {
      createdOn: 'DESC',
    };

    options.select = [
      'id',
      'message',
      'title',
      'landingPage',
      'landingPageId',
      'isRead',
      'updatedOn',
      'createdOn',
    ];

    const repo = await this.database.getRepository(Notification);
    const [results, count] = await repo.findAndCount(options);

    const NotificationRepository = await this.database.getRepository(
      Notification
    );

    const calculateUnreadCount = async (
      start: string | null,
      end: string | null
    ) => {
      const queryBuilder = NotificationRepository.createQueryBuilder('nr')
        .select('COUNT(*)', 'count')
        .where('nr.is_read = :isRead', { isRead: false })
        .andWhere('nr.user_id = :userId', { userId })
        .andWhere('nr.message IS NOT NULL');

      if (start !== null && end !== null) {
        queryBuilder.andWhere('nr.created_on BETWEEN :start AND :end', {
          start,
          end,
        });
      } else if (end !== null) {
        queryBuilder.andWhere('nr.created_on < :end', { end });
      }

      const unreadCountResult = await queryBuilder.getRawOne();

      return parseInt(unreadCountResult.count);
    };

    if (dateFilter !== undefined && timeZone != undefined && timeZone != '') {
      // Usage
      [todayUnreadCount, previousDayUnreadCount] = await Promise.all([
        calculateUnreadCount(endOfDayUTC, endOfDayUTC), // Today's records
        calculateUnreadCount('', startOfDayUTC), // Previous day's records
      ]);
    } else {
      [unreadCount] = await Promise.all([calculateUnreadCount(null, null)]);
    }

    const response: any = {
      count,
      results,
      unreadCount,
      todayUnreadCount,
      previousDayUnreadCount,
      pages: pageSize ? Math.ceil(count / pageSize) : 1,
    };

    return response;
  }
}
