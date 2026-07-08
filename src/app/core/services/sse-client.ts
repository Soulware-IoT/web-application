/// Minimal SSE consumer built on `fetch`. Native `EventSource` cannot attach
/// the Bearer token the gateway requires, so streaming services consume the
/// endpoints through this helper instead.

/**
 * Opens an authenticated `text/event-stream` request and invokes `onData`
 * with every JSON `data:` payload. Resolves when the stream ends (server
 * close or abort); throws on network/HTTP failures so the caller can retry.
 */
export async function consumeSse(
  url: string,
  token: string | undefined,
  signal: AbortSignal,
  onData: (data: unknown) => void,
  onOpen?: () => void,
): Promise<void> {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`stream responded ${response.status}`);
  }
  onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line.
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? '';
    for (const event of events) {
      const data = extractData(event);
      if (data !== null) onData(data);
    }
  }
}

/** Joins the `data:` lines of one raw SSE event and parses them as JSON. */
function extractData(rawEvent: string): unknown {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('\n');
  if (!data) return null; // comment / heartbeat / event-name-only block

  try {
    return JSON.parse(data);
  } catch {
    return null; // non-JSON payloads (e.g. keep-alives) are expected noise
  }
}
