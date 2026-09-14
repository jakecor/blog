# Backlog

Ideas and future work for this blog, not yet scheduled.

## Bugs / broken right now

- _Nothing known._ (The previously listed dead `/contact/` link on the about page
  was already fixed on 2026-08-30 in commit `88d7c91` — `src/about.md` now links
  to LinkedIn, and no `/contact/` link exists anywhere in `src/`. The entry was
  filed in error on 2026-09-15; verify against the file before re-adding it.)

## Found in code review (2026-09-15) — not yet fixed

Verified against a real `npm run build` and the resulting `_site/` output.

- **Post meta descriptions repeat the title and date.** `base.njk` builds its
  fallback description from `content`, which at that point is `post.njk`'s output
  — including the `<h1>` and the `.post-meta` date line. So a post's
  `<meta name="description">` burns ~90 of its 160 characters restating the title
  before reaching any actual prose. `index.njk` gets this right by using
  `post.templateContent`. Fix by adding explicit `description:` frontmatter to the
  three posts and falling back to `site.description`.
- **The 404 page is self-canonicalising and indexable.** `/404.html` emits
  `<link rel="canonical" href="https://jacobcorcoran.com/404.html">` and no
  `noindex`, inviting search engines to index it as a real page.
- **Developer comments ship above `<!DOCTYPE html>`.** The two comment blocks at
  the top of `base.njk` use HTML syntax, so they render into every page's source
  ahead of the doctype. Switching them to Nunjucks `{# … #}` keeps them build-time
  only.
- **`npm run deploy` prints the wrong live URL.** `scripts/deploy.mjs` line 28 sets
  `SITE = 'https://jakecor.github.io/blog/'` and echoes it three times on success.
  Should be `https://jacobcorcoran.com/`.
- **`og:title` duplicates `og:site_name`.** Both carry "Jacob Corcoran", so social
  cards read "Title | Jacob Corcoran" underneath "Jacob Corcoran".
- **`404.md` hardcodes `/`** for its homepage link instead of using `| url`, so it
  breaks under the `--pathprefix=/blog/` mirror build.
- **Unverified Twitter handle.** `base.njk` hardcodes `twitter:site` as
  `@jacobcorcoran`; confirm that account exists before relying on it.
- **`src/images/.gitkeep` is copied into `_site/`.** Harmless, but it is published.

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

- **Add Cloudflare Web Analytics** — cookieless, free, same vendor as DNS/Pages already in use. Either a dashboard toggle (zero code) or a one-line snippet in `base.njk`. **Note the tension:** the site currently ships zero client-side JavaScript and `style.css` states that as a design goal, so either option adds the first `<script>` to the site. Decide that explicitly before implementing.
- **Add a privacy page** — pairs with the analytics addition above; explain what (little) is collected.
- **Reader comments** via giscus (GitHub Discussions-backed, free, fits a static site) if reader engagement is wanted.
- **Categories/tags** — the old site had them (Marketing, Writing, Secret Powers), but premature until there's more content.

## Other ideas

- **Linktree-style bio link page** — a template for a single page of social/bio links (for sharing from Instagram/X bio, etc.), separate from the main blog layout.
- **Nav link to tools subdomain** — add a link in the site header nav pointing to tools.jacobcorcoran.com.
- **Homepage pagination strategy** — decide how the frontpage post listing behaves once the number of posts grows large enough that a single unpaginated page is too long (e.g. paginate, or cap to N most recent with a link to an archive).
- **SEO review** — audit meta tags, sitemap, structured data, and general on-page SEO once there's more real content to review against.
