export const ____string_with_symbols_tail = {
  stringify: (topic: string, symbols: string[]) => {
    return topic
      .concat(":") + new Set(symbols)
      .values()
      .toArray()
      .sort()
      .join(",");
  },
  parse: (str: string) => {
    const [topic, _symbols] = str.split(":");
    const symbols_set = new Set(_symbols.split(","));
    const symbols = symbols_set
      .values()
      .toArray()
      .sort();
    const topic_symbols = symbols.map((s) => topic.concat(":", s));
    const topic_symbols_set = new Set(topic_symbols);

    return {
      symbols,
      symbols_set,
      topic,
      topic_symbols,
      topic_symbols_set,
    };
  },
};
