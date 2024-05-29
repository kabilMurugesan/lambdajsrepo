import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import {
  failureResponse,
  successResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IJobListService } from '/opt/node-utils/src/interfaces/services/IJobListService';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';

// Function to handle PUT request
const handleGet = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let body: any = '';
  const type: string | undefined = event.queryStringParameters?.type;
  if (!type) {
    return failureResponse(400, 'Missing type in query parameters');
  } else if (type === 'terms') {
    body = await getTerms();
  } else if (type === 'privacy') {
    body = await getPrivacy();
  }
  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html',
      // Required for CORS support to work
      'Access-Control-Allow-Origin': '*',
      // Required for cookies, authorization headers with HTTPS
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE,PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      // "Content-Type, Authorization, Content-Length, Transfer-Encoding",
    },
    body,
  };
};

const stripeWebhookEvents = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the incoming request body as JSON
    event.body = JSON.parse(event.body || '{}');
    const webhookResponse: any = event.body || {};

    console.log('Stripe Webhook Events: ', webhookResponse);

    console.log('Stripe Webhook Events: ', webhookResponse.data);
    console.log('Stripe Webhook Events: ', webhookResponse.data.object.id);
    console.log(
      'Stripe Webhook Events: ',
      webhookResponse.data.object.metadata
    );
    console.log(
      'Stripe Webhook Events: ',
      webhookResponse.data.object.metadata.jobId
    );
    console.log(
      'Stripe Webhook Events: ',
      webhookResponse.data.object.billing_details
    );
    console.log(
      'Stripe Webhook Events: ',
      webhookResponse.data.object.payment_method_details
    );

    const _jobListService = container.get<IJobListService>(
      TYPES.IJobListService
    );
    const response = await _jobListService.updatePaymentWebhookDetails(
      webhookResponse
    );

    // Return a success response with the response data
    return successResponse(response, 'Stripe Webhook Events');
  } catch (err) {
    // If an error occurs, handle it and return an appropriate failure response
    return failureResponse(err.httpCode, err.message);
  }
};

// Main Lambda function handler
export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'GET') {
    return handleGet(event);
  }
  if (event.httpMethod === 'POST') {
    return stripeWebhookEvents(event);
  }
  // Default response for other HTTP methods
  return failureResponse(400, 'Bad request: Undefined method');
};

async function getTerms() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terms of Service</title><style>body{font-family:Arial,sans-serif;line-height:1.6;margin:20px}h1{text-align:center}h2,strong{color:#333}li,p{color:#666}.subheading-list{list-style-type:lower-alpha;padding-left:20px}.subheading-list li::marker{font-size:1rem!important;color:#333!important;font-weight:700!important}.heading-list{list-style-type:decimal}.heading-list li::marker{font-size:1.5rem;color:#333;font-weight:700}.footer{margin:30px 0 40px 0;color:#888;text-align:center}</style></head><body><h1>Terms of Service</h1><p><strong>Last Updated:</strong>January 1, 2024</p><p>Welcome to Fido Security Marketplace App ("Fido Security" or "App"). The following Terms of Service ("Terms") outline the legal agreement between Fido Security and its users. By accessing or using the Fido Security App, you agree to comply with and be bound by these Terms. Please read them carefully before using the App.</p><ol class="heading-list"><li><h2>Acceptance of Terms</h2><p>By using the Fido Security App, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. If you do not agree with any part of these Terms, you may not use the App.</p></li><li><h2>Description of Service</h2><p>Fido Security is a marketplace app that enables law enforcement officers and private security guards in Alabama to create profiles and allows companies and individuals to create profiles, search for, and hire available guards based on selected criteria.</p></li><li><h2>Eligibility</h2><p>You must be at least 19 years old and have the legal capacity to enter into agreements to use the Fido Security App. In addition, you must either be an APOST certified sworn law enforcement officer, or a private security guard licensed by the Alabama Security Regulatory Board and in compliance with all applicable laws and regulations for such licensing. By using the App, you represent and warrant that you meet these eligibility requirements.</p></li><li><h2>User Accounts</h2><ol class="subheading-list"><li><strong>User Registration:</strong>To use certain features of the App, you must register and create a user account. You agree to provide accurate and complete information during the registration process.</li><li><strong>Security:</strong>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify Fido Security immediately of any unauthorized use of your account or any other breach of security.</li></ol></li><li><h2>User Profiles</h2><ol class="subheading-list"><li><strong>Accuracy:</strong>Users are responsible for ensuring the accuracy of the information provided in their profiles. Fido Security is not responsible for any inaccuracies in user profiles.</li><li><strong>Verification:</strong>Fido Security may, at its discretion, implement a verification process to confirm the identity and credentials of law enforcement officers and private security guards.</li></ol></li><li><h2>Use of the App</h2><ol class="subheading-list"><li><strong>Lawful Purpose:</strong>Users agree to use the Fido Security App for lawful purposes only. Users shall not engage in any activity that violates applicable laws or regulations.</li><li><strong>Prohibited Content:</strong>Users shall not post, upload, or share any content that is illegal, offensive, fraudulent, or violates the rights of others.</li></ol></li><li><h2>Transactions and Fees</h2><ol class="subheading-list"><li><strong>Transaction Responsibility:</strong>Fido Security is not involved in the transactions between users. Users are solely responsible for any transactions conducted through the App.</li><li><strong>Fees:</strong>Fido Security may charge fees for certain services provided through the App. Users will be notified of any applicable fees before using such services.</li></ol></li><li><h2>Termination of Service</h2><p>Fido Security reserves the right to suspend or terminate the App or any users access at any time for any reason, including, but not limited to, violation of these Terms.</p></li><li><h2>Changes to Terms</h2><p>Fido Security reserves the right to modify or update these Terms at any time. Users will be notified of changes, and continued use of the App after modifications constitutes acceptance of the updated Terms.</p></li><li><h2>Disclaimer of Warranties</h2><p>The Fido Security App is provided "as is" without warranties of any kind. Fido Security makes no warranties, express or implied, regarding the accuracy, reliability, or availability of the App.</p></li><li><h2>Limitation of Liability</h2><p>Fido Security shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of the App.</p></li><li><h2>Governing Law</h2><p>These Terms shall be governed by and construed in accordance with the laws of the state of Alabama.</p></li><li><h2>Contact Information</h2><p>If you have any questions or concerns about these Terms, please contact us at <a href="mailto:admin@fidosecurity.com">admin@fidosecurity.com</a>.</p><p>By using the Fido Security App, you acknowledge that you have read, understood, and agree to abide by these Terms of Service.</p></li></ol><div class="footer"><p>Fido Security Marketplace App - &copy; 2024</p></div></body></html>`;
}

async function getPrivacy() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy Policy</title><style>body{font-family:Arial,sans-serif;line-height:1.6;margin:20px}h1{text-align:center}h2,strong{color:#333}li,p{color:#666}.subheading-list{list-style-type:square!important;padding-left:20px}.subheading-list li::marker{font-size:1.25rem!important;color:#333!important;font-weight:700!important}.heading-list{list-style-type:decimal}.heading-list li::marker{font-size:1.5rem;color:#333;font-weight:700}.footer{margin:30px 0 40px 0;color:#888;text-align:center}</style></head><body><h1>Privacy Policy</h1><p><strong>Effective Date:</strong>January 1, 2024</p><p>Welcome to the Fido Security Mobile App ("we," "us," or "our"). This Privacy Policy is designed to help you understand how we collect, use, share, and safeguard your personal information when you use our marketplace app and services. By accessing or using the Fido Security Mobile App, you agree to the terms of this Privacy Policy.</p><ol class="heading-list"><li><h2>Information We Collect:</h2><p>We collect both personal and non-personal information to provide and improve our services. The types of information we collect may include:</p><ul class="subheading-list"><li><strong>Personal Information:</strong><ul class="subheading-list"><li>Your name, contact information, and address.</li><li>Your profile information, including a photograph and professional qualifications.</li><li>Payment information for transaction processing.</li></ul></li><li><strong>Non-Personal Information:</strong><ul class="subheading-list"><li>Aggregated and anonymized data regarding app usage patterns.</li><li>Device information, including hardware model, operating system, and unique device identifiers.</li><li>Log information, such as your IP address, browser type, and access times.</li></ul></li></ul></li><li><h2>How We Use Your Information:</h2><p>We use the information collected for various purposes, including but not limited to:</p><ul class="subheading-list"><li><strong>Service Provision:</strong><ul class="subheading-list"><li>Facilitating the connection between security guards and companies seeking security services.</li><li>Processing transactions and providing customer support.</li></ul></li><li><strong>Communication:</strong><ul class="subheading-list"><li>Sending important notices, such as updates, security alerts, and administrative messages.</li><li>Responding to inquiries and providing support.</li></ul></li><li><strong>Improving and Personalizing Services:</strong><ul class="subheading-list"><li>Analyzing usage patterns to enhance the functionality and user experience of our app.</li><li>Customizing content and recommendations based on user preferences.</li></ul></li></ul></li><li><h2>Information Sharing:</h2><p>We may share your information under the following circumstances:</p><ul class="subheading-list"><li><strong>With Security Service Customers:</strong><ul class="subheading-list"><li>Sharing your profile information with companies and individuals seeking security services.</li></ul></li><li><strong>With Third-Party Service Providers:</strong><ul class="subheading-list"><li>Utilizing third-party services for payment processing, analytics, and other support functions.</li></ul></li><li><strong>Legal Compliance:</strong><ul class="subheading-list"><li>Complying with applicable laws, regulations, or legal processes.</li></ul></li><li><strong>Business Transactions:</strong><ul class="subheading-list"><li>Sharing information in connection with a merger, acquisition, or sale of all or a portion of our assets.</li></ul></li></ul></li><li><h2>Your Choices:</h2><p>You can control certain aspects of your information:</p><ul class="subheading-list"><li><strong>Profile Information:</strong><ul class="subheading-list"><li>You can update or delete your profile information at any time.</li></ul></li><li><strong>Marketing Communications:</strong><ul class="subheading-list"><li>You can opt-out of receiving promotional emails by following the instructions in those emails.</li></ul></li></ul></li><li><h2>Security:</h2><p>We implement reasonable security measures to protect your information from unauthorized access, disclosure, alteration, or destruction.</p></li><li><h2>Children's Privacy:</h2><p>Our services are not directed at individuals under the age of 18. If we become aware that personal information of a child has been collected without parental consent, we will take steps to delete such information.</p></li><li><h2>Changes to this Privacy Policy:</h2><p>We may update this Privacy Policy to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes through the app or other means.</p></li><li><h2>Contact Us:</h2><p>If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:admin@fidosecurity.com">admin@fidosecurity.com</a>.</p><p>Thank you for using the Fido Security Mobile App!</p></li></ol><div class="footer"><p>Privacy Policy for Fido Security Mobile App - &copy; 2024</p></div></body></html>`;
}
