import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaStack } from './LambdaStack';
import { CDKContext } from '../types';

export class FidoPipelineAppStage extends cdk.Stage {
  constructor(
    scope: Construct,
    id: string,
    context: CDKContext,
    props?: cdk.StageProps
  ) {
    super(scope, id, props);

    new LambdaStack(this, 'LambdaStack', context);
  }
}
