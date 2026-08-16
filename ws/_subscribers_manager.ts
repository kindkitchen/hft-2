import { __handle_one_message } from "./__handle_one_message.ts";
import { ____string_with_symbols_tail } from "./__string_with_symbols_tail.ts";

type Subscriber_In =
  & {
    topic: string;
  }
  & (
    | {
      is_parsed_data_expected: true;
      on_data: <T extends object>(
        d: T,
      ) => void;
    }
    | {
      is_parsed_data_expected: false;
      on_data: (d: string) => void;
    }
  );
type Subscriber = Subscriber_In & {};

export function _subscribers_manager(ws: WebSocket) {
  let state_topic_symbols_set = new Set<string>();
  const subscribers: Map<string, Subscriber[]> = new Map();
  const build_unsubscribe =
    (subscriber: Subscriber_In) => async (full_raw_topic?: string) => {
      const {
        topic,
        symbols,
        symbols_set,
        topic_symbols,
        topic_symbols_set,
      } = ____string_with_symbols_tail.parse(
        full_raw_topic || subscriber.topic,
      );

      const unsubscribe_symbols = [] as string[];
      for (const ts of topic_symbols_set) {
        const group = subscribers.get(ts)!;
        const i = group.findIndex((s) => s === subscriber);
        void group.splice(i, 1);
        if (group.length === 0) {
          subscribers.delete(ts);
          state_topic_symbols_set.delete(ts);
          unsubscribe_symbols.push(ts.split(":").pop()!);
        }
      }
      const unsubscribe_ack_id = crypto.randomUUID();
      ws.send(JSON.stringify({
        id: unsubscribe_ack_id,
        response: true,
        type: "unsubscribe",
        topic: ____string_with_symbols_tail.stringify(
          topic,
          unsubscribe_symbols,
        ),
      }));
      await __handle_one_message(ws, {
        strict_next_only: false,
        predicat: ({ id }: { id: string }) => id === unsubscribe_ack_id,
      });
    };
  const subscribe = async (subscriber: Subscriber_In) => {
    const {
      topic,
      symbols,
      symbols_set,
      topic_symbols,
      topic_symbols_set,
    } = ____string_with_symbols_tail.parse(subscriber.topic);
    const fresh_topic_symbols_set = topic_symbols_set.difference(
      state_topic_symbols_set,
    );
    for (const fts of fresh_topic_symbols_set) {
      subscribers.set(fts, []);
    }
    for (const ts of topic_symbols) {
      subscribers.get(ts)!.push(subscriber);
    }
    state_topic_symbols_set = state_topic_symbols_set.union(
      fresh_topic_symbols_set,
    );
    const unsubscribe = build_unsubscribe(subscriber);
    const subscribe_ack_id = crypto.randomUUID();
    ws.send(JSON.stringify({
      id: subscribe_ack_id,
      response: true,
      type: "subscribe",
      topic: ____string_with_symbols_tail
        .stringify(
          topic,
          fresh_topic_symbols_set
            .values()
            .toArray()
            .map((topic_symbols) => topic_symbols.split(":").pop()!),
        ),
    }));

    await __handle_one_message(ws, {
      strict_next_only: false,
      predicat: ({ id }: { id: string }) => {
        return subscribe_ack_id === id;
      },
    });

    return {
      unsubscribe,
    };
  };

  return {
    subscribe,
    _subscribers: subscribers,
    _state_topic_symbols_set: state_topic_symbols_set,
  };
}
