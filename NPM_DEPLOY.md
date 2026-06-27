# npm deploy — @larelabs/refinery-mcp

## Package

- **Name:** `@larelabs/refinery-mcp`
- **Registry:** https://www.npmjs.com/package/@larelabs/refinery-mcp
- **Repo:** https://github.com/LareLabs/refinery-mcp

## Prerequisites

- Node 20+
- npm token with publish access to `@larelabs` (2FA bypass or OTP at publish)
- Token path: `/root/.env.master` (do not commit tokens)

## Release checklist

```bash
cd /root/ACTIVE_PROJECTS/refinery/refinery-mcp
npm run build
npm run smoke
npm version patch   # or minor/major
git add -A && git commit -m "..." && git push
npm publish --access public
npm view @larelabs/refinery-mcp version
```

Update `server.json` version to match `package.json` before publish.

## MCP Registry (official discovery for Cursor/Claude agents)

Refinery MCP is **not yet listed** on https://registry.modelcontextprotocol.io — requires one interactive GitHub login.

```bash
# Official CLI (not the unrelated npm package named mcp-publisher)
curl -fsSL "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_linux_amd64.tar.gz" \
  | tar -xz -C /tmp && sudo mv /tmp/mcp-publisher /usr/local/bin/mcp-publisher-official

cd /root/ACTIVE_PROJECTS/refinery/refinery-mcp
/usr/local/bin/mcp-publisher-official validate server.json
/usr/local/bin/mcp-publisher-official login github   # device flow — human approves at github.com/login/device
/usr/local/bin/mcp-publisher-official publish
```

Requirements already in repo:
- `package.json` → `"mcpName": "io.github.cameronlares/refinery-mcp"` (personal namespace; LareLabs org requires public org membership on GitHub)
- `server.json` → matching name + npm package `@larelabs/refinery-mcp`
- npm publish **before** registry publish (metadata only; code lives on npm)

Verify: `curl -sS 'https://registry.modelcontextprotocol.io/v0/servers?search=refinery'`

**Published:** `io.github.cameronlares/refinery-mcp` v0.1.4 (2026-06-28)

## README visuals

Hosted image URLs live in `assets/image_urls.json`. Used in README and GitHub Pages (`docs/index.html`).

To change images: update URLs in JSON, README, and `docs/index.html`, then publish a patch version.

Prefer GitHub `raw.githubusercontent.com` over Imgur for long-term stability when ready to commit WebPs under `assets/`.

## What not to do

- Do not embed base64 images in README (bloats tarball; Apify had similar issues).
- Do not put `APIFY_TOKEN` in README or committed config — env only.

## Related

- Apify Actor: `larelabs/refinery-html-to-llm-cleaner`
- Apify deploy notes: `../refinery-rust/APIFY_DEPLOY.md`
- Post-mortem: `/root/TOOLS/postmortems/2026-05-24-refinery-mcp-npm-distribution.md`
