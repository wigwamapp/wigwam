# `lib/ext/porter`

A wrapper over the [browser messaging protocol](https://developer.chrome.com/docs/extensions/mv3/messaging/):

- Operates exclusively with long-lived connections, also known as ports (utilizing `browser.runtime.connect`).
- Enables a request-response pattern, not limited to pub-sub.
- Consolidates ports under the same channels within a single instance, facilitating unified handling.
- Ensures type safety.

## Usage

### Background script

```typescript
import { PorterServer } from "lib/ext/porter/server";

const channelName = "wallet-internal";

// Pub sub event (one-way message)
type EventMessage = { type: string; params: any };

const server = new PorterServer<EventMessage>(channelName);

// Connection

server.onConnection((action, port) => {
  if (action === "connected") console.info("+", port);
  if (action === "disconnected") console.info("-", port);
});

// Messaging

type Data = "hello" | "bye" | "ping";
type ReplyData = "world" | "bye-bye" | "pong";

server.onMessage<Data, ReplyData>((ctx) => {
  if (ctx.request) {
    // request-response pattern is used
  }

  console.info("port", ctx.port);

  // Handle data
  switch (ctx.data) {
    case "hello":
      return ctx.reply("world");

    case "bye":
      return ctx.reply("bye-bye");

    case "ping":
      return ctx.reply("pong");
  }

  // Reply with error
  const err = new Error("Not found");
  err.data = { custom: "Custom error data" };
  ctx.replyError(err);
});

// Send from server to client (pub-sub)

const msg: EventMessage = { type: "update-currencies", params: {} };

// notify all connected ports in this channel
server.broadcast(msg);
// notify only one
server.notify(port, msg);
```

### Client scripts (UI or content)

```typescript
import { PorterClient } from "lib/ext/porter/client";

const channelName = "wallet-internal";

type Request = "hello" | "bye" | "ping";
type Response = "world" | "bye-bye" | "pong";

const client = new PorterClient<Request, Response>();

client.connect(channelName); // Start connection

// Requst-response pattern
await client.request("hello"); // "world";
await client.request("ping", { timeout: 300, signal }); // "pong"

// Pub-sub

client.sendOneWayMessage({ type: "sync-currencies" });

type SomeDataFromServer = { some: "data" };

client.onOneWayMessage<SomeDataFromServer>((data) => {
  console.info("received", data);
});
```
