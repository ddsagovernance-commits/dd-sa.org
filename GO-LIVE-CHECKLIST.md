# DD&SA — Indexing Go-Live Checklist

## 1. Deploy
Deploy this folder to Netlify as-is. It now contains `sitemap.xml`, `robots.txt`, `_redirects`,
the new `/about/why-ddsa.html` page, and the site-wide nav update. Two pages were renamed
(ampersands break URLs):
- `/about/Why-the-UK-Needs-DD&SA.html` → `/about/why-the-uk-needs-ddsa.html`
- `/how-it-works/How-DD&SA-Works.html` → `/how-it-works/how-ddsa-works.html`
The `_redirects` file 301s the old addresses, so nothing breaks.

## 2. Confirm nothing is blocking crawlers (2 minutes)
After deploy, run:
    curl -sI https://dd-sa.org | grep -i robots        # should return nothing
    curl -s https://dd-sa.org/robots.txt                # should show Allow: /
Also check Netlify: Site settings → ensure no password protection, and that
dd-sa.org (not the netlify.app subdomain) is set as the primary domain.

## 3. Google Search Console (same day)
1. https://search.google.com/search-console → Add property → Domain → dd-sa.org
2. Verify via DNS TXT record (add it in your DNS panel; propagation is usually minutes).
3. Sitemaps → submit: https://dd-sa.org/sitemap.xml
4. URL Inspection → Request Indexing, in this order:
   homepage, /about/what-is-ddsa.html, /about/why-ddsa.html, /blueprint/, /downloads.html
   (Google caps requests per day — do five now, more tomorrow.)

## 4. Bing Webmaster Tools (same day)
https://www.bing.com/webmasters — you can import the verified site straight from
Search Console in one click. Bing also feeds DuckDuckGo.

## 5. First backlinks (this week — the highest-leverage item)
At zero referring domains, each one of these matters more than any on-page change:
- Add https://dd-sa.org to your X profile bio and pin a post linking the Why page.
- Equality by Lot (equalitybylot.com) — active sortition blog; comment/contact for a link.
- Democracy R&D (democracyrd.org) and the Sortition Foundation — both maintain
  links/network pages; DD&SA is squarely in scope.
- Any placement of "The Earthquake That Changes Nothing" with a byline link.

## 6. Expectations
Indexing of the main pages: days to ~2 weeks after submission. Rankings beyond the
brand name: weeks to months, and driven almost entirely by item 5. Re-run your SEO
report in 30 days; "indexed pages" should no longer be zero within the first week.

## 7. Known structural limits (future work, not blockers)
- The corpus PDFs are only reachable via reader.html?doc=… links, which crawlers treat
  as one page. They are now in the sitemap (96 URLs), which gets them crawled, but a
  visible "direct PDF" link per document on downloads.html would strengthen this.
- The homepage exposes ~1,250 characters of real text — adequate, but a short prose
  section beneath the constellation would help it rank for more than the brand.
