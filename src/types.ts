/**
 * Represents an entry in the sitemap, defining a URL and its metadata for inclusion in `sitemap.xml`.
 * Follows the sitemap protocol (https://www.sitemaps.org/protocol.html).
 * @interface
 */
export type SitemapEntry = {
  /**
   * The absolute URL of the page (e.g., `https://example.com/about`).
   * Must be a valid URL starting with the base URL of the site.
   * @type {string}
   */
  loc: string;

  /**
   * The date the page was last modified, in ISO 8601 format (e.g., `2025-04-11T12:00:00Z`).
   * Optional; if omitted, no `<lastmod>` tag is included in the sitemap.
   * @type {string | undefined}
   */
  lastmod?: string;

  /**
   * How frequently the page is likely to change.
   * Optional; if omitted, no `<changefreq>` tag is included.
   * @type {'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | undefined}
   */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

  /**
   * The priority of the page relative to other URLs on the site, ranging from 0.0 to 1.0.
   * Optional; if omitted, no `<priority>` tag is included.
   * @type {number | undefined}
   */
  priority?: number;

  alternates?: Array<{ hreflang: string, href: string }>
};

/**
 * Options for configuring the `robots.txt` file.
 * Controls directives for search engine crawlers and references the sitemap.
 * @interface
 */
export type RobotsOptions = {
  /**
   * The user agent to which the robots.txt rules apply.
   * Defaults to `*` (all crawlers) if not specified.
   * @type {string | undefined}
   * @default '*'
   */
  userAgent?: string;

  /**
   * Directives to disallow specific paths for crawlers.
   * @type {{ cloudflare: boolean }}
   */
  disallow: {
    /**
     * Whether to include a `Disallow: /cdn-cgi/` directive for Cloudflare proxy paths.
     * Useful for sites using Cloudflare to prevent crawlers from accessing internal endpoints.
     * @type {boolean}
     * @see https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/#disallow-using-robotstxt
     */
    cloudflare: boolean;
  };
};

/**
 * Configuration options for the vike-plugin-sitemap plugin.
 * Controls the generation and serving of `sitemap.xml` and `robots.txt`.
 * @interface
 */
export type SitemapPluginOptions = {
  /**
   * The directory containing page files (e.g., `+Page.tsx`) to scan for routes.
   * Relative to the project root.
   * @type {string | undefined}
   * @default 'pages'
   */
  pagesDir?: string;

  /**
   * The base URL of the site (e.g., `http://localhost:3000` or `https://example.com`).
   * Used to construct absolute URLs in the sitemap and robots.txt.
   * @type {string | undefined}
   * @default 'http://localhost:3000'
   */
  baseUrl?: string;

  /**
   * The filename for the generated sitemap (e.g., `sitemap.xml`).
   * @type {string | undefined}
   * @default 'sitemap.xml'
   */
  filename?: string;

  /**
   * The directory where `sitemap.xml` and `robots.txt` are written in production builds.
   * Relative to your `vite.config.js`'s `build.outDir`.
   * @type {string | undefined}
   * @default '.' // (root of generated `build.outDir` - `<outDir>/client` for SSR)
   */
  outputDir?: string;

  /**
   * The default change frequency for sitemap entries when not specified.
   * Applied to auto-discovered routes unless overridden.
   * @type {SitemapEntry['changefreq'] | undefined}
   * @default 'weekly'
   */
  defaultChangefreq?: SitemapEntry['changefreq'];

  /**
   * The default priority for sitemap entries, from 0.0 to 1.0, when not specified.
   * Applied to auto-discovered routes unless overridden.
   * @type {number | undefined}
   * @default 0.5
   */
  defaultPriority?: number;

  /**
   * Additional sitemap entries to include alongside auto-discovered routes.
   * Useful for static or dynamic routes not represented by page files.
   * @type {SitemapEntry[] | undefined}
   * @default []
   * @example
   * [
   *   { loc: 'https://example.com/extra', priority: 0.5, changefreq: 'monthly' }
   * ]
   */
  customEntries?: SitemapEntry[];

  /**
   * A function to modify the parsed sitemap entries before custom entries are added.
   * Receives the entries generated from the pages directory and can filter, modify, or transform them.
   * Custom entries are added AFTER this function is applied.
   * @type {(entries: SitemapEntry[]) => SitemapEntry[]}
   * @default (entries) => entries
   * @example
   * // Filter out certain entries
   * (entries) => entries.filter(entry => !entry.loc.includes('/admin'))
   *
   * @example
   * // Modify priorities based on URL patterns
   * (entries) => entries.map(entry => ({
   *   ...entry,
   *   priority: entry.loc.includes('/blog') ? 0.8 : entry.priority
   * }))
   */
  sitemapGenerator?: (entries: SitemapEntry[]) => SitemapEntry[];

  /** 
   * defines how sitemap generation should behave when clashing definitions occurs
   * @type {ClashingPathsResolutionType}
   * @default 'ignore'
   */
  clashingPathsResolution?: ClashingPathsResolutionType,

  /**
   * A function to format the last modified date for sitemap entries.
   * Receives a `Date` object from file stats and returns a string.
   * @type {((date: Date) => string) | undefined}
   * @default (date: Date) => date.toISOString()
   * @example
   * (date: Date) => date.toISOString().split('T')[0] // Returns 'YYYY-MM-DD'
   */
  formatDate?: (date: Date) => string;

  /**
   * Configuration for the `robots.txt` file.
   * If set to `false`, no file is generated.
   * @type {RobotsOptions | undefined | false}
   * @default "{ userAgent: '*', disallow: { cloudflare: true } }"
   */
  robots?: RobotsOptions | false;

  /**
   * Debugging options to log plugin behavior.
   * @type {{ printRoutes?: boolean; printIgnored?: boolean } | undefined}
   * @default "{ printRoutes: false, printIgnored: false }"
   */
  debug?: {
    /**
     * Whether to log all discovered and custom sitemap routes to the console.
     * Useful for verifying which URLs are included in the sitemap.
     * @type {boolean | undefined}
     * @default false
     */
    printRoutes?: boolean;

    /**
     * Whether to log directories and files ignored during route discovery.
     * Useful for troubleshooting ignored paths (e.g., `_private` or `@dynamic`).
     * @type {boolean | undefined}
     * @default false
     */
    printIgnored?: boolean;
  };
};

//
//
//

export type ResolvedPage = {
  shortPath: string;
  spSegments: string[];
  resolution: string | {
    rejectReason: "specialFolder" | "SSGUnhandled";
  };
}

export type ResolvedPageApprouved = {
  shortPath: string;
  spSegments: string[];
  resolution: string;
}

export type ClashingPathsResolutionType = 'ignore' | 'remove' | 'error';