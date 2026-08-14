import { __ping } from "./__ping.ts";

export function _ws_online(
  subscribers: Map<
    string, /// subject + topic
    {
      is_raw_data_expected: boolean;
      on_data: (data: object | string) => void;
      on_game_over?: () => void;
    }[]
  >,
  {
    ws,
    pingInterval,
    pingTimeout,
    on_game_over,
  }: {
    on_game_over: () => void;
    ws: WebSocket;
    pingInterval: number;
    pingTimeout: number;
  },
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

    const group: string = j_data.subject + j_data.topic;

    for (const subscriber of subscribers.get(group) || []) {
      if (subscriber.is_raw_data_expected) {
        subscriber.on_data(raw_data);
      } else {
        subscriber.on_data(j_data);
      }
    }
  });

  return {
    ws,
  };
}
