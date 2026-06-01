import { NextRequest, NextResponse } from "next/server";

interface DuckDuckGoResult {
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  Heading?: string;
  RelatedTopics?: Array<{
    Text?: string;
    FirstURL?: string;
    Result?: string;
    Topics?: Array<{
      Text?: string;
      FirstURL?: string;
    }>;
  }>;
  Answer?: string;
  AnswerType?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&t=jarvis_ai`;

    const response = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "JARVIS-AI-Assistant/1.0",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo API returned ${response.status}`);
    }

    const data: DuckDuckGoResult = await response.json();

    // Build results array
    const results: Array<{
      title: string;
      snippet: string;
      url: string;
      source?: string;
    }> = [];

    // Add instant answer if available
    if (data.Answer) {
      results.push({
        title: "Instant Answer",
        snippet: data.Answer,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        source: "DuckDuckGo",
      });
    }

    // Add abstract if available
    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.Heading || "Summary",
        snippet: data.AbstractText,
        url: data.AbstractURL,
        source: data.AbstractSource,
      });
    }

    // Add related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text.substring(0, 60),
            snippet: topic.Text,
            url: topic.FirstURL,
          });
        } else if (topic.Topics && Array.isArray(topic.Topics)) {
          // Nested topics
          for (const subtopic of topic.Topics) {
            if (subtopic.Text && subtopic.FirstURL) {
              results.push({
                title: subtopic.Text.substring(0, 60),
                snippet: subtopic.Text,
                url: subtopic.FirstURL,
              });
            }
          }
        }
        if (results.length >= 8) break;
      }
    }

    return NextResponse.json({
      query,
      results: results.slice(0, 8),
      total: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Search failed. Unable to reach external networks.",
        query,
        results: [],
      },
      { status: 500 }
    );
  }
}
