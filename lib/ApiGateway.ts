import { RemovalPolicy } from 'aws-cdk-lib';
import {
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi,
  Cors,
  AuthorizationType,
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

// Custom class that extends RestApi to configure API Gateway
export class ApiGateway extends RestApi {
  constructor(scope: Construct, stageName: string) {
    // Call the constructor of the RestApi class
    super(scope, 'ApiGateway', {
      restApiName: 'fido-security', // Name of the API Gateway
      deployOptions: {
        // Configure access logging for the API Gateway
        accessLogDestination: new LogGroupLogDestination(
          new LogGroup(scope, `fidoApiLogGroup-${new Date().toISOString()}`, {
            retention: RetentionDays.ONE_MONTH, // Log retention duration
            removalPolicy: RemovalPolicy.DESTROY, // Log group removal policy
          })
        ),
        stageName,
      },
    });
  }

  // Method to add integration between API Gateway and Lambda function
  addIntegrationWithAuth(methods: string[], path: string, lambda: IFunction) {
    const resource = this.root.resourceForPath(path); // Get the API resource
    methods.forEach((method) => {
      resource.addMethod(method, new LambdaIntegration(lambda), {
        authorizer: {
          authorizerId: 'fulgwu', // Reference to the authorizer
          authorizationType: AuthorizationType.COGNITO,
        },
      });
    });
    resource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      statusCode: 200,
    });
  }
  addIntegrationWithoutAuth(
    methods: string[],
    path: string,
    lambda: IFunction
  ) {
    const resource = this.root.resourceForPath(path); // Get the API resource
    methods.forEach((method) => {
      resource.addMethod(method, new LambdaIntegration(lambda));
    });
    resource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      statusCode: 200,
    });
  }
}
