declare interface ICommonErrorHandler {
  handle(
    error: any,
    type: string
  ): Promise<{ errorCode: string; errorMessage: string }>;
}
