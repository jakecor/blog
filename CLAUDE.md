# CLAUDE.md — jacobcorcoran.com

Project context for Claude Code. This file is the **current state of the world**;
`blog-project-brief.md` is the original kickoff brief and is now historical only —
read it for intent, never for facts.

Last verified: 2026-11-10.

---

## What this is

The personal blog at **https://jacobcorcoran.com**, built with **Eleventy 3.x**.
It replaced an older Dreamhost/WordPress site on the same domain.

Plain HTML5 + CSS. No framework, no bundler, no CSS preprocessor, no TypeScript.
The only runtime dependency of the build is Eleventy and the official RSS plugin.

---

## Deployment — read this before touching anything deploy-shaped

There are **two** deploy paths in this repo. Only one of them matters.

### The real one: Cloudflare Pages

- Cloudflare Pages is connected to `github.com/jakecor/blog` via Cloudflare's
  **GitHub App**. There is no workflow file for it and nothing in this repo
  configures it — it lives entirely in the Cloudflare dashboard.
- It builds from `main` on every push and serves at the **domain root**.
  **No path prefix.**
- DNS for jacobcorcoran.com is managed at Cloudflare. Domain *registration* is
  still at Dreamhost (see BACKLOG.md).
- Apex `jacobcorcoran.com` and `www.jacobcorcoran.com` are both live CNAMEs to
  the same Pages project, with **no redirect between them**. Apex is treated as
  canonical everywhere in the templates.

### The old one: GitHub Pages (removed 2026-09-15)

`.github/workflows/deploy.yml` used to build on every push and deploy a mirror
to `https://jakecor.github.io/blog/` with `--pathprefix=/blog/`. Nothing pointed
at it, it burned CI minutes on every push, and having two "live" sites was the
single biggest source of confusion across sessions. **It is gone.** There is now
exactly one deploy path: Cloudflare Pages.

Consequences worth knowing:
- `--pathprefix` is no longer used by anything. Internal links still go through
  the `| url` filter, which is correct and costs nothing, but there is no longer
  a build that renders at a non-root path.
- `jakecor.github.io/blog/` will serve stale content until GitHub Pages is
  turned off for the repo in its settings, or the `gh-pages` deployment is
  removed. Worth doing — it still carries a canonical pointing at
  jacobcorcoran.com, so it is not an SEO problem, just a stale copy.

### Redirects

`src/_redirects` is copied to the site root and read by Cloudflare Pages. It maps
the old WordPress permalinks (flat `/post-name/`) onto the new `/posts/post-name/`
structure, plus category/archive/theme-demo pages. It does nothing locally — to
test a rule you have to push and check the live site.

### Publishing

`npm run deploy` (or double-click `deploy.cmd`) — builds first, lists which posts
will be public, prompts, then commits and pushes. Pushing *is* publishing, on
both paths. Flags: `--dry`, `--yes`, `-m "msg"`.

After pushing it **polls the live site** for any post this push newly
publishes, waiting until each returns 200. That replaced watching a GitHub
Actions run: once `.github/workflows/` was deleted, `gh run list` kept
returning the last run from weeks earlier — already green — and the script
reported "✓ Published" about a deploy unrelated to the push. A success message
that cannot fail is worse than none. Cloudflare Pages has no `gh run watch`
equivalent without an API token, so it verifies the only thing that actually
matters: whether the page is there. An edit to an *existing* post has no new
URL to wait on, so there it says the build is running and claims nothing more.

---

## Commands

```
npm start          # dev server at localhost:8080 (npx @11ty/eleventy --serve)
npm run build      # one-off build into _site/
npm run deploy     # build, confirm, commit, push  (see above)
```

Node lives at `C:\Program Files\nodejs` and is not always on PATH in this
environment — prefix with `PATH="/c/Program Files/nodejs:$PATH"` if `npx` is not
found. `.claude/launch.json` defines the `blog-dev` preview server on port 8080.

---

## Layout

```
src/
  _data/site.js        canonical url, name, description — single source of truth
  _data/currentYear.js footer copyright year
  _includes/base.njk   <html> shell: head/meta, header, nav, footer
  _includes/post.njk   post wrapper (title + date), chains to base.njk
  _includes/timeline.njk  filterable timeline layout (see "Timeline and links pages")
  _includes/links.njk  "link in bio" layout; sets `bare: true` to drop site chrome
  index.njk            homepage: bio + post listing
  about.md             /about/
  work.md              /work/    timeline content — one file, one entry per "## "
  links.md             /links/   link-in-bio content — headings + bullet lists
  404.md               -> /404.html
  feed.njk             -> /feed.xml    (RSS 2.0)
  sitemap.njk          -> /sitemap.xml
  robots.txt.njk       -> /robots.txt
  posts/*.md           the posts collection
  css/style.css        all styling, light + dark via prefers-color-scheme
  favicon.svg          JC monogram
  _redirects           301 map for old WordPress URLs (Cloudflare Pages only)
eleventy.config.js     collection, draft handling, date/excerpt filters
_site/                 build output — gitignored, never edit
```

---

## Conventions that are already settled

**Documentation-comment-first.** Every config, template and build file opens with
a short comment block saying what it is and how it fits the build. Non-obvious
logic gets an inline comment. Match this when adding files.

**Small, single-purpose commits.** One logical change each, not batched.

**Ask before adding dependencies.** Anything beyond Eleventy + the RSS plugin
gets checked in first.

**JavaScript is allowed, but it has to earn its place.** The site currently
ships zero `<script>` tags. That is the *result* of the principles below, not a
goal in itself — this is not minimalism for its own sake, and a genuine
creature comfort with a real justification is welcome.

The actual priorities, in order:

1. **Speed.** Fast first render, no layout shift, no blocking requests.
2. **User experience.** It should feel good to read on a phone on bad reception.
3. **Standards compliance and accessibility.** Semantic HTML, keyboard
   navigability, visible focus states, real alt text, sensible contrast.
4. **Fits the Cloudflare free tier.** Static output, no server, no paid add-ons.
   Anything requiring Workers/Functions/KV should be checked against free-tier
   limits before it is built.
5. **Prefer local over external.** Self-host assets rather than pulling from a
   CDN or third party — fewer DNS lookups, no third-party tracking surface, no
   outage you don't control. The site already does this for fonts (system stacks
   only, zero downloads).

So: ask whether a script measurably improves the reading experience, whether it
can be local, whether it degrades gracefully without JS, and whether it costs
anything on the free tier. If it passes, add it. If it's decoration, don't.

**Canonical URL discipline.** `src/_data/site.js` holds the domain. The RSS feed,
sitemap, robots.txt and every canonical/OG tag read from it. Never hardcode the
domain in a template.

---

## Content model

Posts are Markdown in `src/posts/`. Frontmatter:

```yaml
---
title: Post title          # required
date: 2016-05-15           # required
layout: post.njk           # required
draft: true                # optional — see below
description: ...           # optional — meta/OG description override
excerpt: ...               # optional — homepage listing blurb override
image: /images/x/cover.jpg # optional — hero image + OG image
imageAlt: ...              # optional — falls back to title
---
```

**Drafts.** `draft: true` does two things via `eleventyComputed` in
`eleventy.config.js`: excludes the post from collections *and* sets
`permalink: false` so no file is written at all. The draft lives in the repo and
never reaches the live site. This applies to any page, not just posts.

The one exception is the dev server: under `npm start` (`ELEVENTY_RUN_MODE ===
"serve"`) a draft's page *is* written, so it can be previewed at its own URL.
It still stays out of collections, so it is not on the local homepage, feed or
sitemap. `npm run build` and the Cloudflare build never write drafts.

**The exclusion flag is shared.** `feed.njk`, `sitemap.njk`, `robots.txt.njk` and
`404.md` set `eleventyExcludeFromCollections: true` in their own frontmatter. The
computed-data rule deliberately ORs that in (`data.draft === true || data.eleventyExcludeFromCollections === true`)
rather than overwriting it — an earlier version overwrote it and silently leaked
all four templates into the sitemap. Do not simplify that expression.

---

## Timeline and links pages

Both are single Markdown files the author edits directly; the writing
convention for each is documented in YAML comments at the top of the file
(YAML comments, not HTML ones, so they never reach the output). All copy on
both — including UI labels like the filter legend — comes from the file's
body or frontmatter, per the authorship rule. Neither is linked from the site
nav yet; `/links/` is not meant to be.

**`src/work.md` → `/work/`.** Each `## heading` is an entry; the line under
it is `date | type[, type] | where | figure`. The `timeline` filter in
`eleventy.config.js` parses markdown-it's *HTML output* (split on `<h2>`),
sorts by date, groups by year and throws on a malformed entry so a bad edit
fails the build instead of publishing.

The type filter is **CSS only**: real checkboxes plus `:has()` rules in
`style.css`, keyed by type index (`#tl-f1` ↔ `.tl-t1`). Those rules are static,
which is why there is a hard cap of 8 distinct types — the config filter
enforces it. Raising the cap means adding a selector to each block in
`style.css`, a `--tcN` colour, and bumping `TIMELINE_MAX_TYPES`. "Show all" is
a `<button type="reset">`. Without `:has()` support everything simply stays
visible.

**`src/links.md` → `/links/`.** No parsing at all: plain headings and bullet
lists, styled into cards by `.links` rules. `bare: true` (set by `links.njk`)
makes `base.njk` omit the header, nav and footer.

---

## Verifying a change

Build (`npm run build`) and read the output in `_site/` — the meta tags and
sitemap are generated, so eyeball the real HTML rather than trusting the
template. The dev server does not re-verify the canonical/OG tags for you.
