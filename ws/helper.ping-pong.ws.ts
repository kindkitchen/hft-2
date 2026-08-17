import { Ws } from "./types.ws.ts";

export function ping_pong(
  ws: Ws,
  options: { pingInterval: number; pingTimeout: number },
  on_game_over: () => void,
) {
  let last_pong_id: string | null = null;
  let timeout_cleaner: ReturnType<typeof setTimeout> | null;
  const interval_cleaner = setInterval(() => {
    last_pong_id = crypto.randomUUID();
    timeout_cleaner = setTimeout(() => {
      clearInterval(interval_cleaner);
      clearTimeout(timeout_cleaner!);

      on_game_over();
    }, options.pingTimeout);
    ws.instance.send(
      JSON.stringify({
        id: last_pong_id,
        type: "ping",
      }),
    );
  }, options.pingInterval);

  ["close" as const, "error" as const].forEach(() => {
    ws.instance.addEventListener("close", () => {
      timeout_cleaner && clearTimeout(timeout_cleaner);
      clearInterval(interval_cleaner);
    });
  });

  return {
    pong: (pong_message: { type: "pong"; id: string }) => {
      if (pong_message.id === last_pong_id) {
        (timeout_cleaner && clearTimeout(timeout_cleaner)) ||
          (timeout_cleaner = null);
      }
    },
  };
}
