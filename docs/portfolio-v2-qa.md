# Real media, portfolio guide and coastal background

Work on PR #6, branch `devin/1795376659-new-portfolio-polish`. The previous CI
watch returned **0 passed, 0 failed, 0 pending, 0 skipped**: no checks reported,
not a verified CI pass. No deployment, preview-server changes or changes to
`~/portfolio-preview` are part of this update.

## Project media

All 13 cards use real screenshots rather than abstract cover artwork. Nine
recordings load only on visible hover/focus, play muted/looping/inline, and pause
on blur, pointer exit, offscreen visibility, page hiding or navigation. Reduced
motion shows the still only. Detail players remain visitor-controlled. Cards
share the same 1.87:1 crop, without extra chrome; screenshots retain colour.

Public websites were opened at 1440 × 900 on **22 November 2026**, with network
idle and loaded fonts before capture. The comparison contact sheet is
`/home/ubuntu/shots/v2/comparison.jpg`; full public-site observations are saved
as `freshness-<id>.png` beside it. No cookie banners or personal account data
were present in the selected captures.

Updated WebP captures (quality 80), all in `assets/projects/2026-11/`:

| Capture | Reason | Bytes |
| --- | --- | ---: |
| `memvella-20261122.webp` | Current public companion landing page, replacing the tablet-only still | 38,914 |
| `surrey-ai-20261122.webp` | New illustrated dark hero and membership section | 62,660 |
| `surrey-business-20261122.webp` | Changed hero typography and header content | 176,830 |
| `surrey-neurotech-20261122.webp` | Revised hero, no former committee countdown | 84,780 |

Mivlet, Ollo and TokenMaxxer public URLs are marketing pages, not the native
workspaces shown in their existing recordings. Those sites were inspected,
but do not establish a changed native UI; the October native captures remain.
Pelagic Shark retains the same exhibit: its intact initial state differs from
the separated-anatomy capture, not evidence of a redesign. Its existing still
and recording remain. Local Poppycheese retains its recorded gameplay. Mote is
not in this branch's 13-project catalog and was not invented or added.

The three unused abstract cover files were removed. The no-script directory
retains every project, a direct CV link and contact links; Memvella's refreshed
capture date is recorded there too. Historical October media are retained as
recording evidence.

## Grounded assistant

One best-match answer, explicit project/About/Contact/CV links, and a short
Related line replace concatenated notes. Name aliases, one-edit word tolerance
for words longer than four letters and common synonyms improve retrieval.
Stack, source and website questions use catalog fields directly; missing
fields are stated as missing. A repository link is not called an open-source
licence. Games and AI lists are derived from catalog descriptions/topics.

Greetings and thanks have short replies. Unknown questions offer three
suggestions. The empty home composer has three question chips; Enter submits,
Escape clears input or closes the current view. The answer log is live and
focus stays in the composer after submission. A brief looking/thinking state
is exposed through the status region and `aria-busy`.

The local answer is returned immediately. An already-available on-device
LanguageModel may refine only that answer, streaming with `promptStreaming`
when available. No download is requested. A six-second abort bound, error
fallback and cancellation on a new question/Escape keep it optional. Streamed
text updates in place so links and keyboard focus are not replaced. Model
availability, streaming and failures are mocked in Node tests; this is not a
real-device model quality evaluation.

## Background

The monitor has a noninteractive coastal scene: layered sunset, distant birds,
soft reflection and slow tide. Static scenery is cached; only the water region
is repainted on animation frames, with capped raster density. It pauses when
the page, canvas, monitor or home surface is hidden, offscreen, or the CV is
open. Reduced motion paints a static frame. Both portrait and landscape use
the same responsive coastline composition.

## Verification

Required syntax checks and repository tests, browser accessibility/console/
overflow checks, playback and reduced-motion checks are recorded in the
delivery report. Node coverage includes aliases, typos, synonyms, per-project
fields and missing fields, lists, small talk, unknown/empty questions, model
streaming/failure/nonblocking behaviour, real media paths, capture dates and
animation visibility/reduced-motion scheduling.

Screenshots in `/home/ubuntu/shots/v2/` use `1440` and `390` suffixes:
`projects-*.png`, `detail-*.png`, `assistant-chips-*.png`,
`assistant-answer-*.png`, and `background-*.png`.

No changes to deployment wiring, social metadata, statistics, worker or older
portfolio. Actual refresh rate depends on the device; local frame samples
are not a cross-device performance guarantee.
