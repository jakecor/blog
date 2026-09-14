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

- **Add a DMARC record** — **needs doing by hand in the Cloudflare dashboard;
  Claude has no Cloudflare credentials on this machine.** Email Routing is
  otherwise complete (MX + SPF `v=spf1 include:_spf.mx.cloudflare.net ~all` are
  both live), so this is the last missing piece and stops anyone spoofing the
  domain. Add a TXT record:

  | Field | Value |
  | --- | --- |
  | Type | `TXT` |
  | Name | `_dmarc` |
  | Content | `v=DMARC1; p=none; rua=mailto:hello@jacobcorcoran.com; fo=1` |

  Start at `p=none` (monitor only, nothing gets rejected). Once the reports show
  only legitimate mail, tighten to `p=quarantine` and later `p=reject`.

- **Move domain registration for jacobcorcoran.com to Cloudflare** — DNS is
  already managed there; the registrar (still Dreamhost) hasn't moved yet.

- **Turn off GitHub Pages for the repo** — the deploy workflow is deleted, but
  `jakecor.github.io/blog/` still serves the last build. Disable Pages in the
  repo settings to retire it properly. Low urgency: it serves a canonical
  pointing at jacobcorcoran.com, so it is stale, not harmful.

- **Redirect www → apex** — both are live CNAMEs to the same Pages project with
  no redirect. *Lower priority than it looks:* both already serve
  `<link rel="canonical" href="https://jacobcorcoran.com/">`, so search engines
  are being told the right thing. This is tidiness, not an SEO leak. A
  Cloudflare bulk redirect rule does it.

- ~~**Remove the redundant GitHub Pages deploy workflow**~~ — done 2026-09-15;
  `.github/workflows/deploy.yml` deleted. Cloudflare Pages is now the only
  deploy path.

- ~~**301 redirect mapping for old URLs**~~ — done 2026-09-15. `src/_redirects`
  maps 35 old WordPress paths onto the new structure. Old URLs were recovered
  from the Internet Archive CDX index and confirmed to have returned 200.

## Content recovered from the old site (decide what to do)

Found while building the redirect map. Both currently redirect to a stand-in;
retarget the rule in `src/_redirects` if either is restored.

- **`/presentations/`** — a real page listing speaking/webinar topics
  (copywriting, digital marketing, paid search, SEO, analytics, funnel
  development). Has no equivalent on the new site. Currently redirects to
  `/about/`. Plausibly worth rebuilding if you still take speaking work.
- **`/name-future/`** — "What My Name Means For My Future", an old just-for-fun
  post (category `just-for-fun`, tags funny/future/teletubbies) with reader
  comments. Tonally a long way from the current positioning; currently
  redirects to the homepage. Restore only if you want it.

## Lower priority / optional

- **Add Cloudflare Web Analytics** — cookieless, free, same vendor as DNS/Pages already in use. Either a dashboard toggle (zero code) or a one-line snippet in `base.njk`. This would add the site's first `<script>`. That is allowed (see CLAUDE.md — JS has to earn its place, it isn't banned), but weigh it on the stated criteria: it is a third-party external request on every page load, which cuts against "prefer local over external", in exchange for cookieless analytics at no cost on the free tier. Cloudflare's server-side Pages metrics may already cover enough without any script at all — check that first.
- **Add a privacy page** — pairs with the analytics addition above; explain what (little) is collected.
- **Reader comments** via giscus (GitHub Discussions-backed, free, fits a static site) if reader engagement is wanted.
- **Categories/tags** — the old site had them (Marketing, Writing, Secret Powers), but premature until there's more content.

## Gaps found in review (2026-09-15), not previously tracked

- **No `og:image` anywhere** — every share on LinkedIn/X renders as a bare text
  card, and `twitter:card` falls back to `summary` rather than
  `summary_large_image`. A single default image referenced from
  `src/_data/site.js` would fix this site-wide, with per-post `image:`
  frontmatter already supported as an override. Highest-visibility gap on the
  site given the subject matter.
- **No skip-to-content link** — cheapest real accessibility win available; a few
  lines in `base.njk` plus a focus style, letting keyboard users past the nav.
- **No `_headers` file** — Cloudflare supplies `x-content-type-options: nosniff`
  and `referrer-policy: strict-origin-when-cross-origin` by default, but there
  is no HSTS and no CSP. A `_headers` file is free-tier and local, and would
  also let CSS cache longer than the current `max-age=14400`.

## Other ideas

- **Linktree-style bio link page** — a template for a single page of social/bio links (for sharing from Instagram/X bio, etc.), separate from the main blog layout.
- **Nav link to tools subdomain** — add a link in the site header nav pointing to tools.jacobcorcoran.com.
- **Homepage pagination strategy** — decide how the frontpage post listing behaves once the number of posts grows large enough that a single unpaginated page is too long (e.g. paginate, or cap to N most recent with a link to an archive).
- **SEO review** — audit meta tags, sitemap, structured data, and general on-page SEO once there's more real content to review against.
