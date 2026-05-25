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
