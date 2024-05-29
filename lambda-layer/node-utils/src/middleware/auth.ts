import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserProfileRepository } from '../interfaces/repo/IUserProfileRepository';

import * as jwt from 'jsonwebtoken';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IUserProfileRepository)
    private readonly UserRepository: IUserProfileRepository
  ) {}

  // Define decodeJwt as an async method
  async decodeJwt(token: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const cognitoAuthToken = token.headers.Authorization;
        const decoded: any = jwt.decode(cognitoAuthToken, {
          complete: true,
        });
        if (decoded && decoded.header && decoded.payload) {
          const cognitoUserId: string = decoded.payload['cognito:username'];
          console.log('cognitoUserId: ', cognitoUserId);
          try {
            const userProfile = await this.UserRepository.getUserProfile(
              cognitoUserId
            );
            resolve(userProfile);
          } catch (error) {
            console.log('error: ', error);
            const customError = new CustomJwtError(error.message, 401); // Unauthorized
            reject(customError);
          }
        } else {
          const customError = new CustomJwtError('Unauthorized', 401);
          reject(customError);
        }
      } catch (err) {
        console.log(err);
        const customError = new CustomJwtError(err.message, 401); // Unauthorized
        reject(customError);
      }
    });
  }
}

// Define CustomJwtError class
class CustomJwtError extends Error {
  httpCode: number;

  constructor(message: string, httpCode: number) {
    super(message);
    this.name = 'UNAUTHORIZED';
    this.httpCode = httpCode;
  }
}
