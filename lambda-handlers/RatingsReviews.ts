import {
    Handler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import container from '/opt/node-utils/src/container';
import { TYPES } from '/opt/node-utils/src/types';
import { validateInput } from '/opt/node-utils/src/utils/ValidationUtils';
import {
    successResponse,
    failureResponse,
} from '/opt/node-utils/src/utils/ResponseUtils';
import { IRatingsReviewsService } from '/opt/node-utils/src/interfaces/services/IRatingsReviewsService';
import { editRatingsReviews, saveRatingsReviews } from '/opt/node-utils/src/dto/RatingsReview';
import { editRatings, editReviews, saveRatings, saveReviews } from '/opt/node-utils/src/validation-schema/RatingsReviewSchema';

// Function to handle PUT request
const handlePutRequest = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        //console.log(`Lambda handler "${event.path}" started`);

        // Parse the incoming request body as JSON
        event.body = JSON.parse(event.body || '{}');
        const body: any = event.body || {};
        if (body.type === 'rating') {
            const value = validateInputAndRespond('rating', editRatings, body);
            // Use the 'value' as needed for rating processing
        } else if (body.type === 'review') {
            const value = validateInputAndRespond('review', editReviews, body);
            // Use the 'value' as needed for review processing
        }
        function validateInputAndRespond(type: string, schema: any, body: any) {
            // Validate input against a schema using the ValidationUtils
            const { error, value } = validateInput(schema, body);
            if (error) {
                return failureResponse(400, error.details[0].message.replace(/"/g, ''));
            }
            return value;
        }

        // Retrieve an instance of IRatingsReviewsService from the container
        const _ratingsreviewsService = container.get<IRatingsReviewsService>(
            TYPES.IRatingsReviewsService
        );

        // Prepare a CreateUserProfileRequest payload from the request body
        const editPayload: editRatingsReviews = body;

        // Call the createUserProfile method of the user service
        const response = await _ratingsreviewsService.editRatingsAndReviews(editPayload, event);

        // Return a success response with the response data
        return successResponse(response, 'updated Successfully');
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};

//HANDLER GET REQUEST
const handleGetRequest = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const id: string | undefined = event.queryStringParameters?.id;

        if (!id) {
            // If stateId is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing id in query parameters');
        }
        const type: string | undefined = event.queryStringParameters?.type;
        if (!type) {
            // If stateId is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing type in query parameters');
        }

        // Retrieve an instance of IRatingsReviewsService from the container
        const _ratingsreviewsService = container.get<IRatingsReviewsService>(
            TYPES.IRatingsReviewsService
        );

        // Call the createUserProfile method of the user service
        const response = await _ratingsreviewsService.getRatingsAndReviewsById(id, event, type);

        // Return a success response with the response data
        return successResponse(response, 'ratings and reviews');
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};

//HANDLER DELETE REQUEST
const handleDeleteRequest = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const id: string | undefined = event.queryStringParameters?.id;

        if (!id) {
            // If stateId is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing id in query parameters');
        }
        const type: string | undefined = event.queryStringParameters?.type;
        if (!type) {
            // If stateId is not provided in the query parameters, throw an error
            return failureResponse(400, 'Missing type in query parameters');
        }

        // Retrieve an instance of IRatingsReviewsService from the container
        const _ratingsreviewsService = container.get<IRatingsReviewsService>(
            TYPES.IRatingsReviewsService
        );

        // Call the createUserProfile method of the user service
        const response = await _ratingsreviewsService.deleteRatingsAndReviews(id, event, type);

        // Return a success response with the response data
        return successResponse(response, 'deleted successfully');
    } catch (err) {
        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};

const handlePostRatingsReview = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the incoming request body as JSON
        event.body = JSON.parse(event.body || '{}');
        const body: any = event.body || {};
        if (body.type === 'rating') {
            const { error, value } = validateInput(saveRatings, body);
            if (error) {
                return failureResponse(400, error.details[0].message.replace(/"/g, ''));
            }
            // const value = validateInputAndRespond('rating', saveRatings, body);
            // Use the 'value' as needed for rating processing
        } else if (body.type === 'review') {
            const { error, value } = validateInput(saveReviews, body);
            if (error) {
                return failureResponse(400, error.details[0].message.replace(/"/g, ''));
            }
            // const value = validateInputAndRespond('review', saveReviews, body);
            // Use the 'value' as needed for review processing
        }
        // function validateInputAndRespond(type: string, schema: any, body: any) {
        //     // Validate input against a schema using the ValidationUtils
        //     const { error, value } = validateInput(schema, body);
        //     if (error) {
        //         console.log("iisue");

        //         return failureResponse(400, error.details[0].message.replace(/"/g, ''));
        //     }
        //     return value;
        // }
        // Retrieve an instance of IRatingsReviewsService from the container
        const _ratingsService = container.get<IRatingsReviewsService>(
            TYPES.IRatingsReviewsService
        );

        // Prepare a CreateUserProfileRequest payload from the request body
        const createPayload: saveRatingsReviews = body;

        // Call the createUserProfile method of the user service
        const response = await _ratingsService.postRatingsAndReviews(
            createPayload,
            event,
        );
        // Return a success response with the response data
        return successResponse(
            response,
            'created Successfully'
        );
    } catch (err) {
        console.log(err);

        // If an error occurs, handle it and return an appropriate failure response
        return failureResponse(err.httpCode, err.message);
    }
};

// Main Lambda function handler
export const handler: Handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod === 'POST') {
        return handlePostRatingsReview(event);
    } else if (event.httpMethod == 'PUT') {
        return handlePutRequest(event);
    } else if (event.httpMethod == 'GET') {
        return handleGetRequest(event);
    } else if (event.httpMethod == 'PATCH') {
        return handleDeleteRequest(event);
    } else {
        // Default response for other HTTP methods
        return failureResponse(400, 'Bad request: Undefined method');
    }
};
