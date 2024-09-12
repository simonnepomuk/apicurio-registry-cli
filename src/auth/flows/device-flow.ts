import open from "open";
import { GetDeviceCodeResponse, GetTokenResponse } from "../types";

export const startDeviceCodeFlow = async (
  url: string,
  clientId: string,
  scope?: string,
) => {
  const { device_code, verification_uri_complete } = await getDeviceCode(
    url,
    clientId,
    scope,
  );
  console.log(`Opening ${verification_uri_complete}`);
  await open(verification_uri_complete);
  console.log(`Waiting for device to be authorized...`);

  const { access_token: token } = await pollForToken(
    url,
    clientId,
    device_code,
  );
  return token;
};

async function getDeviceCode(
  baseUrl: string,
  clientId: string,
  scope?: string,
): Promise<GetDeviceCodeResponse> {
  const deviceCodeEndpoint = `${baseUrl}/auth/device`;
  const scopeParam = scope ?? {};
  const response = await fetch(deviceCodeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      ...scopeParam,
    }),
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
    const response = await fetch(`${baseUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });
    if (!response.ok) {
      const error: { error: string; error_description: string } =
        await response.json();
      console.log(`${error.error_description}`);
      retries++;
      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
      interval *= 2;
    } else {
      return response.json();
    }
  }

  throw new Error("Failed to authenticate");
}
