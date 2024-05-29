import { injectable } from 'inversify';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { externalConfig } from '../configuration/externalConfig';

@injectable()
export class AwsService implements IAwsService {
  private stsClient: STSClient;
  private s3Client: S3Client;
  // Define your AWS credentials here
  private readonly awsData: AWSData = externalConfig.AWS;

  constructor() {
    // Initialize the STSClient with awsConfig
    this.stsClient = new STSClient();
    this.s3Client = new S3Client();
  }

  async getSTSToken(): Promise<any> {
    try {
      const timestamp = new Date().getTime();
      const params = {
        RoleArn: this.awsData.stsRoleARN,
        RoleSessionName: `FIDO-STS-${timestamp}`,
        DurationSeconds: this.awsData.stsTokenExpiry,
      };
      console.log(params);
      const command = new AssumeRoleCommand(params);
      console.log('command', command);
      const data = await this.stsClient.send(command);
      console.log('data', data);

      if (data.Credentials) {
        console.log('dataCredentials', data.Credentials);
        // Create an object that includes data, region, and imageBucket
        const result = {
          credentials: data.Credentials,
          otherDetails: {
            region: 'us-east-2',
            profileImageFolder: this.awsData.profileImageFolder,
            certificatesFolder: this.awsData.certificatesFolder,
          },
        };

        console.log('result', result);

        return result;
      } else {
        console.error(`AWS STS TOKEN: Credentials are undefined`);
        return null;
      }
    } catch (error) {
      console.error(`AWS STS TOKEN: ${error.message}`);
      return null;
    }
  }
  // async getPreSignedUrl(Key: string, Expires: any, type: string): Promise<any> {
  //   try {
  //     const s3Params: {
  //       Bucket: string;
  //       Key: string;
  //       ResponseContentDisposition: string;
  //       ResponseContentType?: string;
  //     } = {
  //       Bucket: this.awsData.bucketName,
  //       Key,
  //       ResponseContentDisposition: 'inline',
  //     };
  //     if (type === 'pdf') {
  //       s3Params.ResponseContentType = 'application/pdf';
  //     }
  //     const command = new GetObjectCommand(s3Params);
  //     return await getSignedUrl(this.s3Client, command, {
  //       expiresIn: Number(Expires),
  //     });
  //   } catch (err) {
  //     console.log(`AWS SIGNED URL:${err.message}`);
  //     return '';
  //   }
  // }
  async getPreSignedUrl(folder: string, fileName: string,): Promise<any> {
    try {
      const Key = `${folder}/${fileName}`
      const lastDotIndex = fileName.lastIndexOf('.');
      const extension = fileName.slice(lastDotIndex + 1);
      const s3Params: {
        Bucket: string;
        Key: string;
        ResponseContentDisposition: string;
        ResponseContentType?: string;
      } = {
        Bucket: this.awsData.bucketName,
        Key,
        ResponseContentDisposition: 'inline',
      };
      if (extension === 'pdf') {
        s3Params.ResponseContentType = 'application/pdf';
      }
      const command = new GetObjectCommand(s3Params);
      return await getSignedUrl(this.s3Client, command, {
        expiresIn: Number(900),
      });
    } catch (err) {
      console.log(`AWS SIGNED URL:${err.message}`);
      return '';
    }
  }
}

export interface AWSData {
  certificatesFolder: string;
  stsRoleARN: string;
  stsTokenExpiry: number;
  profileImageFolder: string;
  bucketName: string;
}
