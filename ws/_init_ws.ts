import { Credentials } from "../http/_kucoin_headers.ts";
import { apply_connect_token } from "../http/apply_connect_token.ts";
import { handle_one_message } from "./__handle_one_message.ts";
import { ping } from "./__ping.ts";

export async function _init_ws(
  options: { credentials?: Credentials; on_game_over: () => void },
) {
  const { credentials, on_game_over } = options;
  const {
    data: { instanceServers, token },
  } = await apply_connect_token(credentials);
  const { endpoint, pingInterval, pingTimeout } = instanceServers[0];
  const ws = new WebSocket(`${endpoint}?token=${token}`);
  await handle_one_message<{ type: string }>(ws, {
    predicat: (d) => d.type === "welcome",
    strict_next_only: true,
  });
  const on_pong = ping(ws, { pingInterval, pingTimeout }, on_game_over);

  return {
    ws,
    on_pong,
  };
}
