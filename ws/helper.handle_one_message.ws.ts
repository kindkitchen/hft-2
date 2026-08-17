import { Ws } from "./types.ws.ts";

export function handle_one_message<D>(
  ws: Ws,
  {
    predicat,
    strict_next_only,
  }: {
    predicat: (j_data: D) => boolean;
    strict_next_only?: boolean;
  },
) {
  const { promise, reject, resolve } = Promise.withResolvers();
  const cb = (ev: MessageEvent<string>) => {
    const data = JSON.parse(ev.data);
    if (!predicat(data)) {
      strict_next_only && reject("if (!predicat(data))");
      return;
    }
    resolve(data);
    ws.instance.removeEventListener("message", cb);
  };

  ws.instance.addEventListener("message", cb);

  return promise;
}
