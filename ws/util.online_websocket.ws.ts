import { subscribers_manager } from "./util.subscribers_manager.ws.ts";
import { Ws } from "./types.ws.ts";
import { ping_pong } from "./helper.ping-pong.ws.ts";

export function online_websocket(
  ws: Ws,
  subscribers: ReturnType<typeof subscribers_manager>["subscribers"],
  {
    pingInterval,
    pingTimeout,
  }: {
    pingInterval: number;
    pingTimeout: number;
  },
  on_game_over: () => void,
  configuration?: { add_new_line_to_raw?: boolean },
) {
  const { add_new_line_to_raw = true } = configuration || {};
  const { pong } = ping_pong(ws, { pingInterval, pingTimeout }, on_game_over);

  ws.instance.addEventListener("message", (ev) => {
    const raw_data = ev.data;
    const j_data = JSON.parse(raw_data);

    if (j_data.type !== "message") {
      if (j_data.type === "pong") {
        pong(j_data);
      }

      return;
    }

    for (const s of subscribers.get(j_data.topic) || []) {
      if (s.is_parsed_data_expected) {
        s.on_data(j_data);
      } else {
        s.on_data(
          raw_data +
            // This is important! We opinionated about:
            // - each message is one json-string line
            // - only there we add "\n" as delimeter
            "\n",
        );
      }
    }
  });
}
