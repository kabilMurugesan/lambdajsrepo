declare interface IEmailService {
  sendEmail(templateId: string, to: string, variables: any): Promise<any>;
}
