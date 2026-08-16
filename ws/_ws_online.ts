import { __ping } from "./__ping.ts";
import { _subscribers_manager } from "./_subscribers_manager.ts";

export function _ws_online(
  _subscribers: ReturnType<typeof _subscribers_manager>["_subscribers"],
  {
    ws,
    pingInterval,
    pingTimeout,
  }: {
    ws: WebSocket;
    pingInterval: number;
    pingTimeout: number;
  },
  on_game_over: () => void,
) {
  const pong = __ping(ws, { pingInterval, pingTimeout }, on_game_over);

  ws.addEventListener("message", (ev) => {
    const raw_data = ev.data;
    const j_data = JSON.parse(raw_data);

    if (j_data.type !== "message") {
      if (j_data.type === "pong") {
        pong(j_data);
      }

      return;
    }

    /// ...WORKER
    for (const s of _subscribers.get(j_data.topic) || []) {
      if (s.is_parsed_data_expected) {
        s.on_data(j_data);
      } else {
        s.on_data(raw_data);
      }
    }
    /// WORKER...
  });
}
