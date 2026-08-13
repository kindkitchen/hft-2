let ws: WebSocket;
const subscribers = new Map<string, ((data: string) => void)[]>();

async function ku_ws_public(symbols: string[], logic: (sData: string) => void) {
  const handle_one_message = (msg_contains: string, next_only = true) => {
    const { promise, reject, resolve } = Promise.withResolvers();
    const cb = function (this: WebSocket, ev: MessageEvent<string>) {
      if (!ev.data.includes(msg_contains)) {
        next_only && reject(`if (!ev.data.includes(${msg_contains}")`);
        return;
      }
      resolve(undefined as void);
      ws.removeEventListener("message", cb);
    };
    ws.addEventListener("message", cb);

    return promise;
  };
  if (!ws) {
    const { data: { instanceServers, token } } = await apply_public_token();
    const { endpoint, pingInterval, pingTimeout } = instanceServers[0];
    ws = new WebSocket(`${endpoint}?token=${token}`);
    await handle_one_message("welcome");
    ws.addEventListener("message", (ev: MessageEvent<string>) => {
      if (ev.data.includes("ack")) {
        return;
      }
      let pair;
      for (const k of subscribers.keys()) {
        if (ev.data.includes(k)) {
          pair = k;
          break;
        }
      }
      if (!pair) {
        throw `Unexpected data <<<${ev.data}>>> for matching any from <<<${subscribers.keys()}>>>`;
      }
      for (const subscriber of subscribers.get(pair)!) {
        subscriber(ev.data);
      }
    });
  }
  for (const pair of symbols) {
    const logics = subscribers.get(pair) ||
      subscribers.set(pair, []).get(pair)!;
    logics.push(logic);
  }
  ws.send(JSON.stringify({
    id: Date.now().toLocaleString(),
    type: "subscribe",
    privateChannel: false,
    topic: `/market/level2:${symbols.join()}`,
    response: true,
  }));
  await handle_one_message("ack", false);
}

export async function level2_subscriber() {
}

/**
 * @description
 * https://www.kucoin.com/docs/websocket/basic-info/apply-connect-token/public-token-no-authentication-required-
 */
async function apply_public_token() {
  const res = await fetch("https://api.kucoin.com/api/v1/bullet-public", {
    method: "POST",
  });
  const jData = await res.json() as ApiResponse;

  return jData;
}

interface ApiResponse {
  code: string;
  data: {
    token: string;
    instanceServers: {
      endpoint: string;
      encrypt: boolean;
      protocol: string;
      pingInterval: number;
      pingTimeout: number;
    }[];
  };
}

if (import.meta.main) {
  await ku_ws_public(["BTC-USDT"], console.log);
}
