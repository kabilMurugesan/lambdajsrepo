export interface AdminApproveRequest {
    userId: string;
    status: string;
    certificateType: string;
}

export interface AdminDeleteUserRequest {
    userId: string;
    status: string;
}