import { injectable } from 'inversify';
import { GlobalConstants } from '../constants/constants';
import { Client } from 'onesignal-node'; // Import the OneSignal library

@injectable()
export class PushService implements IPushService {
  private client: Client;

  constructor(private readonly globalConstants = GlobalConstants) {
    this.client = new Client(
      this.globalConstants.ONESIGNAL_PUSH.appId,
      this.globalConstants.ONESIGNAL_PUSH.userAuthKey
    );
  }

  async sendPush(
    title: string,
    heading: string,
    userIds: string[],
    data: any = {},
    notificationDetails: any = {}
  ): Promise<any> {
    const payload = {
      headings: {
        en: title,
      },
      contents: {
        en: heading,
      },
      data,
      include_external_user_ids: userIds,
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
    };

    try {
      let response: any = await this.client.createNotification(payload);
      const responseCode = response.statusCode;
      const responseBody = response.body;
      let responseMsg;

      if (responseBody.errors !== undefined && responseBody.errors.length > 0) {
        responseMsg = responseBody.errors[0];
      } else {
        responseMsg = 'Push notification send successfully!';
      }
      console.log(`ONE-SIGNAL:SUCCESS:${JSON.stringify(response, null, 2)}`);
      return { status: 'COMPLETED', responseCode, responseMsg };
    } catch (error) {
      console.log(`ONE-SIGNAL:ERROR:${JSON.stringify(error.message, null, 2)}`);
      return {
        status: 'FAILED',
        responseCode: 400,
        responseMsg: error.message,
      };
    }
  }
}
