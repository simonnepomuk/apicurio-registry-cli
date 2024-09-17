import {readFileSync, writeFileSync} from "node:fs";

import {client} from "../generated/client/index.js";
import {startDeviceCodeFlow} from "./flows/device-flow.js";
import {startResourceOwnerPasswordCredentialsFlow} from "./flows/resource-flow.js";

const TOKEN_FILE = "tmp/.token";

type AuthenticationParams = {
    authUrl: string;
    clientId: string;
    clientSecret?: string;
    scope?: string;
};

interface SavedToken {
    accessToken: string;
    expirationTimestamp: number;
}

export async function authenticate(authenticationParams: AuthenticationParams) {
    const {accessToken, expirationTimestamp} = await retrieveToken(authenticationParams);

    saveToken({accessToken, expirationTimestamp});

    client.interceptors.request.use((request) => {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
        return request;
    });
}

async function retrieveToken({authUrl, clientId, clientSecret, scope}: AuthenticationParams): Promise<SavedToken> {
    const savedToken = getSavedToken();
    if (savedToken) {
        return savedToken;
    }

    const {access_token: accessToken, expires_in: expiresIn} = clientSecret
        ? await startResourceOwnerPasswordCredentialsFlow(
            authUrl,
            clientId,
            clientSecret,
            scope,
        )
        : await startDeviceCodeFlow(authUrl, clientId, scope);

    return {accessToken, expirationTimestamp: calculateExpirationTimestamp(expiresIn)};
}

function getSavedToken(): SavedToken | null {
    try {
        const tokenFile = readFileSync(TOKEN_FILE, "utf8");
        const token = JSON.parse(tokenFile) as {
            accessToken: string;
            expirationTimestamp: number;
        };
        const currentTimestamp = Date.now();
        if (currentTimestamp < token.expirationTimestamp) {
            return token;
        }

        console.log("Saved token expired.");
        return null;

    } catch {
        console.log("No token found.");
        return null;
    }
}

function saveToken({accessToken, expirationTimestamp}: SavedToken) {
    const tokenFile = JSON.stringify({accessToken, expirationTimestamp});
    writeFileSync(TOKEN_FILE, tokenFile);
}

function calculateExpirationTimestamp(expiresIn: number): number {
    const currentTimestamp = Date.now();
    return currentTimestamp + expiresIn * 1000;
}
