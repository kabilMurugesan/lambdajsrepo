export interface CreateUserSignupRequest {
  email: string;
  guardAccountType: string;
  phone: string;
  userType: string;
  password: string;
  cognitoUserId: string;
}
