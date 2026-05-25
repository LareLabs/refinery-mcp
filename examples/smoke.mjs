import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env: process.env,
});

const client = new Client({
  name: "refinery-mcp-smoke",
  version: "0.1.0",
});

await client.connect(transport);

const tools = await client.listTools();
console.log("tools:", tools.tools.map((tool) => tool.name).join(", "));

const result = await client.callTool({
  name: "estimate_savings",
  arguments: {
    raw: "<html><head><script>track()</script></head><body><nav>Home Pricing Login</nav><article><h1>Hello</h1><p>Clean content.</p></article></body></html>",
    cleaned: "Hello\n\nClean content.",
  },
});

console.log(result.content[0].text);

await client.close();
