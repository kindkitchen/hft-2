import { apply_connect_token } from "../http/apply_connect_token.ts";
import { handle_one_message } from "./_handle_one_message.ts";

let ws: WebSocket;
const subscribers = new Map<string, ((data: string) => void)[]>();

async function ku_ws_public(symbols: string[], logic: (sData: string) => void) {
  if (!ws) {
    const { data: { instanceServers, token } } = await apply_connect_token();
    const { endpoint, pingInterval, pingTimeout } = instanceServers[0];
    ws = new WebSocket(`${endpoint}?token=${token}`);
    await handle_one_message<{ type: string }>(ws, {
      predicat: (d) => d.type === "welcome",
      strict_next_only: true,
    });
    ws.addEventListener("message", (ev: MessageEvent<string>) => {
      const raw = ev.data;
      const jData = JSON.parse(raw);
      if (jData.type !== "message") {
        return;
      }
      let pair;
      for (const k of subscribers.keys()) {
        if (jData.topic.split(":").pop() === k) {
          pair = k;
          break;
        }
      }
      if (!pair) {
        throw `Unexpected data <<<${jData}>>> for matching any from <<<${subscribers.keys()}>>>`;
      }
      for (const subscriber of subscribers.get(pair)!) {
        subscriber(jData);
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
  await handle_one_message<{ type: string }>(ws, {
    predicat: (d) => d.type === "ack",
    strict_next_only: false,
  });
}

export async function level2_subscriber() {
}

if (import.meta.main) {
  await ku_ws_public(["BTC-USDT", "ETH-USDT"], console.log);
}
