import { Credentials } from "../http/_kucoin_headers.ts";
import { __ping } from "./__ping.ts";
import { _init_ws_connection } from "./_init_ws_connection.ts";
import { _ws_online } from "./_ws_online.ts";
import { _subscribers_manager } from "./_subscribers_manager.ts";

export async function make_ws(credentials?: Credentials) {
  if (credentials) {
    throw "though it is almost the same as public, some nuances should be worked out completly";
  }

  const {
    pingInterval,
    pingTimeout,
    ws,
  } = await _init_ws_connection({});
  const {
    _subscribers,
    _state_topic_symbols_set,
    subscribe,
  } = _subscribers_manager(ws);
  _ws_online(_subscribers, {
    ws,
    pingInterval,
    pingTimeout,
  }, () => {
    console.warn("GAME OVER!");
  });

  return {
    subscribe,
  };
}
