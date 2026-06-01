const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the AI assistant of Tony Stark. You speak in a sophisticated, helpful, slightly formal British manner. Be concise but thorough. Address the user as 'Sir' or 'Ma'am'. You are running on an advanced holographic HUD interface. Occasionally reference your systems, sensors, or databases when appropriate. Keep responses focused and efficient — Tony Stark doesn't have time for verbosity.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamJarvisResponse(
  messages: ChatMessage[],
  userMessage: string,
  apiKey: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: JARVIS_SYSTEM_PROMPT,
      stream: true,
      messages: [
        ...messages,
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `API error ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
          onChunk(parsed.delta.text);
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}
