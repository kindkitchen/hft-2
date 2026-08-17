/**
 * The `instance` property should never be destructed, because the websocket instance
 * may be replaced with other one.
 */
export type Ws = {
  instance: WebSocket;
};
