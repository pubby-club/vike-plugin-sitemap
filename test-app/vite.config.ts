import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import sitemap from '@qalisa/vike-plugin-sitemap';

export default defineConfig({
  plugins: [
    vike({}),
    react({}),
    sitemap({
      baseUrl: process.env.BASE_URL,
      // outputDir: "public",
      debug: {
        printRoutes: true,
        printIgnored: true
      },
      sitemapGenerator(entries) {
        const locales = ['pt', 'es', 'en', 'fr', 'ja', 'ko']
        return entries.map((entry) => {
          entry.alternates = locales.map((locale) => {
            const href = new URL(entry.loc)
            href.searchParams.set('lang', locale)
            return {
              href: href.toString(),
              hreflang: locale
            }
          })
          entry.alternates.push({ hreflang: 'x-default', href: entry.loc })
          return entry
        })
      },
    })
  ],
  build: {
    target: "es2022",
  },
});
