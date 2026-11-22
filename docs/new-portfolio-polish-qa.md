# New workstation portfolio polish

## Target and design constraints

Based on `origin/codex/new-portfolio`, commit
`26e3e4b0a7f60ef092eb7ef0e0293fb1a1388a08`, not main. The previous polish
branch is retained but abandoned. No deployment is part of this work.

Read `AGENTS.md`, `README.md`, `design-qa.md` and `docs/walkthroughs.md`
before editing. The current README and current-desktop notes describe a
13-project workstation with nine visitor-controlled recordings, descriptive
detail pages, a coastal cover, question composer and animated CV reader.
Those choices were preserved in the initial polish, including project covers and mobile
expansion. The screen-only modal notes in the older walkthrough document
describe main, not this workstation; the document now labels that distinction.
The subsequent [media and assistant update](portfolio-v2-qa.md) replaces abstract
covers with real captures and refreshes public website media.

## Audit and fixes

- Initial Chromium inspection showed no console errors or
  axe WCAG A/AA violations on Projects, About, Contact or a project detail.
  No redesign or speculative spacing changes were needed.
- Without JavaScript the original page exposed only the decorative room,
  with no accessible project or contact navigation. A no-script directory
  now includes all 13 catalog projects, direct email/social links and the CV.
- Capture qualifications existed in main but were missing from workstation
  details. Compact notes now identify demo credit, unverified tutor replies,
  empty job-search results, silent clips and other recording boundaries.
  The local portfolio guide uses the same notes, rather than omitting them.
- Added intrinsic dimensions to the room, mouse and CV thumbnail; prioritized
  the initial room image and enabled asynchronous decoding for app images.
  Existing below-the-fold project lazy loading and on-demand video loading
  remain intact. Media were not upscaled or replaced.
- Removed `Person.workExample`, a property intended for CreativeWork rather
  than Person. Each project still points to its creator. Canonical and social
  metadata are unchanged.
- The 404 page uses the bundled Manrope font instead of a remote Google Fonts
  stylesheet and references the current workstation artwork. Its return link
  and noindex metadata are preserved.
- Removed unreferenced `tmp/pdfs/cv-review/` and
  `output/imagegen/fable-logo-concepts-2026-09-07/` content, about 7 MiB.
  Full-tree reference search found no runtime uses. Ignore rules prevent return.

## Content references

`main:index.html` supplied the recording notes for the existing catalog.
Dates and limitations were condensed, not inferred to be newly verified.
The main-only Mote and Elsewhere entries were not added: the new README and
catalog deliberately use 13 projects.

The read-only `joshuasknott/portfolio` clone at
`/home/ubuntu/repos/portfolio-old` supplied one compact about sentence on
politics, institutions, incentives and the people software serves. Its older
£500 funding figure, placeholder email, alternate social handles, Polis entry
and uncorroborated society implementation claims were not copied. Current
funding, CV facts and contact details already exist in this workstation.

## Verification

- Required Node checks and all repository tests: 13 passed, 0 failed.
- Additional syntax checks cover the changed desktop modules and guide.
- Four HTML documents and all CSS: zero missing local static references.
  Catalog media existence is also covered by the repository test.
- External HTML/catalog URLs responded HTTP 200 except LinkedIn, which
  returned HTTP 999 for both slash variants (automated-request restriction).
  No LinkedIn account or URL substitution was made.
- Both viewports: axe WCAG A/AA scans reported zero violations on Home,
  Projects, a project detail, About, Contact, Questions and the CV reader. The 404
  document also reported zero violations. No console/page errors or failed
  local network responses occurred during the interaction audit.
- Reset an inherited Chrome zoom setting before the final audit. Verified
  `innerWidth` at exactly 1440 and 390 CSS pixels, with 900-pixel height.
  Refreshed baseline screenshots by serving the original commit's HTML and
  desktop modules through browser request interception, without changing
  the checkout; refreshed all after screenshots at the same dimensions.
- Keyboard: Tab reaches the composer, ArrowRight moves from Mivlet to
  Memvella, all 13 projects open and Escape restores the corresponding card.
  CV opens from About, zooms to 150%, and Escape restores Read my CV.
- No horizontal document overflow at either width. No-script mobile has
  13 entries, one direct PDF link and no overflow. This is a local preview,
  not a formal WCAG certification or Lighthouse performance score.
- CNAME, sitemap, robots, social metadata, worker, `.openai`, stats workflow
  and `data/stats.json` remain unchanged.

Screenshots: `/home/ubuntu/shots/new/before-{1440,390}.png`,
`before-projects-{1440,390}.png`, `before-dialog-{1440,390}.png`,
`after-{1440,390}.png`, `after-projects-{1440,390}.png`,
`after-dialog-{1440,390}.png`, `after-cv-{1440,390}.png` and
`after-noscript-390.png`, `after-questions-{1440,390}.png` and
`after-404-{1440,390}.png`. Before and after screenshots show the entered
desktop after the automatic greeting. Detail screenshots
show the expanded desktop so the content can be inspected at reading size.

## Limits

No deployment, signed-in LinkedIn verification, on-device language-model
verification, authenticated product workflows or full game playthrough was
performed. HTTP success is reachability, not proof of product functionality.
Python's server does not emulate GitHub Pages' custom 404 route handling;
the error document itself was checked. Historical recordings and the existing
CV have not been re-recorded or independently revalidated. The 8080 preview
server remains running against the repository checkout.
