import { Credentials } from "../http/util.kucoin_headers.http.ts";
import { apply_connect_token } from "../http/apply_connect_token.http.ts";
import { handle_one_message } from "./helper.handle_one_message.ws.ts";

export async function start_websocket(options: {
  credentials?: Credentials;
}) {
  const { credentials } = options;
  const {
    data: { instanceServers, token },
  } = await apply_connect_token(credentials);
  const { endpoint, pingInterval, pingTimeout } = instanceServers[0];
  const instance = new WebSocket(`${endpoint}?token=${token}`);
  const ws = {
    instance,
  };
  await handle_one_message<{ type: string }>(ws, {
    predicat: (d) => d.type === "welcome",
    strict_next_only: true,
  });

  return {
    ws,
    pingInterval,
    pingTimeout,
  };
}
