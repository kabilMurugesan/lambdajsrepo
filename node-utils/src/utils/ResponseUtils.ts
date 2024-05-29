import { APIGatewayProxyResult } from 'aws-lambda';

const responseHeaders: any = {
  // Required for CORS support to work
  'Access-Control-Allow-Origin': '*',
  // Required for cookies, authorization headers with HTTPS
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE,PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  // "Content-Type, Authorization, Content-Length, Transfer-Encoding",
};

// Function to generate a success response
export const successResponse = (
  data: any,
  message: string
): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify({
    code: 0,
    data,
    message,
  }),
  headers: responseHeaders,
});

export const warningResponse = (
  data: any,
  message: string
): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify({
    code: 1,
    data,
    message,
  }),
  headers: responseHeaders,
});
// Function to generate a success response
export const failureApiResponse = (
  data: any,
  message: string
): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify({
    code: 1,
    data,
    message,
  }),
  headers: responseHeaders,
});

// Function to generate a failure response
export const failureResponse = (
  statusCode: number,
  message: string
): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify({
    code: 1,
    data: {},
    message,
  }),
  headers: responseHeaders,
});

export const presignedUrlResponse = (
  url: string,
): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: responseHeaders,
  body: JSON.stringify(url)

});
