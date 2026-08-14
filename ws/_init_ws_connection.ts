import { Credentials } from "../http/_kucoin_headers.ts";
import { apply_connect_token } from "../http/apply_connect_token.ts";
import { __handle_one_message } from "./__handle_one_message.ts";

export async function _init_ws_connection(options: {
  credentials?: Credentials;
}) {
  const { credentials } = options;
  const {
    data: { instanceServers, token },
  } = await apply_connect_token(credentials);
  const { endpoint, pingInterval, pingTimeout } = instanceServers[0];
  const ws = new WebSocket(`${endpoint}?token=${token}`);
  await __handle_one_message<{ type: string }>(ws, {
    predicat: (d) => d.type === "welcome",
    strict_next_only: true,
  });

  return {
    ws,
    pingInterval,
    pingTimeout,
  };
}
