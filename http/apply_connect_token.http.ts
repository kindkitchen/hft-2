import { Credentials, kucoin_headers } from "./util.kucoin_headers.http.ts";

/**
 * @description
 * https://www.kucoin.com/docs/websocket/basic-info/apply-connect-token/public-token-no-authentication-required-
 *
 * https://www.kucoin.com/docs/websocket/basic-info/apply-connect-token/private-channels-authentication-request-required-
 */
export async function apply_connect_token(credentials?: Credentials) {
  const host = "https://api.kucoin.com" as const;
  const method = "POST" as const;
  let endpoint;
  let headers;
  if (credentials) {
    endpoint = "/api/v1/bullet-private" as const;
    headers = {
      headers: await kucoin_headers({ endpoint, method }, credentials),
    };
  } else {
    endpoint = "/api/v1/bullet-public" as const;
  }
  const url = `${host}${endpoint}`;

  const res = await fetch(url, {
    method,
    ...headers,
  });
  const jData = await res.json() as ApiResponse;

  return jData;
}

interface ApiResponse {
  code: string;
  data: {
    token: string;
    instanceServers: {
      endpoint: string;
      encrypt: boolean;
      protocol: string;
      pingInterval: number;
      pingTimeout: number;
    }[];
  };
}
