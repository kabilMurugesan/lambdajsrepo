import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { FidoPipelineAppStage } from './Stage';
import { CDKContext } from '../types';

export class FidoPipelineStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    context: CDKContext,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'FidoApiPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'Fido-Security/fido-app-api',
          context.branchName
        ),
        commands: ['chmod +x build.sh', './build.sh'],
      }),
      // Disable change set creation and make deployments in pipeline as single step
      useChangeSets: false,
    });

    pipeline.addStage(
      new FidoPipelineAppStage(this, context.stageName, context, {
        env: { account: context.accountNumber, region: context.region },
      })
    );
  }
}
