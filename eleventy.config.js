// Eleventy build configuration.
// Tells Eleventy where source content lives, which folders to copy
// through untouched (e.g. CSS), and defines the "posts" collection
// used by src/index.njk to list and link to blog posts.
module.exports = function (eleventyConfig) {
  // Copy static assets as-is into the output site (no processing needed).
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

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
  // lives in the repo without going live.
  eleventyConfig.addGlobalData("eleventyComputed", {
    eleventyExcludeFromCollections: (data) => data.draft === true,
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

  // Plain-text excerpt for the homepage listing: strips rendered HTML
  // and truncates to a word boundary. Posts can override with a
  // frontmatter `excerpt` field instead of relying on auto-truncation.
  eleventyConfig.addFilter("excerpt", function (content) {
    const text = String(content).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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
