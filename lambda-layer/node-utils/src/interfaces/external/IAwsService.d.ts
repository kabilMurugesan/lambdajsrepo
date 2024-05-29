declare interface IAwsService {
  getSTSToken(): Promise<any>;
  getPreSignedUrl(file: string, fileName: any): Promise<any>;
}
