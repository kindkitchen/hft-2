import {
  internal_msg,
  Internal_Msg_Content,
} from "../ws_public_chanels_broadcaster/helper.internal_msg.ts";
import { on_msg_from_conn } from "../ws_public_chanels_broadcaster/helper.on_msg_from_conn.ts";
import { msg_to_conn } from "./helper.msg_to_conn.ts";

export async function ws_public_chanels_consumer(configuration: {
  socket_file: string;
  on_message: (m: string) => void;
}) {
  const {
    socket_file,
    on_message,
  } = configuration;
  const conn = await Deno.connect({ transport: "unix", path: socket_file });
  const te = new TextEncoder();
  on_msg_from_conn(conn, on_message);

  return async (msg: Internal_Msg_Content) => {
    await msg_to_conn(msg, {
      te,
      conn,
    });
  };
}
