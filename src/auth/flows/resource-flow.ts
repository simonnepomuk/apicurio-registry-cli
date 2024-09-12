export async function startResourceOwnerPasswordCredentialsFlow(
  authUrl: string,
  clientId: string,
  clientSecret: string,
  scope?: string,
) {
  const scopeParam = scope ?? {};
  const response = await fetch(`${authUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      ...scopeParam,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate: ${response.statusText}`);
  }

  const { access_token: token } = await response.json();
  return token;
}
