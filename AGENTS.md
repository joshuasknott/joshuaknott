# Joshua Knott portfolio

Static portfolio with a bundled browser game in `games/poppycheese/`. No package manifest or build step is present. See the [README](README.md#this-repo) for the repository layout and setup.

- Inspect the current page and assets before changing layout or project copy. Ground claims, dates, links, and screenshots in current project evidence; use compact factual wording.
- Keep project cards, the `project-data` JSON and the no-script fallback in `index.html` in sync when changing project media or links.
- Preview from the repository root with `python3 -m http.server 8080`. Check affected desktop/mobile views, keyboard use, browser console, navigation, and links. The static server does not run `worker/index.js`.
- Run `node --check main.js`, `node --check worker/index.js` and `node --test .github/scripts/*.test.js`; there are no npm test/build commands.
- `.github/workflows/update-stats.yml` maintains `data/stats.json` and the sitemap's last-modified date. Preserve generated data and reconcile remote automation changes before authorized publication.
- Preserve CNAME, sitemap.xml, robots.txt, social metadata, and deployment wiring unless the task requires changing them.
- When publication is requested, verify the deployed page and relevant download/remote links. A local preview does not establish public availability.
