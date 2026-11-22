# Portfolio polish QA

## Scope

Feature-branch preview only; no deployment or changes to the older portfolio.
The local HTTP preview runs on port 8080. Checks use Chromium via CDP,
1440 × 900 and 390 × 900 viewports, plus axe WCAG A/AA checks.

## Findings addressed

- Project dialogs preserve the owner's screen-only design: muted looping
  autoplay, no visible headings or descriptions, and small overlaid View links.
  The accessible project name and visually hidden description remain available
  to assistive technology. Capture limitations remain in the no-script fallback.
- Reduced motion disables autoplay and exposes playback controls only in that
  mode. Normal-motion recordings have no player controls. Modified
  project clicks retain ordinary link behavior; Back no longer replaces the
  section hash when closing a preview.
- The hero preload targeted an older, unused image. It now targets the desktop
  picture source and is not requested on mobile.
- Removed `Person.workExample`, which is not a Person property. Project objects
  still identify their creator in the JSON-LD graph. Social metadata is unchanged.
- The 404 page now uses the portfolio palette, artwork and local font rather
  than a separate Google Fonts request and older visual identity.
- Removed six unreferenced image-generation concept files and a temporary CV
  review image (about 7 MiB total). Added ignore rules to prevent their return.

## Read-only older-site comparison

Reference: `joshuasknott/portfolio`, cloned to `/home/ubuntu/repos/portfolio-old`.

| Older content | Decision |
| --- | --- |
| Politics, institutions, incentives and human systems (`PoliticsGrounding.tsx`) | Ported a compact sentence into the existing about section. |
| Memvella care routines, reassurance and caregiver context (`WorkShowcase.astro`) | Already represented in the embedded description and no-script fallback; the modal description is visually hidden. Kept the new site's £1,500 funding wording rather than replacing it with the older £500 figure. |
| Polis academic source-context project | Not ported: no corresponding current project capture, destination or status was established. |
| AI, Neurotech and Business society implementation narratives (`SocietySystem.tsx`) | Existing current cards cover these sites. Did not add older newsletter, sponsorship-directory or hardware-library claims without current corroboration. |
| Collaboration invitation (`ContactSection.astro`) | Existing email footer provides this action. Did not copy the placeholder `joshua.knott@example.com`. |
| Alternate `joshua-knott` social handles | Not copied; retained the existing `joshuasknott` links. |
| Interactive workbench and mascot | Not ported: decorative/interactive redesign rather than missing factual content. |

## Results

- Required syntax checks and Node tests: 11 passed, 0 failed.
- All 3 HTML files: zero missing local `src`/`href` references. Main-page CSS,
  lazy CV source and project-data media/destinations also resolved locally.
- External URLs in main HTML, CSS and JavaScript: 24 returned HTTP 200;
  LinkedIn returned HTTP 999 (automated-request restriction). Its availability
  to a signed-in human visitor is not established by this audit.
- Main page at both widths: no horizontal document overflow, broken loaded
  images, console errors or uncaught page errors. Images have alt attributes;
  project images retain explicit dimensions and lazy loading.
- axe WCAG A/AA checks: zero violations on the main page, a screen-only
  project dialog and the 404 page at both widths. This is not a formal WCAG
  certification or a Lighthouse performance score.
- Keyboard: skip link is first; Escape closes dialogs and restores opener;
  project-dialog Tab wraps; CV opens and zooms. Filters expose three website
  projects. Invalid project hashes are ignored. A direct Mote hash opens it.
  Browser Back closes the preview and retains `#work`.
- Reduced motion: video remains paused on open. Existing tests cover blocked
  autoplay fallback, hover shutdown and stale playback rejection.
- JavaScript disabled: 15 fallback project articles are available, filters
  remain hidden, and CV links remain ordinary PDF links.
- JSON-LD parses into 17 graph nodes. Canonical URL, social metadata, CNAME,
  robots, sitemap, worker, automation and generated stats are preserved.

Screenshots are outside the deploy tree in `/home/ubuntu/shots/`:
`before-1440.png`, `before-390.png`, `after-1440.png`, `after-390.png`,
`dialog-1440.png`, `dialog-390.png`, `404-1440.png`, `404-390.png`.
Before screenshots use original HEAD content, with lazy images loaded by
scrolling before capture. The 404 document was checked directly; Python's
generic server does not emulate GitHub Pages' custom missing-route fallback.

No live deployment, authenticated project workflow, or full game playthrough
was performed. External HTTP success establishes reachability, not product
functionality. The server is deliberately left running for review.
