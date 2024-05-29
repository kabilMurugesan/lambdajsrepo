export const externalConfig = {
  AWS: {
    stsRoleARN:
      process.env.AWS_STS_ROLE_ARN ||
      'arn:aws:iam::747295254459:role/dev-fi-lambda-role',
    stsTokenExpiry: Number(process.env.AWS_STS_TOKEN_EXPIRY) || 3600, // Provide a default token expiry (e.g., 1 hour)
    profileImageFolder:
      process.env.AWS_PROFILE_IMAGE_FOLDER || 'profile_images',
    certificatesFolder: process.env.AWS_CERTIFICATES_FOLDER || 'certificates',
    bucketName: process.env.BUCKET_NAME || 'fido-dev',
    UserPoolId: 'us-east-2_7wOzwBE7v',
  },
  // STRIPE: {
  //   stripeSecretKey:
  //     process.env.STRIPE_SECRET_KEY ||
  //     'sk_test_51ODTpHEyHdeo15o593AisA9N73d6LpiM6s6R7xhcnSCZ8AXWFfdiSDrHu8VHKawkrSkBrmZuVv66XNTWKpf0NmpL00dsf2kJIt',
  // },
  // GOOGLE_API_KEY:
  //   process.env.GOOGLE_API_KEY || 'AIzaSyBYq6wPxv9f2EFlFmeIAFTjwRl5ek7jHTE',
};
