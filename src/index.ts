#!/usr/bin/env node

import { ApifyClient } from "apify-client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DEFAULT_ACTOR_ID = "larelabs/refinery-html-to-llm-cleaner";
const ACTOR_ID = process.env.REFINERY_ACTOR_ID ?? DEFAULT_ACTOR_ID;

type RefineryItem = {
  url?: string;
  source_url?: string;
  text?: string;
  language?: string;
  word_count?: number;
  content_type?: string;
  processing_time_ms?: number;
  success?: boolean;
  error?: string;
  mentions?: string[];
  hashtags?: string[];
};

type RefineryInput = {
  urls?: string[];
  raw_payload?: string;
  removeScripts?: boolean;
  removeStyles?: boolean;
  includeMetadata?: boolean;
  extractMentions?: boolean;
  extractHashtags?: boolean;
};

const server = new McpServer({
  name: "refinery-mcp",
  version: "0.1.0",
});

function getClient(): ApifyClient {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error(
      "Missing APIFY_TOKEN. Create an Apify token and pass it in your MCP client environment.",
    );
  }
  return new ApifyClient({ token });
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function summarizeSavings(raw: string, cleaned: string) {
  const rawChars = raw.length;
  const cleanChars = cleaned.length;
  const rawTokens = estimateTokens(raw);
  const cleanTokens = estimateTokens(cleaned);
  const reductionPct =
    rawChars === 0 ? 0 : Math.max(0, Math.round((1 - cleanChars / rawChars) * 100));

  return {
    raw_chars: rawChars,
    clean_chars: cleanChars,
    estimated_raw_tokens: rawTokens,
    estimated_clean_tokens: cleanTokens,
    estimated_token_savings: Math.max(0, rawTokens - cleanTokens),
    reduction_pct: reductionPct,
  };
}

async function runRefinery(input: RefineryInput): Promise<RefineryItem[]> {
  const client = getClient();
  const run = await client.actor(ACTOR_ID).call({
    removeScripts: true,
    removeStyles: true,
    includeMetadata: true,
    ...input,
  });

  const datasetId = run.defaultDatasetId;
  if (!datasetId) {
    throw new Error("Refinery run finished without a default dataset.");
  }

  const { items } = await client.dataset(datasetId).listItems({
    limit: 100,
  });
  return items as RefineryItem[];
}

function asJsonContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

server.tool(
  "clean_url",
  "Fetch a URL with the Refinery Apify actor and return clean LLM-ready text plus word_count.",
  {
    url: z.string().url().describe("The public URL to clean."),
    removeScripts: z.boolean().default(true),
    removeStyles: z.boolean().default(true),
  },
  async ({ url, removeScripts, removeStyles }) => {
    const items = await runRefinery({
      urls: [url],
      removeScripts,
      removeStyles,
      includeMetadata: true,
    });

    return asJsonContent({
      actor: ACTOR_ID,
      input_url: url,
      results: items,
    });
  },
);

server.tool(
  "clean_html",
  "Clean raw HTML that your agent, crawler, or browser session already fetched.",
  {
    html: z.string().min(1).describe("Raw HTML to strip and normalize."),
    extractMentions: z.boolean().default(false),
    extractHashtags: z.boolean().default(false),
  },
  async ({ html, extractMentions, extractHashtags }) => {
    const items = await runRefinery({
      raw_payload: html,
      includeMetadata: true,
      extractMentions,
      extractHashtags,
    });
    const first = items[0];
    const text = first?.text ?? "";

    return asJsonContent({
      actor: ACTOR_ID,
      savings: summarizeSavings(html, text),
      results: items,
    });
  },
);

server.tool(
  "estimate_savings",
  "Estimate token savings from raw HTML vs cleaned text without making an Apify call.",
  {
    raw: z.string().describe("Original raw HTML or noisy text."),
    cleaned: z.string().describe("Cleaned text to compare against raw input."),
  },
  async ({ raw, cleaned }) => {
    return asJsonContent(summarizeSavings(raw, cleaned));
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
