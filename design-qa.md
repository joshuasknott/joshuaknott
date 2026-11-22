# Portfolio desktop verification

## Current desktop

The local [workstation preview](http://127.0.0.1:4174/) opens on a colour coastal sunset. The centered composer, app pages and CV reader use white surfaces, black controls and the bundled Manrope font. Projects, About, Contact and portfolio answers fill the display and move the composer to its lower edge. Visitors can focus the composer with the slash key and open a project by name.

The catalog, structured data and guide share 13 projects. The two anatomy exhibits are Manta Ray (Giant manta ray anatomy) and Pelagic Shark (Whale shark anatomy).

The sea and sunlit reflections move independently of the sky and coastline. Visitors can pause the waves or touch the water to make a ripple. Opening an app or the CV suspends playback. Reduced motion keeps the cover still.

The paper CV has a black index tab. The first hand lifts the lower-left corner while the other three corners still touch the desk. The printed text follows the curve, and the sheet straightens as both hands bring it into reading position. On return, the lower-left corner settles last. Desktop and phone checks covered opening from the desk or About, reversing the bend with Escape, zooming and restoring focus. Keyboard navigation, the local PDF, the project pages and reduced motion also passed. All 11 repository tests passed. Chrome used the guide’s local answer path when its optional text service was unavailable.

The built-in image generator colourised the [landscape](assets/desktop/coastal-sunset-color.webp) and [portrait](assets/desktop/coastal-sunset-color-portrait.webp) covers. The brief specified gold sunlight, apricot and coral clouds, and a blue-teal sea, preserving the existing coastline and horizon for the wave animation. Two transparent photographic poses supply the [reaching](assets/machine/cv-hands-reach.webp) and [gripping](assets/machine/cv-hands-grip.webp) hands.

## Earlier desktop mockup verification

The following record describes the previous Projects-first design.

The Projects window opens on the workstation monitor after the greeting. The in-app browser exercised the local preview at [127.0.0.1:4174](http://127.0.0.1:4174/).

## Visual comparison

The approved image and the expanded live desktop were both 1672 × 941 pixels. The browser viewport was 1672 × 941 CSS pixels at device pixel ratio 1, so their measurements use the same scale. Both show the first row of Projects, its three app shortcuts and the empty question composer. The monitor’s expand control changes to a return control in the expanded capture. [Approved mockup](C:/Users/joshh/.codex/generated_images/01a1eb15-240a-7e90-a4c8-449cce6760fc/exec-dbdfb1c7-64f8-4ad7-9474-5281a4562be5.png) · [Live desktop](C:/Users/joshh/.codex/visualizations/2026/11/17/01a1eb15-240a-7e90-a4c8-449cce6760fc/portfolio-screen.jpg)

| Surface | Comparison and outcome |
| --- | --- |
| Layout | The live window starts at (70, 113) and measures 1267 × 615. The reference starts at approximately (71, 113) and measures 1266 × 615. The first cover starts at (113, 238), the dock at (281, 789) and the composer at (701, 804). |
| Typography | The desktop uses the bundled variable Inter with an Arial fallback. Optical sizing and tracking were adjusted against the raster. The visible Projects title measures 114 px wide in both images. The Mivlet title measures 106 px in the implementation and 110 px in the reference. Labels fit on one line. |
| Color and depth | The window uses a charcoal title bar, dark navy content area, fine edge and muted secondary text. The saturated blue wallpaper stays visible around the window and between the dock and composer. Active-app and keyboard-focus indicators remain visible. |
| Artwork | The three featured covers and dock icons use the supplied artwork. The Ollo cover was cropped inside the original card edge to remove a second outline. Project details show the products’ screenshots and recordings. |
| Content | Mivlet, Memvella and Ollo appear in the approved order. Scrolling and list view expose all 15 portfolio entries. The biography, leadership roles and contact destinations were checked against the October CV and portfolio records. |

The 1440 × 900 desktop capture shows the live screen within the room. On a 390 × 844 phone, selecting an app or project on the monitor opens it at reading size. The portrait project browser has two 166 px tracks. The project detail uses one column. [Workstation](C:/Users/joshh/.codex/visualizations/2026/11/17/01a1eb15-240a-7e90-a4c8-449cce6760fc/portfolio-desktop.jpg) · [Phone desk](C:/Users/joshh/.codex/visualizations/2026/11/17/01a1eb15-240a-7e90-a4c8-449cce6760fc/portfolio-mobile-desk.jpg) · [Phone projects](C:/Users/joshh/.codex/visualizations/2026/11/17/01a1eb15-240a-7e90-a4c8-449cce6760fc/portfolio-mobile-projects.jpg) · [Phone detail](C:/Users/joshh/.codex/visualizations/2026/11/17/01a1eb15-240a-7e90-a4c8-449cce6760fc/portfolio-mobile-project.jpg)

## Findings resolved during verification

- **P2, desktop sharpness and alignment.** The first capture had soft lettering on the transformed glass. The entered desktop now renders at its actual pixel size within the monitor outline. A second pass aligned the cover tracks, title spacing, dock and composer against the reference.
- **P2, window visibility.** The window’s flex layout could override its hidden state. Minimize and Close now remove the window from view. Selecting Projects after minimizing a project restores its detail.
- **P2, mobile CV return.** Opening the paper CV from expanded About collapsed the reading view. Closing the reader now returns to expanded About and places focus on “Read my CV.”
- **P2, desk movement.** Selecting a project below the fold could move the studio by 31 px. The room now clips its contents and keyboard navigation scrolls the project window. Opening all 15 projects left the studio scroll position at zero.

## Verification

- Automatic entry and pressing Enter manually both opened Projects. Arrow keys moved the project selection. Back restored the earlier card and scroll position.
- Every project opened through its card. The Mivlet video began playback. The local Poppycheese game destination and original CV PDF returned successfully.
- About opened the CV, zoom changed to 150%, and returning restored focus. Contact exposed the CV’s email, GitHub and LinkedIn addresses. LinkedIn returned HTTP 999 to the automated link check. Its destination matches the CV.
- The composer answered the funding and graduation questions from the portfolio records and linked back to the relevant view. The tested browser used the local answer path. The optional installed-model path requires a browser exposing an available on-device model.
- All 11 repository tests passed. JavaScript syntax checks passed for the entry point and changed modules. All 60 checked local HTTP destinations responded successfully. The browser console recorded zero warnings or errors during the interaction checks.

final result: passed
