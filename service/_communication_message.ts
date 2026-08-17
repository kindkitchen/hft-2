const PREFIX = "|msg|";
type Communication_Msg_Content = {
  send_ws: true;
  type: "subscribe" | "unsubscribe";
  topic: string;
};

export const Communication_Msg = {
  PREFIX,
  parse: (msg: string) => {
    if (msg.startsWith(PREFIX)) {
      const data = JSON.parse(
        msg.slice(PREFIX.length),
      ) as Communication_Msg_Content;

      return data;
    } else {
      return msg;
    }
  },
  stringify: (payload: Communication_Msg_Content) => {
    return PREFIX + JSON.stringify(payload) + "\n";
  },
};
