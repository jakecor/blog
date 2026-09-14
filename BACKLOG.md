# Backlog

Ideas and future work for this blog, not yet scheduled.

## Bugs / broken right now

- _Nothing known._ (The previously listed dead `/contact/` link on the about page
  was already fixed on 2026-08-30 in commit `88d7c91` — `src/about.md` now links
  to LinkedIn, and no `/contact/` link exists anywhere in `src/`. The entry was
  filed in error on 2026-09-15; verify against the file before re-adding it.)

## Found in code review (2026-09-15) — fixed same day

All verified against a real `npm run build` and the resulting `_site/` output.

- ~~Post meta descriptions repeated the title and date~~ — `base.njk` built its
  fallback from `content`, which is `post.njk`'s output including the `<h1>` and
  `.post-meta` line, burning ~90 of 160 characters. The three posts now carry
  explicit `description:` frontmatter, the `excerpt` filter strips post layout
  chrome, and the chain falls back to `site.description` last.
- ~~The excerpt filter double-escaped HTML entities~~ — rendered `&amp;` passed
  through Nunjucks autoescape became `&amp;amp;`. Entities are decoded before
  truncation now, so autoescape encodes exactly once.
- ~~The 404 page was self-canonicalising and indexable~~ — `404.md` sets
  `noindex: true`, and `base.njk` emits `<meta name="robots" content="noindex">`
  instead of a canonical link when it is set.
- ~~Developer comments shipped above `<!DOCTYPE html>`~~ — `base.njk`'s header
  block is a Nunjucks comment now, and the `{%- set -%}` tags use whitespace
  control, so the doctype is line 1 on every page.
- ~~`npm run deploy` printed the wrong live URL~~ — `scripts/deploy.mjs` said
  `jakecor.github.io/blog/`; now `https://jacobcorcoran.com/`.
- ~~`og:title` duplicated `og:site_name`~~ — social titles drop the site name;
  `<title>` keeps it.
- ~~`404.md` hardcoded `/`~~ — uses the prefix-aware `| url` filter.
- ~~Unverified Twitter handle hardcoded in the layout~~ — moved to
  `site.twitterHandle`, and the tag is omitted entirely when it is unset.
  **Still worth confirming `@jacobcorcoran` is a real account.**
- ~~`src/images/.gitkeep` was published~~ — the passthrough copy is scoped to
  real image extensions.

## Quick, high-value wins — done (2026-09-15)

- ~~RSS/Atom feed~~ — `feed.xml` via the official `@11ty/eleventy-plugin-rss` plugin.
- ~~Open Graph / Twitter card meta tags (+ canonical link)~~ — per-page canonical, description, and OG/Twitter tags in `base.njk`, keyed off `src/_data/site.js`.
- ~~Favicon and custom 404 page~~ — `favicon.svg` (simple JC monogram) and `404.md` at the literal `/404.html` path.
- ~~robots.txt + sitemap.xml~~ — both generated from the same site data, sitemap covers every real page.

## DNS / domain

- **Move domain registration for jacobcorcoran.com to Cloudflare** — DNS is already managed there; the registrar (still Dreamhost) hasn't moved yet.
- **Redirect www → apex (or vice versa)** — `jacobcorcoran.com` and `www.jacobcorcoran.com` are both live, independent CNAMEs to the same Pages project with no redirect between them. Pick one as canonical and redirect the other (Cloudflare bulk redirect rule).
- **Add a DMARC record** — Cloudflare's dashboard flags this as a suggestion for the Email Routing setup; not added yet.
- **Remove the now-redundant GitHub Pages deploy workflow** — `.github/workflows/deploy.yml` still builds and deploys to `jakecor.github.io/blog/` on every push, but Cloudflare Pages (connected via GitHub App) is the real, current deployment. The GH Pages copy is a dead legacy mirror at this point.
- **301 redirect mapping for old URLs** — the old site's post slugs don't all match the new ones (e.g. `the-top-3-strategies-for-...` vs `top-3-strategies-digital-economy`). Any inbound links/search rankings to the old URLs would 404 without redirects.

## Lower priority / optional

- **Add Cloudflare Web Analytics** — cookieless, free, same vendor as DNS/Pages already in use. Either a dashboard toggle (zero code) or a one-line snippet in `base.njk`. This would add the site's first `<script>`. That is allowed (see CLAUDE.md — JS has to earn its place, it isn't banned), but weigh it on the stated criteria: it is a third-party external request on every page load, which cuts against "prefer local over external", in exchange for cookieless analytics at no cost on the free tier. Cloudflare's server-side Pages metrics may already cover enough without any script at all — check that first.
- **Add a privacy page** — pairs with the analytics addition above; explain what (little) is collected.
- **Reader comments** via giscus (GitHub Discussions-backed, free, fits a static site) if reader engagement is wanted.
- **Categories/tags** — the old site had them (Marketing, Writing, Secret Powers), but premature until there's more content.

## Other ideas

- **Linktree-style bio link page** — a template for a single page of social/bio links (for sharing from Instagram/X bio, etc.), separate from the main blog layout.
- **Nav link to tools subdomain** — add a link in the site header nav pointing to tools.jacobcorcoran.com.
- **Homepage pagination strategy** — decide how the frontpage post listing behaves once the number of posts grows large enough that a single unpaginated page is too long (e.g. paginate, or cap to N most recent with a link to an archive).
- **SEO review** — audit meta tags, sitemap, structured data, and general on-page SEO once there's more real content to review against.
