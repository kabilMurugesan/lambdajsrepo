import { injectable } from 'inversify';
import { errorCode } from './error-codes';

@injectable()
export class CommonErrorHandler implements ICommonErrorHandler {
  async handle(
    error: any,
    type: string
  ): Promise<{ errorCode: string; errorMessage: string }> {
    const input = typeof error == 'object' ? JSON.stringify(error) : error;
    console.log(
      `Entering CommonErrorHandler with error data:: ${input} and error type: ${type}`
    );
    let errMsg = errorCode.ERR_100;
    switch (type) {
      case 'DB_ERROR':
        switch (error.code) {
          case 'ER_BAD_DB_ERROR':
            errMsg = errorCode.ERR_01;
            break;
        }
        break;
      case 'USER':
        switch (error) {
          case 'USER_NOT_FOUND':
            errMsg = errorCode.ERR_160;
            break;
          case 'USER_STATUS_NOT_FOUND':
            errMsg = errorCode.ERR_124;
            break;
          case 'ROLE_NOT_FOUND':
            errMsg = errorCode.ERR_125;
            break;
          case 'USER_NOT_ACTIVE':
            errMsg = errorCode.ERR_126;
            break;
          case 'EMAIL_ALREADY_EXIT':
            errMsg = errorCode.ERR_123;
            break;
          case 'MOBILE_ALREADY_EXIT':
            errMsg = errorCode.ERR_127;
            break;
          case 'USER_ROLE_UPDATED_FAILED':
            errMsg = errorCode.ERR_129;
        }
        break;
      default:
        errMsg = errorCode.ERR_100;
        break;
    }
    return errMsg;
  }
}
