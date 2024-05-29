import { Duration } from 'aws-cdk-lib';
import { LambdaDefinition, CDKContext } from '../types';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Constants
const DEFAULT_LAMBDA_MEMORY_MB = 256;
const DEFAULT_LAMBDA_TIMEOUT_SECS = 5;

// Returns Lambda Function properties with defaults and overwrites
export const getFunctionProps = (
  lambdaDefinition: LambdaDefinition,
  lambdaLayer: lambda.LayerVersion,
  context: CDKContext
): NodejsFunctionProps => {
  const functionProps: NodejsFunctionProps = {
    functionName: `${context.appName}-${lambdaDefinition.name}-${context.environment}`,
    entry: `lambda-handlers/${lambdaDefinition.name}.ts`,
    runtime: lambda.Runtime.NODEJS_18_X, // Change to your preferred runtime version
    memorySize: lambdaDefinition.memoryMB
      ? lambdaDefinition.memoryMB
      : DEFAULT_LAMBDA_MEMORY_MB,
    timeout: lambdaDefinition.timeoutSecs
      ? Duration.seconds(lambdaDefinition.timeoutSecs)
      : Duration.seconds(DEFAULT_LAMBDA_TIMEOUT_SECS),
    environment: lambdaDefinition.environment,
    layers: [lambdaLayer],
  };
  return functionProps;
};
