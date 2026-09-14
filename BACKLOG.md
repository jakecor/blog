# Backlog

Ideas and future work for this blog, not yet scheduled.

## Bugs / broken right now

- **About page "contact" link is dead** — `src/about.md` links to `jacobcorcoran.com/contact/`, which was the old Dreamhost/WordPress site's contact page. That domain now points at this blog (Cloudflare Pages), which has no `/contact/` route, so the link 404s on the live site. Cloudflare Email Routing now forwards a `hello@` alias — a `mailto:` link is one option. Not fixed automatically since it's in a file the user hand-edits.

## Quick, high-value wins

- **RSS/Atom feed** — official `@11ty/eleventy-plugin-rss` plugin; lets people actually subscribe.
- **Open Graph / Twitter card meta tags (+ canonical link)** — per-page title/description/image so links look good when shared on LinkedIn/X; canonical tags matter now since both `jacobcorcoran.com` and `www.jacobcorcoran.com` serve the same content with no redirect between them.
- **Favicon and custom 404 page** — currently no favicon, and a broken link falls through to Cloudflare Pages' generic 404 instead of something on-brand.
- **robots.txt + sitemap.xml for the new site** — foundational for the SEO review below, cheap to add now.

## DNS / domain

- **Move domain registration for jacobcorcoran.com to Cloudflare** — DNS is already managed there; the registrar (still Dreamhost) hasn't moved yet.
- **Redirect www → apex (or vice versa)** — `jacobcorcoran.com` and `www.jacobcorcoran.com` are both live, independent CNAMEs to the same Pages project with no redirect between them. Pick one as canonical and redirect the other (Cloudflare bulk redirect rule).
- **Add a DMARC record** — Cloudflare's dashboard flags this as a suggestion for the Email Routing setup; not added yet.
- **Remove the now-redundant GitHub Pages deploy workflow** — `.github/workflows/deploy.yml` still builds and deploys to `jakecor.github.io/blog/` on every push, but Cloudflare Pages (connected via GitHub App) is the real, current deployment. The GH Pages copy is a dead legacy mirror at this point.
- **301 redirect mapping for old URLs** — the old site's post slugs don't all match the new ones (e.g. `the-top-3-strategies-for-...` vs `top-3-strategies-digital-economy`). Any inbound links/search rankings to the old URLs would 404 without redirects.

## Lower priority / optional

- **Lightweight privacy-friendly analytics** if we want to know whether anyone's reading — see the proposal doc once written up.
- **Reader comments** via giscus (GitHub Discussions-backed, free, fits a static site) if reader engagement is wanted.
- **Categories/tags** — the old site had them (Marketing, Writing, Secret Powers), but premature until there's more content.

## Other ideas

- **Linktree-style bio link page** — a template for a single page of social/bio links (for sharing from Instagram/X bio, etc.), separate from the main blog layout.
- **Nav link to tools subdomain** — add a link in the site header nav pointing to tools.jacobcorcoran.com.
- **Homepage pagination strategy** — decide how the frontpage post listing behaves once the number of posts grows large enough that a single unpaginated page is too long (e.g. paginate, or cap to N most recent with a link to an archive).
- **SEO review** — audit meta tags, sitemap, structured data, and general on-page SEO once there's more real content to review against.
