import open from "open";

import {
    GetDeviceCodeResponse,
    GetTokenResponse,
    TokenResponse,
} from "../types.js";

export const startDeviceCodeFlow = async (
    url: string,
    clientId: string,
    scope?: string,
): Promise<TokenResponse> => {
    const {device_code: deviceCode, verification_uri_complete: verificationUriComplete} = await getDeviceCode(
        url,
        clientId,
        scope,
    );
    console.log(`Opening ${verificationUriComplete}`);
    await open(verificationUriComplete);
    console.log(`Waiting for device to be authorized...`);

    return pollForToken(url, clientId, deviceCode);
};

async function getDeviceCode(
    baseUrl: string,
    clientId: string,
    scope?: string,
): Promise<GetDeviceCodeResponse> {
    const deviceCodeEndpoint = `${baseUrl}/auth/device`;
    const scopeParam = scope ?? {};
    const response = await fetch(deviceCodeEndpoint, {
        body: new URLSearchParams({
            // eslint-disable-next-line camelcase
            client_id: clientId,
            ...scopeParam,
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
    });
    if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
    }

    return response.json();
}

async function pollForToken(
    baseUrl: string,
    clientId: string,
    deviceCode: string,
): Promise<GetTokenResponse> {
    let interval = 5;
    let retries = 0;
    while (retries < 30) {
        // eslint-disable-next-line no-await-in-loop
        const response = await fetch(`${baseUrl}/token`, {
            body: new URLSearchParams({
                // eslint-disable-next-line camelcase
                client_id: clientId,
                // eslint-disable-next-line camelcase
                device_code: deviceCode,
                // eslint-disable-next-line camelcase
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
        });
        if (response.ok) {
            return response.json();
        }

        const error: { error: string; error_description: string } =
            // eslint-disable-next-line no-await-in-loop
            await response.json();
        console.log(`${error.error_description}`);
        retries++;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
            setTimeout(resolve, interval * 1000)
        });
        interval *= 2;

    }

    throw new Error("Failed to authenticate");
}
