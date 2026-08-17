const PREFIX = "|msg|";
type Internal_Msg_Content =
  | {
      send_ws: true;
      type: "subscribe" | "unsubscribe";
      topic: string;
    }
  | {
      send_ws: false;
      /// TODO
    };

export const internal_msg = {
  PREFIX,
  parse: (msg: string) => {
    if (msg.startsWith(PREFIX)) {
      const data = JSON.parse(msg.slice(PREFIX.length)) as Internal_Msg_Content;

      return data;
    } else {
      return msg;
    }
  },
  stringify: (payload: Internal_Msg_Content) => {
    return PREFIX + JSON.stringify(payload) + "\n";
  },
};
