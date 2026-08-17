# About

Utility helper to work with `topic` strings.

So the `topic` property from `ws` subscriptions which are actually have
`for/example:such,structure` structure.

## Features

- parse => stringify
- remove possible duplicates
- sort symbols during split/join
- derive `topic:symbol` group keys (`topic_symbols` / `topic_symbols_set`)

So the derivations both from parse of stringify processes can be used always
same for same symbols.

```ts
/// common self import the same name ts file (origin) ---------------
const self = await import(import.meta.filename!.replace("MD", "ts"));
import * as assert from "@std/assert"; // also will be handy
/// -----------------------------------------------------------------

const { str_with_symbols_tail } = self;
const parse_result = str_with_symbols_tail.parse(
  "hello-world:ok,google",
);

assert.assertEquals(parse_result, {
  symbols: ["google", "ok"],
  symbols_set: new Set(["google", "ok"]),
  topic: "hello-world",
  topic_symbols: ["hello-world:google", "hello-world:ok"],
  topic_symbols_set: new Set(["hello-world:google", "hello-world:ok"]),
});

const stringify_result = str_with_symbols_tail.stringify(
  "hello-world-2",
  ["ok", "ok", "ok", "google"],
);

assert.assertEquals(stringify_result, "hello-world-2:google,ok");
```
