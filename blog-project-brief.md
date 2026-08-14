# Blog Project — Claude Code Brief

Drop this file in `C:\Dev\projects\blog` as `CLAUDE.md` (Claude Code reads that filename automatically for project context), or paste it as your first message in a Claude Code session started in that folder.

## Context
- Replacing an existing personal blog at **jacobcorcoran.com** with a static site.
- Static site generator: **Eleventy (11ty)**.
- Location: `C:\Dev\projects\blog`
- Already done: `git init`, `.gitignore` (ignores `.venv/`, `node_modules/`, `.env`, etc.)
- Not yet done:  `npm init`, `@11ty/eleventy` installed as a dev dependency, repo connected to a GitHub remote, actual site structure, templates, content, local dev server verified, deployment.

## Working style
- **Documentation/comment-first**: before creating any template, config, or build file, add a short comment block at the top explaining its purpose and how it fits the build. Comment non-obvious logic throughout.
- **Small, frequent git commits** with clear messages — one logical change per commit, not batched.
- Don't install anything beyond what's needed for Eleventy + basic blog functionality without checking in first.

## Goal for this session
Get a working local Eleventy site with:
1. Standard Eleventy folder structure (`src/` for source content/templates, an `_includes` layout, `eleventy.config.js`).
2. A base HTML layout (header/footer/nav) — plain HTML5/CSS, no framework needed given my comfort level with HTML5.
3. Markdown-based posts — a `posts` collection Eleventy can list and paginate.
4. One or two sample posts migrated or drafted, to prove the pipeline works.
5. Confirm `npx @11ty/eleventy --serve` runs a local dev server and the site renders correctly at `localhost`.

## Explicitly out of scope for this session
- Deployment/hosting setup (that's a separate phase — GitHub Actions + Cloudflare Pages or GitHub Pages, once the site itself works locally).
- DNS/domain changes to jacobcorcoran.com.
- Any content migration beyond a couple of sample/test posts (real content migration is a follow-up task once the structure is confirmed).

## Questions to ask me before proceeding
- Do I have existing blog content (old posts, HTML export, etc.) I want migrated now, or should we start with fresh sample content?
- Any specific visual style/theme preference, or keep it minimal for now and refine later?
