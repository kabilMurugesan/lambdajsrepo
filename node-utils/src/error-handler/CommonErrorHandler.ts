import errorCodes from "./error-codes";
import { errorBelongsTo, errorMessages } from "./error-constants";

export class CommonErrorHandler {
  static handle(errorMessage: string, belongsTo: string) {
    let error = {};
    switch (belongsTo) {
      case errorBelongsTo.SIGNUP:
        {
          switch (errorMessage) {
            case errorMessages.CUSTOMER_SIGNUP_PAYLOAD_MISSING:
              error = errorCodes.ERR_001;
              break;
            case errorMessages.USER_WITH_EMAIL_OR_PHONE_ALREADY_EXISTS:
              error = errorCodes.ERR_002;
              break;
          }
        }
        break;
      case errorBelongsTo.USER_PROFILE:
        {
          switch (errorMessage) {
            case errorMessages.USER_ID_IS_MISSING:
              error = errorCodes.ERR_003;
              break;
            case errorMessages.USER_NOT_FOUND:
              error = errorCodes.ERR_004;
              break;
            case errorMessages.USER_WITH_EMAIL_OR_PHONE_ALREADY_EXISTS:
              error = errorCodes.ERR_002;
              break;
          }
        }
        break;
    }
    return error;
  }
}
