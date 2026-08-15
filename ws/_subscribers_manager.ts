import { __handle_one_message } from "./__handle_one_message.ts";
import { ____string_with_symbols_tail } from "./__string_with_symbols_tail.ts";

export function _subscriber_manager(ws: WebSocket) {
  const subscribers: Subscribers = new Map();
  const symbols_dict = {} as Record<string, Record<string, number>>;
  const symbol_in_connection_string_map = new Map<string, string>();

  return {
    subscribers,
    subscribe: async (
      subscriber: SubscriberInput<any, any>,
    ): Promise<SubscriberOutput<any>> => {
      const {
        topic,
        symbols,
        symbols_set,
      } = ____string_with_symbols_tail.parse(subscriber.topic);
      if (!symbols_dict[topic]) {
        symbols_dict[topic] = {};
      }
      for (const s of symbols) {
        if (symbols_dict[topic][s]) {
          ++symbols_dict[topic][s];
        } else {
          symbols_dict[topic][s] = 1;
        }
      }
      const symbols_in_work = new Set(Object.keys(symbols_dict[topic]));
      const fresh = symbols_set.difference(symbols_in_work);

      for (const s of symbols_set) {
        const group_name = topic + s;
        const group = subscribers.get(group_name) || [];
        group.push(subscriber);
      }
      if (fresh.size) {
        const fresh_arr = fresh.values().toArray();
        const topic_connection_string = ____string_with_symbols_tail.stringify(
          topic,
          fresh_arr,
        );
        for (const f of fresh) {
          symbol_in_connection_string_map.set(f, topic_connection_string);
        }
        const id = crypto.randomUUID();
        ws.send(JSON.stringify({
          id,
          type: "subscribe",
          response: true,
          private: false, /// TODO
          topic: topic_connection_string,
        }));
        await __handle_one_message(ws, {
          strict_next_only: false,
          predicat: (j_data) => {
            return (j_data as { id: string }).id === id;
          },
        });
      }

      return {
        replace_on_data: (on_data) => subscriber.on_data = on_data,
        unsubscribe: async () => {
          for (const s of symbols_set) {
            const group_name = topic + s;
            const group = subscribers.get(group_name);
            if (!group) {
              console.warn("hmm... may be you already unsubscribed?");
              continue;
            }
            const self_position = group.findIndex((item) =>
              item === subscriber
            );
            if (self_position === -1) {
              console.warn("hmm... where is your logic?");
              continue;
            }
            void group.splice(self_position, 1);

            --symbols_dict[topic][s];
            if (symbols_dict[topic][s] === 0) {
              delete symbols_dict[topic][s];
              if (Object.keys(symbols_dict[topic]).length === 0) {
                delete symbols_dict[topic];
              }
              const id = crypto.randomUUID();
              ws.send(JSON.stringify({
                id,
                type: "unsubscribe",
                response: true,
                private: false, /// TODO
                topic: ____string_with_symbols_tail.stringify(topic, [s]),
              }));
              await __handle_one_message(ws, {
                strict_next_only: false,
                predicat: (j_data) => {
                  return (j_data as { id: string }).id === id;
                },
              });
            }
          }
        },
      };
    },
  };
}

type Subscribers = Map<string, SubscriberInput<any, any>[]>;

type SubscriberInput<T extends boolean, U = object | string> = {
  topic: string;
  is_parsed_data_expected: T;
  on_data: (data: T extends true ? Exclude<U, string> : string) => void;
};

type SubscriberOutput<U extends object | string> = {
  // sys: AsyncGenerator<"disconnect" | "reconnect" | "error">;
  unsubscribe: () => void;
  replace_on_data: (on_data: (data: U) => void) => void;
};
