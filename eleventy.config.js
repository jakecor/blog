// Eleventy build configuration.
// Tells Eleventy where source content lives, which folders to copy
// through untouched (e.g. CSS), and defines the "posts" collection
// used by src/index.njk to list and link to blog posts.
const { default: pluginRss } = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  // Copy static assets as-is into the output site (no processing needed).
  eleventyConfig.addPassthroughCopy("src/css");
  // Only real image files are copied; src/images/.gitkeep exists to keep the
  // empty folder in git and has no business being published.
  eleventyConfig.addPassthroughCopy("src/images/**/*.{jpg,jpeg,png,gif,svg,webp,avif}");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  // Cloudflare Pages reads _redirects from the site root. It has no effect
  // locally or on the GitHub Pages mirror — only Pages acts on it.
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  // "posts" collection: every non-draft Markdown file under src/posts/,
  // newest first. Powers the post listing on the homepage and any future
  // pagination.
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  // `draft: true` in a post's frontmatter keeps it out of collections and
  // stops Eleventy writing an output file for it at all, so the content
  // lives in the repo without going live. `|| data.eleventyExcludeFromCollections`
  // preserves that flag when a template (feed.njk, sitemap.njk, 404.md, ...)
  // sets it directly in its own frontmatter instead of via `draft`.
  //
  // Exception: under the dev server (`npm start`) a draft's page IS written,
  // so it can be previewed at its own URL while it is being worked on. It
  // still stays out of collections, so it is not listed on the homepage, feed
  // or sitemap even locally. `npm run build` and the Cloudflare build are not
  // "serve" mode, so nothing changes for the live site.
  const isDevServer = process.env.ELEVENTY_RUN_MODE === "serve";
  eleventyConfig.addGlobalData("eleventyComputed", {
    eleventyExcludeFromCollections: (data) =>
      data.draft === true || data.eleventyExcludeFromCollections === true,
    permalink: (data) =>
      data.draft && !isDevServer ? false : data.permalink,
  });

  // Human-readable date filter, e.g. {{ post.date | readableDate }} -> "May 15, 2016"
  eleventyConfig.addFilter("readableDate", function (dateObj) {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Machine-readable ISO date for <time datetime="..."> attributes.
  eleventyConfig.addFilter("isoDate", function (dateObj) {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  // Plain-text excerpt, used for the homepage listing blurb and as the
  // fallback <meta name="description"> in base.njk.
  //
  // Two things need stripping before truncating:
  //
  //  1. Post layout chrome. When base.njk calls this it is handed post.njk's
  //     OUTPUT, which already prepends the hero image, an <h1> of the title
  //     and the .post-meta date line. Left in, those ate ~90 of the 160
  //     characters restating the title that is already in <title>. Anything
  //     before the end of the .post-meta paragraph is dropped.
  //  2. HTML entities. The input is rendered HTML, so `&` arrives as `&amp;`.
  //     Nunjucks autoescapes on output, so leaving it would emit `&amp;amp;`
  //     and render a literal "&amp;" in the description. Decode first, let
  //     autoescape re-encode once.
  //
  // A period is inserted at each block-element close before tags are stripped,
  // so joining paragraphs doesn't glue two sentences together with no
  // punctuation between them. Posts can skip all of this with an explicit
  // `description` (meta) or `excerpt` (homepage) in frontmatter.
  eleventyConfig.addFilter("excerpt", function (content) {
    const body = String(content)
      .replace(/^[\s\S]*?<p class="post-meta">[\s\S]*?<\/p>/i, "")
      .replace(/^\s*<article[^>]*>/i, "")
      .replace(/^\s*<img[^>]*>/i, "")
      .replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, "");

    const withBreaks = body.replace(/<\/(p|h[1-6]|li|blockquote)>/gi, ".$&");
    const text = withBreaks
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .replace(/([.?!])[.?!]+/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length <= 160) return text;
    return text.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  });

  // Turns the rendered Markdown of a timeline page (src/work.md) into
  // structured data for _includes/timeline.njk. The Markdown convention is:
  //
  //   Intro paragraphs (anything before the first "## " heading).
  //
  //   ## Entry title
  //   2019-03 | Type, Another type | Where | Optional headline figure
  //
  //   First paragraph: always shown.
  //
  //   Anything after it: tucked behind a <details> disclosure.
  //
  // It works on the HTML markdown-it has already produced (splitting on <h2>)
  // rather than on the raw Markdown, so entry bodies can use any Markdown at
  // all without this filter having to understand it.
  //
  // Returns { intro, types, years }:
  //   types  [{ label, n }]  every distinct type, alphabetical; `n` (1-based)
  //                          pairs with the #tl-f{n} / .tl-t{n} / .tl-c{n}
  //                          rules in style.css, which is what makes the
  //                          filter work with no JavaScript
  //   years  [{ year, entries }]  entries grouped by year, sorted by date
  //
  // A malformed entry throws, failing the build (and so the deploy) with a
  // message naming the entry, rather than publishing a half-broken timeline.
  const TIMELINE_MAX_TYPES = 8; // number of filter rules written in style.css
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  eleventyConfig.addFilter("timeline", function (html, order) {
    const slugify = eleventyConfig.getFilter("slugify");
    const stripTags = (s) => s.replace(/<[^>]+>/g, "").trim();

    const parts = String(html).split(/(?=<h2[\s>])/i);
    const intro = /^<h2[\s>]/i.test(parts[0]) ? "" : parts.shift();

    const entries = parts.map((part, index) => {
      const m = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>\s*(?:<p>([\s\S]*?)<\/p>)?([\s\S]*)$/i);
      const title = m[1].trim();
      // The details line is the first LINE of the first paragraph. If the
      // blank line after it was forgotten, the rest of that paragraph is
      // body text, not details — hand it back.
      const [metaLine, ...spill] = (m[2] || "").split("\n");
      let body = (spill.length ? `<p>${spill.join("\n")}</p>` : "") + m[3];

      const [when = "", typeField = "", where = "", stat = ""] = metaLine
        .split("|")
        .map((s) => s.trim());
      const yearMatch = stripTags(when).match(/\d{4}/);
      const typeLabels = stripTags(typeField).split(",").map((s) => s.trim()).filter(Boolean);
      if (!yearMatch || !typeLabels.length) {
        throw new Error(
          `Timeline entry "${stripTags(title)}" needs a details line directly under its ` +
            `heading, like:  2019-03 | Type | Where  (a date containing a year, then at least one type).`
        );
      }

      // Sort key: year plus month, taken from "2019-03" or a month name
      // ("March 2019"). A range ("2016–2019") sorts by its first year.
      const year = Number(yearMatch[0]);
      const numericMonth = when.match(/\d{4}-(\d{1,2})/);
      const namedMonth = MONTHS.findIndex((mon) => new RegExp(`\\b${mon}`, "i").test(when));
      const month = numericMonth ? Number(numericMonth[1]) : namedMonth + 1;

      // First paragraph stays visible; the remainder goes behind <details>.
      const split = body.match(/^\s*(<p>[\s\S]*?<\/p>)([\s\S]*)$/i);
      const summary = split ? split[1] : "";
      const more = (split ? split[2] : body).trim();

      return {
        id: slugify(stripTags(title)),
        title, when, where, stat, summary, more,
        typeLabels, year,
        sortKey: year * 12 + month,
        index,
      };
    });

    const labels = [...new Set(entries.flatMap((e) => e.typeLabels.map((l) => l.toLowerCase())))].sort();
    if (labels.length > TIMELINE_MAX_TYPES) {
      throw new Error(
        `The timeline has ${labels.length} distinct types (${labels.join(", ")}) but style.css ` +
          `only has filter rules for ${TIMELINE_MAX_TYPES}. Merge some types, or add rules for more.`
      );
    }
    const types = labels.map((key, i) => ({
      n: i + 1,
      // Display the spelling/capitalisation of the first entry that used it.
      label: entries.flatMap((e) => e.typeLabels).find((l) => l.toLowerCase() === key),
    }));
    for (const entry of entries) {
      entry.types = entry.typeLabels.map((l) => types[labels.indexOf(l.toLowerCase())]);
    }

    // Same-date entries keep the order they have in the file.
    const direction = order === "oldest" ? 1 : -1;
    entries.sort((a, b) => direction * (a.sortKey - b.sortKey) || a.index - b.index);

    const years = [];
    for (const entry of entries) {
      const last = years[years.length - 1];
      if (last && last.year === entry.year) last.entries.push(entry);
      else years.push({ year: entry.year, entries: [entry] });
    }

    return { intro, types, years };
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
