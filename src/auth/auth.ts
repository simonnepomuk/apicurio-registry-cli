/* eslint-disable camelcase */

import {readFileSync, writeFileSync} from "node:fs";
import open from "open";
import {Issuer} from "openid-client";

import {client} from "../generated/client/index.js";
import {ensureDirectoryExistence} from "../utils/fs.js";

const TOKEN_FILE_PATH = "tmp/.token";

type AuthenticationParams = {
    authUrl: string;
    clientId: string;
    clientSecret?: string;
    scopes?: string[];
};

interface SavedToken {
    accessToken: string;
    expirationTimestamp: number;
}

export async function authenticate(authenticationParams: AuthenticationParams) {
    const {accessToken, expirationTimestamp} = getSavedToken() ?? await retrieveToken(authenticationParams);

    saveToken({accessToken, expirationTimestamp});

    client.interceptors.request.use((request) => {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
        return request;
    });
}

async function retrieveToken({authUrl, clientId, clientSecret, scopes}: AuthenticationParams): Promise<SavedToken> {
    const issuer = await Issuer.discover(authUrl);

    const {access_token: accessToken, expires_in: expiresIn} = clientSecret
        ? await useClientCredentialsFlow(issuer, clientId, clientSecret, scopes)
        : await useDeviceAuthorizationGrandFlow(issuer, clientId, scopes);

    if (!accessToken || !expiresIn) {
        throw new Error("Failed to retrieve token.");
    }

    return {accessToken, expirationTimestamp: calculateExpirationTimestamp(expiresIn)};
}

function getSavedToken(): SavedToken | null {
    try {
        const tokenFile = readFileSync(TOKEN_FILE_PATH, "utf8");
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
        return null;
    }
}

async function useClientCredentialsFlow(issuer: Issuer, clientId: string, clientSecret: string, scopes?: string[]) {
    return new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
    }).grant({
        grant_type: "client_credentials",
        scope: scopes?.join(" "),
    });
}

async function useDeviceAuthorizationGrandFlow(issuer: Issuer, clientId: string, scopes?: string[]) {
    const client = new issuer.Client({
        client_id: clientId,
        token_endpoint_auth_method: "none"
    })

    const handle = await client.deviceAuthorization({
        scope: scopes?.join(" "),
    });
    console.log("You're being redirected to the browser to authorize the application.");
    console.log("If the browser doesn't open automatically, please open the following URL:");
    console.log(handle.verification_uri_complete);

    await open(handle.verification_uri_complete);

    return handle.poll();
}


function saveToken({accessToken, expirationTimestamp}: SavedToken) {
    const tokenFile = JSON.stringify({accessToken, expirationTimestamp});
    ensureDirectoryExistence(TOKEN_FILE_PATH);
    writeFileSync(TOKEN_FILE_PATH, tokenFile);
}

function calculateExpirationTimestamp(expiresIn: number): number {
    const currentTimestamp = Date.now();
    return currentTimestamp + expiresIn * 1000;
}
