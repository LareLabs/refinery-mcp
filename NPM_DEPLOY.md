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

**Namespace:** `io.github.LareLabs/refinery-mcp` — do **not** publish under `io.github.cameronlares/*`.

### Why LareLabs failed (403)

The MCP Registry maps `io.github.LareLabs/*` to the **GitHub org** `LareLabs`. Your account is org **admin**, but your membership is **private** (LareLabs public members list is empty). The registry only grants org namespaces when membership is public.

**Fix (one click, ~30 seconds):**

1. Open https://github.com/orgs/LareLabs/people (or Profile → Your organizations → LareLabs)
2. Find your name → **Publicize membership** (or Settings → Organization visibility → check LareLabs)
3. Confirm: https://github.com/orgs/LareLabs/public_members/cameronlares returns 200 (not 404)

Then publish:

```bash
curl -fsSL "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_linux_amd64.tar.gz" \
  | tar -xz -C /tmp && sudo mv /tmp/mcp-publisher /usr/local/bin/mcp-publisher-official

cd /root/ACTIVE_PROJECTS/refinery/refinery-mcp
unset GITHUB_TOKEN   # invalid env token breaks gh login
/usr/local/bin/mcp-publisher-official validate server.json
/usr/local/bin/mcp-publisher-official login github --token "$(gh auth token)"
/usr/local/bin/mcp-publisher-official publish server.json
```

Requirements:

- `package.json` → `"mcpName": "io.github.LareLabs/refinery-mcp"`
- `server.json` → same name + npm `@larelabs/refinery-mcp` version
- npm publish **before** registry publish

Verify: `curl -sS 'https://registry.modelcontextprotocol.io/v0/servers?search=LareLabs/refinery'`

**Published:** `io.github.LareLabs/refinery-mcp` v0.1.6

If publish returns 403, publicize org membership first:

```bash
gh api -X PUT orgs/LareLabs/public_members/cameronlares -H "Content-Length: 0"
```

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
