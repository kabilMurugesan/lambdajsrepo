import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CDKContext, LambdaDefinition } from '../types';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cwLogs from 'aws-cdk-lib/aws-logs';
import { getFunctionProps } from './LambdaConfig';
import { ApiGateway } from './ApiGateway';

export class LambdaStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    context: CDKContext,
    props?: StackProps
  ) {
    super(scope, id, props);

    // Define environment variables
    const environment = {
      REGION: context.region,
      ENV: context.environment,
      GIT_BRANCH: context.branchName,
      DB_NAME: context.db_name,
      DB_PASSWORD: context.db_password,
      DB_USERNAME: context.db_username,
      DB_PORT: String(context.db_port),
      DB_HOST: context.db_host,
      STAGE_NAME: context.stageName,
      API_BASE_URL: context.apiBaseUrl,
      HOME_PAGE_URL: context.homePageUrl,
    };

    // Create an instance of the API Gateway construct
    const apiGateway = new ApiGateway(this, environment.STAGE_NAME);

    // Create a Lambda Layer
    const lambdaLayer = new lambda.LayerVersion(this, 'lambdaLayer', {
      code: lambda.Code.fromAsset('lambda-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: `Lambda Layer for ${context.appName}`,
    });

    //  Lambda Security Group
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'lambdaSG',
      context.securityGroupId
    );

    // Import existing VPC based on VPC ID.
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'vpc', {
      vpcId: context.vpc.id,
      availabilityZones: context.availabilityZones,
    });

    // Import privateSubnets
    const privateSubnets = context.vpc.privateSubnetIds.map((id, index) => {
      return ec2.Subnet.fromSubnetAttributes(this, `privateSubnet${index}`, {
        routeTableId: context.vpc.routeTableId,
        subnetId: id,
      });
    });

    // Import an existing IAM role
    const role = iam.Role.fromRoleArn(this, 'Role', context.iamrole, {
      mutable: false,
    });

    // Define an array of Lambda configurations
    const lambdaOptionsArray = [
      {
        name: 'UserProfile',
        isPrivate: true,
        environment,
        methods: ['PUT', 'GET', 'POST'],
        endpoint: 'profile',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'ConfigurationToken',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'configuration-token',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'UserSignup',
        isPrivate: false,
        environment,
        methods: ['POST'],
        endpoint: 'signup',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'JobInterest',
        isPrivate: true,
        environment,
        methods: ['GET', 'POST'],
        endpoint: 'job-interest',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'GetState',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'get-state-list',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'GetCity',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'get-city-list',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'PingFunction',
        isPrivate: false,
        environment,
        methods: ['GET'],
        endpoint: 'ping',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'GuardTeam',
        isPrivate: true,
        environment,
        methods: ['GET', 'POST'],
        endpoint: 'guard-team',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'Job',
        isPrivate: true,
        environment,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        endpoint: 'job',
        memoryMB: 512,
        timeoutSecs: 5,
      },
      {
        name: 'AdminList',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'admin-list',
        memoryMB: 1024,
        timeoutSecs: 10,
      },
      {
        name: 'AdminApproval',
        isPrivate: true,
        environment,
        methods: ['POST', 'PUT'],
        endpoint: 'approve-guard',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'Radius',
        isPrivate: true,
        environment,
        methods: ['POST', 'GET', 'DELETE', 'PUT'],
        endpoint: 'radius',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'CompanyDetails',
        isPrivate: true,
        environment,
        methods: ['POST', 'PUT'],
        endpoint: 'company-details',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'VerifyOtp',
        isPrivate: false,
        environment,
        methods: ['POST', 'GET'],
        endpoint: 'verify-otp',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'JobList',
        isPrivate: true,
        environment,
        methods: ['GET', 'PATCH'],
        endpoint: 'job-list',
        memoryMB: 1024,
        timeoutSecs: 5,
      },
      {
        name: 'GetTeamList',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'guard-team-list',
        memoryMB: 512,
        timeoutSecs: 5,
      },
      {
        name: 'GetGuardTeamDetails',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'guard-details',
        memoryMB: 512,
        timeoutSecs: 5,
      },
      {
        name: 'AddingGuard',
        isPrivate: true,
        environment,
        methods: ['POST'],
        endpoint: 'add-guard',
        memoryMB: 1024,
        timeoutSecs: 5,
      },
      {
        name: 'Notification',
        isPrivate: true,
        environment,
        methods: ['GET', 'PATCH'],
        endpoint: 'notification',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'GuardPunchInTime',
        isPrivate: true,
        environment,
        methods: ['POST'],
        endpoint: 'guard-time',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'ApproveCheckList',
        isPrivate: true,
        environment,
        methods: ['POST'],
        endpoint: 'approve-checklist',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'PaymentAccounts',
        isPrivate: true,
        environment,
        methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET'],
        endpoint: 'payment-accounts',
        memoryMB: 512,
        timeoutSecs: 5,
      },
      {
        name: 'ConnectedAccounts',
        isPrivate: true,
        environment,
        methods: ['POST', 'PUT', 'GET'],
        endpoint: 'connected-accounts',
        memoryMB: 1024,
        timeoutSecs: 10,
      },
      {
        name: 'GuardPayout',
        isPrivate: true,
        environment,
        methods: ['PUT', 'POST'],
        endpoint: 'guard-payout',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'ChooseGuardList',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'choose-guard',
        memoryMB: 1024,
        timeoutSecs: 15,
      },
      {
        name: 'RatingsReviews',
        isPrivate: true,
        environment,
        methods: ['POST', 'GET', 'PATCH', 'PUT'],
        endpoint: 'ratings-review',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'Transaction',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'transaction',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'DisburseJobAmount',
        isPrivate: true,
        environment,
        methods: ['POST'],
        endpoint: 'disburse-job-amount',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'Chat',
        isPrivate: true,
        environment,
        methods: ['GET', 'POST', 'PUT'],
        endpoint: 'chat',
        memoryMB: 512,
        timeoutSecs: 5,
      },
      {
        name: 'Dashboard',
        isPrivate: true,
        environment,
        methods: ['GET'],
        endpoint: 'dashboard',
        memoryMB: 1024,
        timeoutSecs: 10,
      },
      {
        name: 'PublicData',
        isPrivate: false,
        environment,
        methods: ['GET', 'POST'],
        endpoint: 'public-data',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      {
        name: 'FavoriteGuard',
        isPrivate: false,
        environment,
        methods: ['POST', 'GET'],
        endpoint: 'favorite-guard',
        memoryMB: 256,
        timeoutSecs: 5,
      },
      // Add other Lambda configurations here
    ];

    // Iterate through the Lambda configurations and create functions
    lambdaOptionsArray.forEach(
      ({
        name,
        environment,
        isPrivate,
        methods,
        endpoint,
        memoryMB,
        timeoutSecs,
      }) => {
        const lambdaConfig = {
          name,
          environment,
          isPrivate,
          memoryMB,
          timeoutSecs,
        };
        this.prepareLambda(
          lambdaConfig,
          lambdaLayer,
          context,
          apiGateway,
          methods,
          endpoint,
          securityGroup,
          vpc,
          privateSubnets,
          role
        );
      }
    );
  }

  private prepareLambda(
    lambdaDefinition: LambdaDefinition,
    lambdaLayer: lambda.LayerVersion,
    context: CDKContext,
    apiGateway: ApiGateway,
    methods: string[],
    path: string,
    securityGroup: ec2.ISecurityGroup,
    vpc?: ec2.IVpc,
    privateSubnets?: ec2.ISubnet[],
    lambdaRole?: iam.IRole
  ) {
    let functionProps = getFunctionProps(
      lambdaDefinition,
      lambdaLayer,
      context
    );

    // Check if function is private and add VPC, SG and Subnets
    if (lambdaDefinition.isPrivate) {
      functionProps = {
        ...functionProps,
        vpc: vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        securityGroups: [securityGroup],
        role: lambdaRole,
      };
    }

    // Lambda function
    const lambdaFunction = new NodejsFunction(
      this,
      `${lambdaDefinition.name}-function`,
      functionProps
    );

    if (lambdaDefinition.name !== 'DisburseJobAmount') {
      if (lambdaDefinition.isPrivate) {
        apiGateway.addIntegrationWithAuth(methods, path, lambdaFunction);
      } else {
        apiGateway.addIntegrationWithoutAuth(methods, path, lambdaFunction);
      }
    }

    methods.forEach((method) => {
      // Create corresponding Log Group with one month retention for each method
      new cwLogs.LogGroup(
        this,
        `fn-${lambdaDefinition.name}-${method}-log-group`,
        {
          logGroupName: `/aws/lambda/${context.appName}-${lambdaDefinition.name}-${method}-${context.environment}`,
          retention: cwLogs.RetentionDays.ONE_MONTH,
          removalPolicy: RemovalPolicy.DESTROY,
        }
      );
    });
  }
}
