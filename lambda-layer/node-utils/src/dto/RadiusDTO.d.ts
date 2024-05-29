export interface AddRadiusRequest {
    values: Array<{
        type: string;
        value: string;
    }>;
}

export interface editRadiusRequest {
    type: string;
    value: string;
    id: any
}