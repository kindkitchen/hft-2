import { Credentials } from "../http/util.kucoin_headers.http.ts";
import { online_websocket } from "./util.online_websocket.ws.ts";
import { start_websocket } from "./util.start_websocket.ws.ts";
import { subscribers_manager } from "./util.subscribers_manager.ws.ts";

export async function use_ws(credentials?: Credentials) {
  if (credentials) {
    throw "though it is almost the same as public, some nuances should be worked out completly";
  }

  const { pingInterval, pingTimeout, ws } = await start_websocket({});
  const { subscribers, state_topic_symbols_set, subscribe } =
    subscribers_manager(ws);
  online_websocket(
    ws,
    subscribers,
    {
      pingInterval,
      pingTimeout,
    },
    () => {
      console.warn("GAME OVER!");
    },
  );

  return {
    subscribe,
  };
}
