# Markdown editor brief — producing a publish-ready post

What any editor (or tool, or script) must do to write a Markdown file that
builds cleanly and renders correctly on jacobcorcoran.com. Derived from the
current build (Eleventy 3.x, default markdown-it, Liquid pre-processing) —
see `CLAUDE.md` for the wider project context.

---

## 1. File

| Requirement | Detail |
|---|---|
| Location | `src/posts/<slug>.md` — flat, no subfolders |
| Filename | **Is the URL.** `my-post.md` publishes at `/posts/my-post/`. Lowercase, hyphens, no spaces or punctuation. Never rename after publishing (it breaks the URL). |
| Encoding | UTF-8, no BOM |
| Nothing else in `src/` | Every `.md`/`.njk`/`.html` file anywhere under `src/` is built and published. Editors must not write config, trash, template or backup files inside `src/` (settings folders, trash folders, `*.md~` backups). |

## 2. Frontmatter

YAML, at the very top of the file between `---` lines.

```yaml
---
title: "The post title"          # required; quote it (colons break YAML)
date: 2026-10-03                 # required; date only, YYYY-MM-DD, unquoted
layout: post.njk                 # required; exact value
draft: true                      # optional; omit or false to publish
description: "…"                 # optional; meta/OG description, ~150–160 chars
excerpt: "…"                     # optional; homepage blurb override
image: /images/my-post/cover.jpg # optional; hero + social image
imageAlt: "…"                    # optional; falls back to title
---
```

- **Omit empty optional fields** rather than writing `image: ""` — an empty
  string is still a value to the templates.
- `date` must be a bare date. No time, no timezone, no quotes, no template
  placeholders — anything else either fails the build or shifts the date.
- `draft: true` must be a real boolean, not the string `"true"`.
- New posts should start as `draft: true`. A draft produces no output file at
  all, so it is safe to commit and push.

## 3. Body

Rendered by markdown-it (CommonMark + GitHub tables/strikethrough), after a
Liquid pass.

- **Start headings at `##`.** The layout already renders the title as the
  page's only `<h1>`. Don't repeat the title in the body.
- **Single line breaks are not line breaks.** A paragraph needs a blank line.
  The editor's preview must match this (no "soft breaks as `<br>`").
- **No `{{`, `}}`, `{%` or `%}` in prose.** The body is run through Liquid
  first and these are parsed as template code. If needed literally, wrap the
  passage in `{% raw %}…{% endraw %}`.
- **Raw HTML is allowed** and passes through untouched.
- **Standard Markdown only.** None of these render — they publish as literal
  text or broken markup:
  - wiki links `[[…]]` and embeds `![[…]]`
  - callouts `> [!note]`
  - `==highlight==`
  - `%%comments%%` (would be **published visibly**)
  - footnotes, math, Mermaid
- Typographic quotes/dashes are not auto-converted — the editor should either
  insert them as real characters (`’ – —`) or leave plain ASCII, consistently.

## 4. Images

| Requirement | Detail |
|---|---|
| Storage | `src/images/<post-slug>/<name>.<ext>` — one folder per post |
| Formats | Only `jpg jpeg png gif svg webp avif` are copied to the site; anything else is silently dropped |
| Filenames | Lowercase, hyphens, no spaces (no `Pasted image 2026….png`) |
| Link path | **Root-relative: `/images/my-post/photo.jpg`.** Never relative (`../images/…` resolves to `/posts/images/…` on the live page and 404s) and never a full `https://jacobcorcoran.com/…` URL |
| Alt text | Always written, describing the image: `![A red bicycle against a wall](/images/my-post/bike.jpg)` |
| Size | Resize and compress before saving — there is no image pipeline. ~1600px on the long edge, JPEG/WebP, ideally under ~250 KB |
| Layout shift | Markdown `![]()` emits no width/height, so the page jumps when it loads. The ideal editor writes raw HTML instead: `<img src="/images/my-post/bike.jpg" alt="…" width="1600" height="900" loading="lazy">` (omit `loading="lazy"` on the first image) |
| Hero image | Set `image:` / `imageAlt:` in frontmatter with the same root-relative path. Don't also put it in the body — the layout already renders it. |

## 5. Links

| Link to | Write |
|---|---|
| Another post | `/posts/<slug>/` — root-relative, trailing slash, no `.md` |
| Other site pages | `/about/`, `/` |
| An image or file | `/images/…` (as above) |
| External sites | Full `https://` URL |

- Never link to the `.md` file (`other-post.md`) — that path doesn't exist
  on the live site.
- Never hardcode `https://jacobcorcoran.com` for internal links.
- Never use old WordPress URLs (`/post-name/`). `_redirects` catches them,
  but every one costs a redirect hop.
- Link text should make sense out of context (not "click here").

## 6. Checklist for "perfect"

1. Correct filename slug in `src/posts/`
2. Valid frontmatter with the three required fields; empty optionals removed
3. Body starts at `##`, blank lines between paragraphs, no Liquid delimiters
4. Images exist in `src/images/<slug>/`, are optimised, use `/images/…` paths,
   and have alt text (ideally width/height)
5. Internal links are `/posts/<slug>/`
6. `npm run build` passes and the post looks right at `npm start`
7. `draft` removed (or `false`) only when ready, then `npm run deploy`
