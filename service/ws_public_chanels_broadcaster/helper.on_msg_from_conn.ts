import { TextLineStream } from "@std/streams";

export async function __on_message_from_conn(
  conn: Deno.Conn,
  cb: (message: string, c: Deno.Conn) => void,
) {
  for await (
    const message of conn
      .readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
  ) {
    cb(message, conn);
  }
}
