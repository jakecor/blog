# Backlog

Ideas and future work for this blog, not yet scheduled.

## Quick, high-value wins

- **RSS/Atom feed** — official `@11ty/eleventy-plugin-rss` plugin; lets people actually subscribe.
- **Open Graph / Twitter card meta tags** — per-page title/description/image so links look good when shared on LinkedIn/X.
- **Favicon and custom 404 page** — currently no favicon, and a broken link falls through to GitHub's generic 404 instead of something on-brand.
- **robots.txt + sitemap.xml for the new site** — foundational for the SEO review below, cheap to add now.

## DNS / domain

- **Move domain registration for jacobcorcoran.com to Cloudflare** — DNS is already managed there; the registrar itself hasn't moved yet.
- **301 redirect mapping for old URLs** — the old site's post slugs don't all match the new ones (e.g. `the-top-3-strategies-for-...` vs `top-3-strategies-digital-economy`). Any inbound links/search rankings to the old URLs would 404 without redirects.

## Lower priority / optional

- **Lightweight privacy-friendly analytics** (Plausible/Fathom) if we want to know whether anyone's reading — trade-off is it works against the lightweight/no-JS ethos, so treat as opt-in.
- **Reader comments** via giscus (GitHub Discussions-backed, free, fits a static site) if reader engagement is wanted.
- **Categories/tags** — the old site had them (Marketing, Writing, Secret Powers), but premature until there's more content.

## Other ideas

- **Linktree-style bio link page** — a template for a single page of social/bio links (for sharing from Instagram/X bio, etc.), separate from the main blog layout.
- **Nav link to tools subdomain** — add a link in the site header nav pointing to tools.jacobcorcoran.com.
- **Homepage pagination strategy** — decide how the frontpage post listing behaves once the number of posts grows large enough that a single unpaginated page is too long (e.g. paginate, or cap to N most recent with a link to an archive).
- **SEO review** — audit meta tags, sitemap, structured data, and general on-page SEO once there's more real content to review against.
