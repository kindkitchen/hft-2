export const ____string_with_symbols_tail = {
  stringify: (topic: string, symbols: string[]) => {
    return topic
      .concat(":") + new Set(symbols)
      .entries()
      .toArray()
      .sort()
      .join(",");
  },
  parse: (str: string) => {
    const [topic, _symbols] = str.split(":");
    const symbols = new Set(_symbols.split(","))
      .entries()
      .toArray()
      .sort();

    return {
      symbols,
      topic,
      symbols_dict: Object.fromEntries(symbols.map((s) => [s, s])),
    };
  },
};
