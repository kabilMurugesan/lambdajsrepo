import { injectable } from 'inversify';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { GlobalConstants } from '../constants/constants';

@injectable()
export class EmailService implements IEmailService {
  constructor(private readonly globalConstants = GlobalConstants) {}

  async sendEmail(
    templateId: string,
    to: string,
    variables: any
  ): Promise<any> {
    const emailData = {
      templateId,
      to,
      variables,
    };

    console.log('emailData:', emailData);

    try {
      const response: AxiosResponse = await axios.post(
        'https://live.waypointapi.com/v1/sandbox/email_messages',
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          auth: {
            username: this.globalConstants.WAYPOINT_API.USERNAME,
            password: this.globalConstants.WAYPOINT_API.PASSWORD,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.message);
      const axiosError = error as AxiosError;
      console.error('Error sending email:', axiosError.message);
      if (axiosError.response) {
        console.error('Error response data:', axiosError.response.data);
      }
      throw error; // Rethrow the error to the caller
    }
  }
}
