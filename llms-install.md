# Install Refinery MCP

Refinery MCP exposes three tools for cleaning web HTML before an agent uses it in context:

- `clean_url`
- `clean_html`
- `estimate_savings`

## Requirements

- Node.js 20+
- An Apify API token

The server calls the Refinery Apify Actor:

https://apify.com/larelabs/refinery-html-to-llm-cleaner

## MCP Config

Use this config for Cursor, Claude Desktop, Claude Code, or any MCP-compatible client:

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

`REFINERY_ACTOR_ID` is optional. If omitted, the server uses `larelabs/refinery-html-to-llm-cleaner`.

## Test Prompt

After installation, ask your client:

```text
Use Refinery MCP to clean https://docs.stripe.com/payments and return the clean text, word_count, and a short summary.
```

For raw HTML already fetched by a browser/crawler:

```text
Use Refinery MCP clean_html on this HTML before adding it to my RAG ingestion queue. Return cleaned text and estimated token savings:

<html><body><nav>Home Pricing Login</nav><article><h1>Vendor security update</h1><p>We now support SOC 2 exports for enterprise accounts.</p></article><footer>Legal Privacy Careers</footer></body></html>
```

## Notes

Refinery is not a crawler or browser renderer. It is the cleanup step after fetching HTML.
