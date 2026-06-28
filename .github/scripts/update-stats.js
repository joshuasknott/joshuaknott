/* ============================================
   UPDATE-STATS.JS
   Generates data/stats.json for the static site:
     - Account-wide contribution calendar (last 52 weeks)
     - Latest commit timestamp on this repo
   Read by main.js to render the grid + footer.
   ============================================ */

"use strict";

const fs = require("fs");
const path = require("path");

const LOGIN = process.env.GH_LOGIN;
const REPO = process.env.GH_REPO;

if (!LOGIN || !REPO) {
  console.error("GH_LOGIN and GH_REPO env vars are required.");
  process.exit(1);
}

const ENDPOINT = "https://api.github.com/graphql";

// GitHub renders contributions as Sunday-to-Saturday week columns. Start on
// a Sunday 52 weeks before the current week so the flat day list lines up
// with the grid rows and includes the current partial week.
function dateRange() {
  const now = new Date();
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  const currentWeekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  currentWeekStart.setUTCDate(
    currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay(),
  );

  const start = new Date(currentWeekStart);
  start.setUTCDate(start.getUTCDate() - 52 * 7);
  start.setUTCHours(0, 0, 0, 0);

  return { start, end };
}

function graphQL(query, variables) {
  // Prefer STATS_TOKEN (a Personal Access Token with read:user scope, tied
  // to a user identity) when provided; fall back to the auto-injected
  // GITHUB_TOKEN, which is repo-scoped and may not resolve user identity.
  const token = process.env.STATS_TOKEN || process.env.GH_TOKEN;
  if (!token)
    throw new Error("A GitHub token (STATS_TOKEN or GH_TOKEN) is required");

  const body = JSON.stringify({ query, variables });

  // Use curl (works on all Actions runners without fetch version concerns).
  const result = require("child_process").execSync(
    `curl -sS -X POST "${ENDPOINT}" ` +
      `-H "Authorization: bearer ${token}" ` +
      `-H "Content-Type: application/json" ` +
      `-H "User-Agent: ${LOGIN}" ` +
      `--data-binary @-`,
    { input: body, encoding: "utf8" },
  );

  let json;
  try {
    json = JSON.parse(result);
  } catch (e) {
    throw new Error("GraphQL response was not JSON.");
  }

  if (json.errors) {
    throw new Error("GraphQL errors: " + JSON.stringify(json.errors));
  }
  if (!json.data) {
    throw new Error("GraphQL returned no data.");
  }
  return json.data;
}

function getContributions() {
  const { start, end } = dateRange();
  const from = start.toISOString();
  const to = end.toISOString();

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }`;

  const data = graphQL(query, { login: LOGIN, from, to });

  // The repo-scoped GITHUB_TOKEN may return user: null for contribution
  // queries (token isn't tied to a user identity). Handle gracefully.
  if (!data || !data.user) {
    throw new Error(
      "GraphQL returned user: null — the default GITHUB_TOKEN cannot read contribution data. Add a PAT with read:user scope as STATS_TOKEN.",
    );
  }

  const calendar = data.user.contributionsCollection.contributionCalendar;
  if (!calendar || !Array.isArray(calendar.weeks)) {
    throw new Error(
      "Contribution calendar missing weeks array: " +
        JSON.stringify(data.user).slice(0, 500),
    );
  }

  // Flatten weeks into a flat day list: [{date, count}, ...]
  const days = [];
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      days.push({ date: day.date, count: day.contributionCount });
    }
  }

  return {
    totalContributions: calendar.totalContributions,
    days,
  };
}

function getLatestCommitTimestamp() {
  // The workflow has already checked out the default branch, so read its
  // timestamp locally instead of spending another API request. GitHub's REST
  // commits endpoint can temporarily return HTTP 429 even for authenticated
  // Actions requests.
  return require("child_process")
    .execFileSync("git", ["log", "-1", "--format=%cI", "HEAD"], {
      encoding: "utf8",
    })
    .trim();
}

function main() {
  console.log(`Generating stats for @${LOGIN}, repo ${REPO}...`);

  const outDir = path.join(process.cwd(), "data");
  const outPath = path.join(outDir, "stats.json");
  const previousStats = readPreviousStats(outPath);

  // Keep the existing contribution graph if the API has a transient failure.
  // That avoids publishing an empty grid just because a scheduled run hit an
  // auth/rate-limit/network issue.
  let totalContributions = previousStats.totalContributions || 0;
  let days = Array.isArray(previousStats.days) ? previousStats.days : [];

  try {
    const contributions = getContributions();
    totalContributions = contributions.totalContributions;
    days = contributions.days;
    console.log(
      `Contributions: ${totalContributions} total over ${days.length} days.`,
    );
  } catch (err) {
    console.warn(
      "⚠ Contribution calendar unavailable; keeping previous data:",
      err.message,
    );
  }

  const updatedAt = getLatestCommitTimestamp();

  const stats = {
    updatedAt,
    totalContributions,
    days,
    generatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2) + "\n", "utf8");

  // Keep sitemap.xml <lastmod> in sync so it never drifts.
  bumpSitemapLastmod();

  console.log(`Latest commit: ${updatedAt}`);
  console.log(`Written to ${outPath}`);
}

function readPreviousStats(outPath) {
  if (!fs.existsSync(outPath)) return {};

  try {
    return JSON.parse(fs.readFileSync(outPath, "utf8"));
  } catch (err) {
    console.warn(
      "Could not parse existing stats.json; starting fresh:",
      err.message,
    );
    return {};
  }
}

// Rewrite the <lastmod> in sitemap.xml to today's date (UTC).
function bumpSitemapLastmod() {
  const sitemapPath = path.join(process.cwd(), "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    console.warn("sitemap.xml not found; skipping lastmod bump.");
    return;
  }
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const updated = xml.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/,
    `<lastmod>${today}</lastmod>`,
  );
  if (updated !== xml) {
    fs.writeFileSync(sitemapPath, updated, "utf8");
    console.log(`Sitemap lastmod bumped to ${today}.`);
  } else {
    console.log(`Sitemap lastmod already ${today}.`);
  }
}

try {
  main();
} catch (err) {
  console.error("Failed to update stats:", err.message);
  process.exit(1);
}
