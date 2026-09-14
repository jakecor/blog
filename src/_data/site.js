// Global site metadata: canonical URL, name, and default description.
// Reused by the RSS feed, sitemap, robots.txt, and per-page Open Graph /
// canonical tags, so the domain lives in exactly one place.
//
// jacobcorcoran.com is served via Cloudflare Pages (root, no path
// prefix). www.jacobcorcoran.com currently serves the same content with
// no redirect between the two — this apex URL is the one treated as
// canonical everywhere on the site.
// `description` is the old site's own tagline (from its
// <h2 class="site-description"> element), reused verbatim rather than
// inventing new copy — swap it for something else whenever you want.
module.exports = {
  url: "https://jacobcorcoran.com",
  name: "Jacob Corcoran",
  description: "Writer and Marketing Strategist",
};
