import { client } from "../../generated/client";
import { readFileSync } from "node:fs";
import { writeFileSync } from "fs";
import { startDeviceCodeFlow } from "./flows/device-flow";
import { startResourceOwnerPasswordCredentialsFlow } from "./flows/resource-flow";

const TOKEN_FILE = "tmp/.token";

export async function authMiddleware(argv: {
  "auth-url"?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
}) {
  if (argv["auth-url"]) {
    if (!argv.clientId) {
      throw new Error("Missing required arguments for authentication");
    }

    const token = await retrieveAndStoreToken(
      argv["auth-url"],
      argv.clientId,
      argv.clientSecret,
      argv.scope,
    );

    client.interceptors.request.use((request) => {
      request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    });
  }
}

const retrieveAndStoreToken = async (
  authUrl: string,
  clientId: string,
  clientSecret?: string,
  scope?: string,
) => {
  const savedToken = getSavedToken();
  if (savedToken) {
    return savedToken.accessToken;
  }
  const { access_token: token, expires_in: expiresIn } = clientSecret
    ? await startResourceOwnerPasswordCredentialsFlow(
        authUrl,
        clientId,
        clientSecret,
        scope,
      )
    : await startDeviceCodeFlow(authUrl, clientId, scope);

  saveToken(token, expiresIn);
  return token;
};

const getSavedToken = () => {
  try {
    const tokenFile = readFileSync(TOKEN_FILE, "utf-8");
    const token = JSON.parse(tokenFile) as {
      accessToken: string;
      expirationTimestamp: number;
    };
    const currentTimestamp = Date.now();
    if (currentTimestamp < token.expirationTimestamp) {
      return token;
    } else {
      console.log("Token expired.");
      return null;
    }
  } catch {
    console.log("No token found.");
    return null;
  }
};

const saveToken = (token: string, expiresIn: number) => {
  const expirationTimestamp = calculateExpirationTimestamp(expiresIn);
  const tokenFile = JSON.stringify({ accessToken: token, expirationTimestamp });
  writeFileSync(TOKEN_FILE, tokenFile);
};

function calculateExpirationTimestamp(expiresIn: number): number {
  const currentTimestamp = Date.now();
  return currentTimestamp + expiresIn * 1000;
}
