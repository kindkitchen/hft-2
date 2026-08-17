import {
  internal_msg,
  Internal_Msg_Content,
} from "../ws_public_chanels_broadcaster/helper.internal_msg.ts";

export async function msg_to_conn(
  data: Internal_Msg_Content,
  { conn, te }: { conn: Deno.Conn; te: TextEncoder },
) {
  await conn
    .write(te.encode(internal_msg.stringify(data)));
}
