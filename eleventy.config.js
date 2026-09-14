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
  eleventyConfig.addGlobalData("eleventyComputed", {
    eleventyExcludeFromCollections: (data) =>
      data.draft === true || data.eleventyExcludeFromCollections === true,
    permalink: (data) => (data.draft ? false : data.permalink),
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

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
