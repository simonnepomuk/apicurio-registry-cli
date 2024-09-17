export type GetDeviceCodeResponse = {
    device_code: string;
    expires_in: number;
    interval: number;
    user_code: string;
    verification_uri: string;
    verification_uri_complete: string;
};

export type GetTokenResponse = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
};

export type TokenResponse = Pick<GetTokenResponse, "access_token" | "expires_in">;
