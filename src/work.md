---
# Career timeline. Everything on the page comes from this one file; the
# layout (_includes/timeline.njk) only arranges it.
#
# EVERY WORD BELOW IS PLACEHOLDER. Replace all of it, then delete the
# `draft: true` line to publish. While it is a draft the page exists only on
# the local dev server (npm start -> http://localhost:8080/work/).
#
# HOW TO WRITE AN ENTRY
#
#   ## The title of the achievement
#   2019-03 | Type | Where | Headline figure
#
#   First paragraph. Always visible.
#
#   Anything further is folded away behind the "more" link. Any Markdown
#   works here: lists, links, quotes, images.
#
# The line directly under the heading is the details line, split by "|":
#   1. Date     required. 2019, 2019-03, March 2019 or 2016–2019 all work.
#               It is shown exactly as typed. Ranges sort by their first year.
#   2. Type     required. This is what the filter buttons are built from, so
#               spell each type the same way every time. Give an entry
#               several with commas: Leadership, Growth. Maximum 8 distinct
#               types across the page.
#   3. Where    optional. Employer, client, event.
#   4. Figure   optional. One short standout number or phrase, shown large.
#               To give a figure with no "where", leave the gap: 2019 | Type | | 40%
#
# Entries are sorted by date automatically, so add new ones anywhere.
# Text above the first "##" heading is the page introduction.
# A broken details line stops the build and names the entry at fault.
#
# To link straight to one entry from elsewhere, use /work/# followed by
# its title in lowercase with hyphens, e.g. /work/#first-placeholder-achievement

title: PLACEHOLDER page title
description: PLACEHOLDER one-sentence description for search results and link previews.
layout: timeline.njk
permalink: /work/
draft: true

order: newest               # or: oldest
filterLabel: PLACEHOLDER filter label
resetLabel: PLACEHOLDER show all
moreLabel: PLACEHOLDER more
---
PLACEHOLDER introduction. A sentence or two above the timeline, or delete this paragraph to have none.

## First placeholder achievement
2024-06 | Type one | Placeholder organisation | 00%

PLACEHOLDER first paragraph. This one is always visible.

PLACEHOLDER further detail. This paragraph and anything after it sit behind the "more" link.

- Placeholder point
- Placeholder point

## Second placeholder achievement
2024 | Type two | Placeholder organisation

PLACEHOLDER. An entry with a single paragraph has no "more" link.

## Third placeholder achievement
March 2021 | Type one, Type three | Placeholder organisation | $0 to $0

PLACEHOLDER. This entry has two types, so it appears under either filter.

## Fourth placeholder achievement
2016–2019 | Type three

PLACEHOLDER. The shortest valid entry: a date and a type, nothing else.
