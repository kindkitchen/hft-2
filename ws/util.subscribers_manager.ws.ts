import { handle_one_message } from "./helper.handle_one_message.ws.ts";
import { str_with_symbols_tail } from "./helper.str_with_symbols_tail.ws.ts";
import { Ws } from "./types.ws.ts";

type Subscriber_In =
  & {
    topic: string;
  }
  & (
    | {
      is_parsed_data_expected: true;
      on_data: <T extends object>(d: T) => void;
    }
    | {
      is_parsed_data_expected: false;
      on_data: (d: string) => void;
    }
  );
type Subscriber = Subscriber_In & {};

export function subscribers_manager(ws: Ws) {
  let state_topic_symbols_set = new Set<string>();
  const subscribers: Map<string, Subscriber[]> = new Map();
  const build_unsubscribe =
    (subscriber: Subscriber_In) => async (full_raw_topic?: string) => {
      const { topic, symbols, symbols_set, topic_symbols, topic_symbols_set } =
        str_with_symbols_tail.parse(full_raw_topic || subscriber.topic);

      const unsubscribe_symbols = [] as string[];
      for (const ts of topic_symbols_set) {
        const group = subscribers.get(ts);
        if (!group) continue;
        const i = group.findIndex((s) => s === subscriber);
        if (i === -1) continue;
        group.splice(i, 1);
        if (group.length === 0) {
          subscribers.delete(ts);
          state_topic_symbols_set.delete(ts);
          unsubscribe_symbols.push(ts.split(":").pop()!);
        }
      }
      if (unsubscribe_symbols.length === 0) return;
      const unsubscribe_ack_id = crypto.randomUUID();
      ws.instance.send(
        JSON.stringify({
          id: unsubscribe_ack_id,
          response: true,
          type: "unsubscribe",
          topic: str_with_symbols_tail.stringify(topic, unsubscribe_symbols),
        }),
      );
      await handle_one_message(ws, {
        strict_next_only: false,
        predicat: ({ id }: { id: string }) => id === unsubscribe_ack_id,
      });
    };
  const subscribe = async (subscriber: Subscriber_In) => {
    const { topic, symbols, symbols_set, topic_symbols, topic_symbols_set } =
      str_with_symbols_tail.parse(subscriber.topic);
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
    // Nothing fresh: every requested symbol is already subscribed upstream.
    // The subscriber is registered for fan-out above, so just return —
    // otherwise we would send a garbage frame with an empty symbol tail
    // ("topic:") and hang waiting for an ack the server may never send.
    // Mirrors the `unsubscribe_symbols.length === 0` early return in
    // build_unsubscribe.
    if (fresh_topic_symbols_set.size === 0) {
      return {
        unsubscribe,
      };
    }
    const subscribe_ack_id = crypto.randomUUID();
    ws.instance.send(
      JSON.stringify({
        id: subscribe_ack_id,
        response: true,
        type: "subscribe",
        topic: str_with_symbols_tail.stringify(
          topic,
          fresh_topic_symbols_set
            .values()
            .toArray()
            .map((topic_symbols) => topic_symbols.split(":").pop()!),
        ),
      }),
    );

    await handle_one_message(ws, {
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
    subscribers,
    state_topic_symbols_set,
  };
}
