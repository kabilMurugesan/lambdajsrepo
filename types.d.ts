export type CDKContext = {
  appName: string;
  region: string;
  environment: string;
  branchName: string;
  accountNumber: string;
  vpc: {
    id: string;
    cidr: string;
    privateSubnetIds: string[];
    routeTableId: string;
  };
  db_host: string;
  db_port: number;
  db_username: string;
  db_password: string;
  db_name: string;
  stageName: string;
  iamrole: string;
  availabilityZones: string[];
  securityGroupId: string;
  apiBaseUrl: string;
  homePageUrl: string;
};

export type LambdaDefinition = {
  name: string;
  memoryMB?: number;
  timeoutSecs?: number;
  environment?: {
    [key: string]: string;
  };
  isPrivate?: boolean;
};
