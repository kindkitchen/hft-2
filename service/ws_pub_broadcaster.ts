import { make_ws } from "../ws/make_ws.ts";
import { parseArgs } from "@std/cli";
import { __on_message_from_conn } from "./__on_message_from_conn.ts";
import { Communication_Msg } from "./_communication_message.ts";

export async function ws_pub_broadcaster(configuration: {
  socket_file?: string;
}) {
  const {
    socket_file = "./.socket",
  } = configuration;

  try {
    Deno.removeSync(socket_file);
  } catch {}

  const listener = Deno.listen({ transport: "unix", path: socket_file });
  const ws = await make_ws();
  const te = new TextEncoder();

  for await (const con of listener) {
    let unsubscribe:
      | {
        unsubscribe: (full_raw_topic?: string) => Promise<void>;
      }
      | null = null;
    __on_message_from_conn(con, async (m) => {
      const message = Communication_Msg.parse(m);

      if (typeof message === "string") {
        console.warn(`unexpected message from connected client:\n${message}`);
        return;
      }

      if (message.send_ws && message.type === "subscribe") {
        unsubscribe = await ws.subscribe({
          is_parsed_data_expected: false,
          topic: message.topic,
          on_data: async (text) => {
            await con.write(te.encode(text));
          },
        });
        return;
      }

      if (
        message.send_ws && message.type === "unsubscribe" && unsubscribe
      ) {
        await unsubscribe.unsubscribe(message.topic);
        return;
      }
    });
  }
}

if (import.meta.main) {
  const socket_file = "./.socket";
  const { client } = parseArgs(Deno.args, {
    boolean: ["client"],
  });

  if (client) {
    const con = await Deno.connect({ transport: "unix", path: socket_file });
    __on_message_from_conn(con, (m, c) => {
      console.log(m);
    });
    await con.write(
      new TextEncoder()
        .encode(Communication_Msg.stringify({
          topic: "/market/level2:ETH-USDT",
          send_ws: true,
          type: "subscribe",
        })),
    );
  } else {
    await ws_pub_broadcaster({ socket_file });
  }
}
