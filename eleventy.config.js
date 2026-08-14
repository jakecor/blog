// Eleventy build configuration.
// Tells Eleventy where source content lives, which folders to copy
// through untouched (e.g. CSS), and defines the "posts" collection
// used by src/index.njk to list and link to blog posts.
module.exports = function (eleventyConfig) {
  // Copy static assets as-is into the output site (no processing needed).
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  // "posts" collection: every Markdown file under src/posts/, newest first.
  // Powers the post listing on the homepage and any future pagination.
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
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

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
