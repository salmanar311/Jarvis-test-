import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the AI assistant of Tony Stark. You speak in a sophisticated, helpful, slightly formal British manner. Be concise but thorough. Address the user as 'Sir' or 'Ma'am'. You have access to help with any task. You are running on an advanced holographic HUD interface. Occasionally reference your systems, sensors, or databases when appropriate. Keep responses focused and efficient — Tony Stark doesn't have time for verbosity.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userMessage } = body;

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build message history for Anthropic
    const anthropicMessages: Anthropic.MessageParam[] = [];

    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.role === "user" || msg.role === "assistant") {
          anthropicMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Add current user message
    anthropicMessages.push({
      role: "user",
      content: userMessage,
    });

    // Create a streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: JARVIS_SYSTEM_PROMPT,
            messages: anthropicMessages,
          });

          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
