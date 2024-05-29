#!/usr/bin/env node
// Shebang to specify the interpreter for the script

// Import necessary modules and classes
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CDKContext } from '../types';
import { FidoPipelineStack } from '../lib/FidoPipelineStack';
import { LambdaStack } from '../lib/LambdaStack';

// Function to get CDK Context based on the git branch
export const getContext = async (app: cdk.App): Promise<CDKContext> => {
  return new Promise(async (resolve, reject) => {
    try {
      // const currentBranch = await gitBranch();
      const currentBranch = 'development'; // Change this to use dynamic branch detection

      const environment = app.node
        .tryGetContext('environments')
        .find((e: any) => e.branchName === currentBranch);

      const globals = app.node.tryGetContext('globals');

      return resolve({ ...globals, ...environment });
    } catch (error) {
      console.error(error);
      return reject();
    }
  });
};

// Function to create stacks
const createStacks = async () => {
  try {
    const app = new cdk.App();
    const context = await getContext(app);
    const tags: any = {
      Environment: context.environment,
    };

    const stackProps: cdk.StackProps = {
      env: {
        region: context.region,
        account: context.accountNumber,
      },
      stackName: `${context.appName}-stack-${context.environment}`,
      description: `Stack for deploying ${context.appName} in ${context.environment} environment.`,
      tags,
    };

    // Create a LambdaStack
    // new LambdaStack(
    //   app,
    //   `${context.appName}-stack-${context.environment}`,
    //   context,
    //   stackProps
    // );

    // Create FidoPipelineStack if the branch is dev, stage, or main
    if (['development', 'qa', 'stage', 'main'].includes(context.branchName)) {
      new FidoPipelineStack(app, 'FidoApiPipeline', context, {
        env: {
          account: context.accountNumber,
          region: context.region,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// Call the createStacks function to initiate stack creation
createStacks();
