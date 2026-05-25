# Refinery MCP

Clean HTML before your agent burns tokens.

[Landing page](https://larelabs.github.io/refinery-mcp/) · [Apify Actor](https://apify.com/larelabs/refinery-html-to-llm-cleaner)

<!-- mcp-name: io.github.LareLabs/refinery-mcp -->

Refinery MCP wraps the [Refinery Apify Actor](https://apify.com/larelabs/refinery-html-to-llm-cleaner) as an MCP server so Claude, Cursor, and other agents can turn raw HTML or URLs into clean LLM-ready text plus `word_count`.

```mermaid
flowchart LR
  A[Agent needs web context] --> B[Fetch URL or raw HTML]
  B --> C[Refinery MCP]
  C --> D[Refinery Apify Actor]
  D --> E[Clean text + word_count]
  E --> F[RAG / embeddings / LLM context]
```

## Why

Agents can fetch pages, but raw HTML is noisy and expensive:

- scripts, styles, tracking tags
- nav, footers, cookie banners
- repeated links and layout markup
- huge token burn before the model sees the real content

Refinery is the middle step your agent can call before it stuffs web context into a prompt:

```text
fetch/render -> clean/refine -> chunk/embed/answer
```

It is **not a crawler**. Use Firecrawl, Crawl4AI, Playwright, browser automation, or your own fetcher when you need rendering. Use Refinery when you already have a URL or raw HTML and want a cheap cleanup pass before the LLM.

## When To Use It

Use Refinery MCP when:

- your agent already fetched a page but got bloated HTML
- you want a deterministic cleanup step before RAG ingestion
- you need `word_count` / token-ish savings before embedding
- you want to separate crawling from content cleanup

Do not use it as your browser renderer, anti-bot layer, or site crawler.

## Tools

### `clean_url`

Fetches a URL through the Refinery Apify Actor and returns dataset rows with clean text and metadata.

Input:

```json
{
  "url": "https://example.com",
  "removeScripts": true,
  "removeStyles": true
}
```

### `clean_html`

Cleans raw HTML your agent, crawler, or browser session already fetched.

Input:

```json
{
  "html": "<html><body><nav>Home</nav><article><h1>Hello</h1><p>Clean me.</p></article></body></html>",
  "extractMentions": false,
  "extractHashtags": false
}
```

### `estimate_savings`

Local helper that compares raw HTML vs cleaned text and estimates token savings. This does not call Apify.

Example output:

```json
{
  "raw_chars": 168,
  "clean_chars": 41,
  "estimated_raw_tokens": 42,
  "estimated_clean_tokens": 11,
  "estimated_token_savings": 31,
  "reduction_pct": 76
}
```

## Install

```bash
npx -y @larelabs/refinery-mcp
```

Set your Apify token:

```bash
export APIFY_TOKEN=apify_api_xxx
export REFINERY_ACTOR_ID=larelabs/refinery-html-to-llm-cleaner
```

## Cursor / Claude Desktop config

Use the published package:

```json
{
  "mcpServers": {
    "refinery": {
      "command": "npx",
      "args": ["-y", "@larelabs/refinery-mcp"],
      "env": {
        "APIFY_TOKEN": "apify_api_xxx",
        "REFINERY_ACTOR_ID": "larelabs/refinery-html-to-llm-cleaner"
      }
    }
  }
}
```

Or run from source during development:

```bash
git clone https://github.com/LareLabs/refinery-mcp
cd refinery-mcp
npm install
npm run build
```

```json
{
  "mcpServers": {
    "refinery": {
      "command": "npm",
      "args": ["run", "dev", "--prefix", "/absolute/path/to/refinery-mcp"],
      "env": {
        "APIFY_TOKEN": "apify_api_xxx"
      }
    }
  }
}
```

## Smoke Test

```bash
npm run build
APIFY_TOKEN=apify_api_xxx npm run smoke
```

The smoke test starts the MCP server over stdio, lists tools, and calls `estimate_savings` without spending Apify credits.

## Example Agent Prompt

```text
Use Refinery to clean this URL before summarizing it:
https://example.com

Return the clean text, word_count, and estimated token savings.
```

## Roadmap

- MCP registry listings
- Hosted HTTP/SSE MCP transport
- Batch URL cleanup tool
- Glama / PulseMCP / FindMCP / mcp.so listings
- Optional direct REST wrapper for RapidAPI
- Token savings benchmark page

## License

MIT
