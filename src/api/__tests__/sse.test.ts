import { describe, expect, it } from "vitest";
import { parseSseStream, type SseMessage } from "@/api/sse";

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(chunks: string[]): Promise<SseMessage[]> {
  const messages: SseMessage[] = [];
  for await (const message of parseSseStream(streamOf(chunks))) messages.push(message);
  return messages;
}

describe("parseSseStream", () => {
  it("reads one frame per blank-line boundary", async () => {
    const messages = await collect(['data: {"type":"status"}\n\n', 'data: {"type":"done"}\n\n']);

    expect(messages.map((m) => m.data)).toEqual(['{"type":"status"}', '{"type":"done"}']);
  });

  it("reassembles a frame split across chunk boundaries", async () => {
    const messages = await collect(['data: {"type":"text_', 'delta","text":"hel', 'lo"}\n\n']);

    expect(messages).toHaveLength(1);
    expect(JSON.parse(messages[0].data)).toEqual({ type: "text_delta", text: "hello" });
  });

  it("splits several frames delivered in a single chunk", async () => {
    const messages = await collect(['data: {"a":1}\n\ndata: {"b":2}\n\ndata: {"c":3}\n\n']);

    expect(messages.map((m) => m.data)).toEqual(['{"a":1}', '{"b":2}', '{"c":3}']);
  });

  it("handles CRLF line endings", async () => {
    const messages = await collect(['id: 7\r\ndata: {"type":"done"}\r\n\r\n']);

    expect(messages[0].id).toBe("7");
    expect(messages[0].data).toBe('{"type":"done"}');
  });

  it("joins multi-line data fields with a newline", async () => {
    const messages = await collect(["data: first\ndata: second\n\n"]);

    expect(messages[0].data).toBe("first\nsecond");
  });

  it("ignores keep-alive comments without emitting a frame", async () => {
    const messages = await collect([": keep-alive\n\n", 'data: {"type":"done"}\n\n']);

    expect(messages).toHaveLength(1);
    expect(messages[0].data).toBe('{"type":"done"}');
  });

  it("carries the event name and id through", async () => {
    const messages = await collect(["id: 42\nevent: claim\ndata: {}\n\n"]);

    expect(messages[0]).toMatchObject({ id: "42", event: "claim", data: "{}" });
  });

  it("emits a trailing frame that was not terminated by a blank line", async () => {
    const messages = await collect(['data: {"type":"done"}\n']);

    expect(messages).toHaveLength(1);
    expect(messages[0].data).toBe('{"type":"done"}');
  });

  it("keeps a single leading space out of the data, but no more", async () => {
    const messages = await collect(["data:  indented\n\n"]);

    expect(messages[0].data).toBe(" indented");
  });

  it("does not drop later frames when one is malformed", async () => {
    const messages = await collect(["garbage-without-a-field\n\n", 'data: {"type":"done"}\n\n']);

    expect(messages).toHaveLength(1);
    expect(messages[0].data).toBe('{"type":"done"}');
  });
});
