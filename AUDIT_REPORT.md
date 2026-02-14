# Adinath Hospital Website Audit Report
**Date:** 2026-02-14
**Site:** https://adinathhealth.com
**Auditor:** OpenClaw

---

## Executive Summary

The site has a solid foundation — good meta tags on the homepage, Hospital schema markup, i18n support, doctor photos, and clear CTAs. However, there are significant gaps in service page SEO, performance optimization, security headers, and accessibility that are limiting search visibility and user experience.

**Scores: 🔴 8 High | 🟡 12 Medium | 🟢 7 Low**

---

## Phase 1: Technical SEO

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 High | **No canonical URLs** on any page except index.html | Potential duplicate content issues; search engines may index wrong URLs | Add `<link rel="canonical" href="https://adinathhealth.com/{page}">` to all pages |
| 🔴 High | **No OG/Twitter tags** on service pages, book.html, store.html | Poor social sharing appearance; no rich previews when links are shared | Add OG and Twitter meta tags to every public-facing page |
| 🔴 High | **No schema markup** on service pages (orthopedic, gynecology, yoga) | Missing rich results for specific medical services | Add MedicalProcedure + FAQPage schema to each service page |
| 🟡 Med | **No meta description** on login.html and 404.html | Minor — login shouldn't be indexed, but 404 benefits from a description | Add noindex to login.html; add meta description to 404.html |
| 🟡 Med | **Sitemap missing** forms/index.html | Crawlers won't discover forms page | Add to sitemap.xml; also update lastmod dates (all stuck at 2025-12-21) |
| 🟡 Med | **Sitemap lastmod dates** all 2025-12-21 | Google may deprioritize crawling if dates look stale | Update lastmod to reflect actual modification dates |
| 🟡 Med | **Portal/admin pages in sitemap** | Internal pages shouldn't be indexed | Remove portal/admin URLs from sitemap; add noindex meta tags |
| 🟢 Low | **OG image is SVG** (`og-image.svg` referenced in meta) | Some platforms don't render SVG previews | Use the og-image.jpg instead (already exists in images/) |
| 🟢 Low | **Image filenames** are UUIDs (e.g., `D5A41C52-D4B2...jpeg`) | Missed SEO signal from descriptive filenames | Rename to descriptive names (e.g., `dr-ashok-consultation.jpg`) |

### What's Good ✅
- Homepage has excellent meta tags (title, description, keywords, OG, Twitter, canonical)
- All service pages have proper titles and meta descriptions
- H1 tags present on all pages
- Hospital schema on homepage is comprehensive (address, geo, hours, specialties, employees)
- sitemap.xml and robots.txt both exist and are valid
- No broken internal links detected

---

## Phase 2: Performance

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 High | **CSS/JS not minified** — 69KB CSS + 244KB JS unminified | Slower page load, especially on mobile networks | Minify all CSS/JS for production; consider bundling |
| 🔴 High | **7 render-blocking resources** (4 CSS + 3 JS in head) | Blocks first paint; hurts LCP significantly | Defer non-critical CSS/JS; inline critical CSS; add `defer` to scripts |
| 🟡 Med | **Google Fonts loading 4 font families** in one request (Playfair Display, Inter, Noto Sans Devanagari, Noto Sans Gujarati) | Large font download blocks rendering | Load only needed weights initially; lazy-load Devanagari/Gujarati fonts on language switch |
| 🟡 Med | **Images not in WebP format** — largest is 168KB JPEG | Slower load; WebP would be 30-50% smaller | Convert to WebP with `<picture>` fallback for older browsers |
| 🟢 Low | **No CSS/JS versioning** except styles.css (`?v=3.0`) | Cache busting issues on updates | Add version hashes to all CSS/JS references |
| 🟢 Low | **Total images ~1.1MB** | Acceptable but could be optimized | Compress further; consider responsive `srcset` for hero image |

### What's Good ✅
- Lazy loading on doctor photos (`loading="lazy"`)
- Hero image set to `loading="eager"` (correct)
- Font preconnect hints in place
- Served via CloudFront CDN with proper caching headers
- HTTP/2 enabled
- `font-display: swap` in the Google Fonts URL

*Note: PageSpeed API quota was exceeded — couldn't get Lighthouse scores. Recommend running manually at [pagespeed.web.dev](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fadinathhealth.com)*

---

## Phase 3: Local SEO

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 High | **Only 5 Google reviews** (5.0 rating) | Low social proof; competitors likely have hundreds | Actively request reviews from patients; add QR code at reception |
| 🟡 Med | **No AggregateRating schema** in markup | No star ratings in search results | Add AggregateRating to Hospital schema |
| 🟡 Med | **Google Maps embed uses approximate coordinates** (generic "Shukan Mall" not exact place) | Map may not pin correctly; no link to Google listing | Use the actual place_id: `ChIJp3cU7w2EXjkRf1P6ceA-zSI` for a precise embed |
| 🟢 Low | **No Google Business Profile link** on website | Missed opportunity to drive reviews | Add "Leave a Review" link pointing to your Google profile |

### What's Good ✅
- NAP (Name, Address, Phone) is consistent across pages
- Google Business Profile exists and is OPERATIONAL
- 5.0 rating (perfect, just needs more volume)
- Local keywords naturally used ("Ahmedabad", "Shahibaug" in meta/content)
- WhatsApp and phone number prominently featured
- Schema has full address with geo coordinates

---

## Phase 4: Accessibility

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 High | **Only 1 ARIA label** across entire homepage | Screen readers can't navigate interactive elements | Add `aria-label` to all buttons, nav links, icons, and interactive elements |
| 🟡 Med | **Form accessibility** — book.html has 18 labels but needs verification of association | Forms may not be screen-reader friendly | Verify every `<label>` has matching `for` attribute; add `aria-required` to required fields |
| 🟡 Med | **No skip navigation link** | Keyboard users must tab through entire nav | Add `<a href="#main" class="skip-link">Skip to content</a>` |
| 🟢 Low | **Emoji used as visual icons** (🦴, 🩺, 👶, etc.) | Screen readers read emoji names aloud | Wrap in `<span aria-hidden="true">` and provide text alternatives |

### What's Good ✅
- Semantic HTML structure
- Viewport meta tag properly set
- Form labels present on booking page
- Alt text on all images checked (descriptive and accurate)
- `rel="noopener"` on external links

---

## Phase 5: UX & Conversion

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 High | **No floating/sticky CTA button** | Users scrolling deep lose easy access to booking | Add a floating "Book Now" button (mobile) or sticky header CTA |
| 🟡 Med | **Service pages don't have FAQ sections** | Missing "People Also Ask" SEO opportunity; patients can't self-serve answers | Add 5-8 FAQs per service page with FAQPage schema |
| 🟡 Med | **No patient testimonials on service pages** | Trust gap — testimonials only on homepage | Add relevant testimonials to each service page |
| 🟢 Low | **Store page could highlight WhatsApp ordering more** | Unique feature not prominent enough | Add a large WhatsApp CTA banner at top of store page |

### What's Good ✅
- Clear CTAs above the fold (Call Now + WhatsApp)
- Click-to-call works properly
- WhatsApp link with pre-filled message
- Doctor photos present (builds trust)
- i18n for Hindi and Gujarati (huge for local audience)
- Booking page accessible from main nav
- Mobile-responsive with dedicated mobile CSS

---

## Phase 6: Security & Best Practices

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| 🔴 High | **Zero security headers** — no CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy | Vulnerable to clickjacking, MIME sniffing, data leaks | Configure via CloudFront response headers policy or Amplify custom headers |
| 🟡 Med | **HMS uses localStorage for patient data** | Client-side storage is not secure for medical records | This is a known architectural choice, but flag for future migration |

### What's Good ✅
- HTTPS enforced with valid certificate
- CloudFront CDN (DDoS mitigation)
- `rel="noopener"` on external links
- Security.js file exists (rate limiting, circuit breaker patterns)

---

## Priority Roadmap

### Do First (🔴 High Impact, Quick Wins)
1. Add canonical URLs + OG/Twitter tags to all pages (~1-2 hours)
2. Add schema markup to service pages (~1 hour)
3. Add security headers via Amplify config (~30 min)
4. Add ARIA labels across the site (~2-3 hours)
5. Minify CSS/JS + defer non-critical resources (~1-2 hours)

### Do Next (🟡 Medium, High Value)
1. Add FAQ sections to service pages with FAQPage schema
2. Optimize font loading strategy
3. Convert images to WebP
4. Add floating Book Now CTA
5. Update sitemap (remove portal pages, fix lastmod dates)
6. Add AggregateRating schema + Google review link

### Do Later (🟢 Polish)
1. Rename UUID image files to descriptive names
2. Add testimonials to service pages
3. Enhance store page WhatsApp prominence
4. Add skip navigation link
5. CSS/JS version hashing

### Ongoing
- **Google Reviews campaign** — this is the single biggest local SEO lever. 5 reviews vs competitors with 100+ is a huge gap.
- Run PageSpeed Insights manually to get Core Web Vitals baseline
- Monitor Search Console for indexing issues
