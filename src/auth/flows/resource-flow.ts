import { TokenResponse } from "../types.js";

export async function startResourceOwnerPasswordCredentialsFlow(
  authUrl: string,
  clientId: string,
  clientSecret: string,
  scope?: string,
): Promise<TokenResponse> {
  const scopeParam = scope ?? {};
  const response = await fetch(`${authUrl}/token`, {
    body: new URLSearchParams({
      // eslint-disable-next-line camelcase
      client_id: clientId,
      // eslint-disable-next-line camelcase
      client_secret: clientSecret,
      // eslint-disable-next-line camelcase
      grant_type: "client_credentials",
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
