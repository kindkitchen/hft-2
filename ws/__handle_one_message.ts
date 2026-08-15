export function __handle_one_message<D>(
  ws: WebSocket,
  { predicat, strict_next_only }: {
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
    ws.removeEventListener("message", cb);
  };

  ws.addEventListener("message", cb);

  return promise;
}
