import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '../shared/errors/all.exceptions';

export const setAppropriateError = async (err: any) => {
  console.log('Error ->>>>> ', err);
  if (
    err instanceof BadRequestException ||
    err instanceof UnauthorizedException ||
    err instanceof ConflictException ||
    err instanceof InternalServerErrorException ||
    err instanceof MethodNotAllowedException ||
    err instanceof NotFoundException ||
    err instanceof RequestTimeoutException ||
    err instanceof ForbiddenException
  )
    return err;

  return Promise.reject(new InternalServerErrorException(err));
};
export const convertToTitleCase = function (str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
