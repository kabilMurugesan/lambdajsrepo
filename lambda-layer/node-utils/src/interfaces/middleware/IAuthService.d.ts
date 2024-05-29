declare interface IAuthService {
  decodeJwt(cognitoUserId: any): Promise<any>;
}
