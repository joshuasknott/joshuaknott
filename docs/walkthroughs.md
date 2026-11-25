# Portfolio walkthroughs

## What the portfolio shows

The portfolio has 15 cards: 11 video walkthroughs and four stills (Memvella and the three society sites). The card markup, dialog media and destinations in `project-data`, and no-script fallback are in [`index.html`](../index.html). Older media files in the assets directory are not necessarily displayed.

On devices with a fine hover pointer, mouse hover or keyboard focus on a video cover starts a muted inline loop. Reduced motion disables these previews. A card uses its full recording as the preview unless a separate clip is set; Mote and Poppycheese supply shorter clips. Opening a project stops the inline preview.

Activating a cover or project name opens its dialog; `#project-<id>` links can open it directly. Video dialogs attempt muted, looping playback without player controls, even with reduced motion enabled. If playback fails, the dialog shows the poster. Closing stops playback and returns focus to the opener. The primary link prefers the project site and falls back to source; Mivlet also offers a separate **View source** link. Poppyfish and Elsewhere have no destination configured.

### Captures refreshed after the original review

| Project | Capture date | What is on the site |
| --- | --- | --- |
| TokenMaxxer | 16 October 2026 | The native dashboard recording shows Codex quotas, manual refresh and saved usage history. It does not verify other providers. |
| Memvella | 21 October 2026 | The Companion tablet demo still shows a family story and gentle reminder with fictional content. There is no linked walkthrough. |
| Mote | 21 October 2026 | The Windows recording starts with animals moving around a real window instead of opening in the picker. The full clip is 20 seconds at 1600 × 900; the inline clip is eight seconds at 960 × 540. |
| Poppycheese | 21 October 2026 | The full clip and shorter inline clip show keyboard gameplay. The dialog links to the bundled game at `/games/poppycheese/`. |

The linked videos have no audio tracks. Poppycheese uses VP8 WebM for both clips; the other linked videos are H.264 MP4.

## Original 7 October 2026 review

These findings describe the 6 October captures, not the current state of the products. All 11 original files decoded without errors. They used H.264, had streaming metadata at the beginning of the file, and contained no audio tracks. Original durations ranged from 8 to 30 seconds.

| Project | What the review found | Suggested follow-up |
| --- | --- | --- |
| Mivlet | The short clip mainly shows an existing answer and model controls; it does not demonstrate a complete agent task. | Record a fictional request being submitted, useful tool/file work and the resulting output. Keep personal accounts out of the capture. |
| Memvella | The 6 October cover showed the welcome screen; the original capture note reported unresolved email verification. | Verify sign-in and record the family workspace with fictional content. |
| ollo | The recording shows “No confirmed matches yet” and an empty application tracker. | Diagnose the search configuration/provider results, then record a successful search, role review and application-tracking flow. Keep sample data clearly identified. |
| TokenMaxxer | The original capture note reported failed Z.ai and DeepSeek refreshes. | Verify those integrations separately before claiming they work. |
| BetWFriends | Shows group setup and the bet composer using demo credit. Live payments and settlement were not tested. | Record a complete fictional bet-to-settlement flow in the supported test environment, identifying demo credit. Verify real payment support separately before claiming it. |
| Mote | The original 23-second recording spent roughly its first 17 seconds in the picker. | Start with the native desktop behaviour, as in the 21 October refresh. |
| mantaray | Demonstrates rotation, dissection and isolation using an artist-built educational model and schematic cartilage. | Keep that qualification. Add brief labels explaining what each control reveals. |
| Pianoforte | The recording is portrait, silent, and does not verify live AI tutor replies. | Capture system audio so viewers can hear the piano in the full walkthrough. Record a successful lesson; verify the tutor separately before showing it as working. Hover should remain muted. |
| Poppyfish | Shows swimming and boost, but the capture note says eating and score progression are outside the recording. | Record eating a smaller fish, visible growth and score progression to show the main game loop. |
| 3danatomy / PELAGIC | The clip is a short view of rotation, layers and separated structures. | Add a focused tour of one anatomical system and concise labels. |
| Elsewhere | Uses labelled authored samples and an isolated database; live moderation is not configured. | Configure and verify moderation before demonstrating a public posting flow. Record composition, submission and the thought appearing with labelled sample content. |

Original validation: all 11 previews played in the browser with one active preview at a time. JavaScript syntax and whitespace checks passed. Desktop/tablet/phone visual checks and playback/interaction checks were recorded with that task's local QA artifacts. That review did not publish a release.

## Mote refresh QA, 21 October 2026

The capture used live layered overlays, the production simulation and renderer, a native recording backdrop with a real test window, and scripted pointer input. Both Mote clips have streaming metadata first. At the time, local checks covered playback, hover, keyboard opening and Escape focus restoration, touch opening/closing, reduced-motion hover behaviour, and desktop/mobile views at 1440 × 900 and 390 × 844. No console errors or horizontal overflow were observed.

## Recording guidance

Use one successful task per product, start with visible activity, remove idle time, and use fictional content. Make the main steps understandable without sound; the portfolio mutes both the inline preview and dialog by design. Use shorter inline clips when the full recording is too long for a preview.
