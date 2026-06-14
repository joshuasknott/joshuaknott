/* ============================================
   UPDATE-STATS.JS
   Generates data/stats.json for the static site:
     - Account-wide contribution calendar (last 52 weeks)
     - Latest commit timestamp on this repo
   Read by main.js to render the grid + footer.
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const LOGIN = process.env.GH_LOGIN;
const REPO = process.env.GH_REPO;

if (!LOGIN || !REPO) {
  console.error('GH_LOGIN and GH_REPO env vars are required.');
  process.exit(1);
}

const ENDPOINT = 'https://api.github.com/graphql';

// 52 weeks ending today (matches GitHub's contribution view width).
function dateRange() {
  const end = new Date();
  end.setHours(23, 59, 59, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 364); // 52 * 7 - 1
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function graphQL(query, variables) {
  // GH_TOKEN is auto-injected in Actions. The contribution calendar is
  // public data; the default token can read it for any user.
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN is required');

  const body = JSON.stringify({ query, variables });

  // Use fetch (Node 18+ on Actions runners).
  const result = require('child_process').execSync(
    `curl -sS -X POST "${ENDPOINT}" ` +
      `-H "Authorization: bearer ${token}" ` +
      `-H "Content-Type: application/json" ` +
      `-H "User-Agent: ${LOGIN}" ` +
      `--data-binary @-`,
    { input: body, encoding: 'utf8' }
  );

  const json = JSON.parse(result);
  if (json.errors) {
    throw new Error('GraphQL errors: ' + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

async function getContributions() {
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
  const calendar = data.user.contributionsCollection.contributionCalendar;

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
  // Use the REST API to get the latest commit on the default branch.
  const token = process.env.GH_TOKEN;
  const result = require('child_process').execSync(
    `curl -sS "https://api.github.com/repos/${REPO}/commits/HEAD" ` +
      `-H "Authorization: token ${token}" ` +
      `-H "Accept: application/vnd.github+json" ` +
      `-H "User-Agent: ${LOGIN}"`,
    { encoding: 'utf8' }
  );
  const json = JSON.parse(result);
  if (!json.commit) {
    throw new Error('Could not read latest commit: ' + JSON.stringify(json));
  }
  return json.commit.committer.date;
}

function main() {
  console.log(`Generating stats for @${LOGIN}, repo ${REPO}...`);

  // The timestamp is the critical field for the footer; degrade gracefully
  // if the optional contribution grid query fails so the footer still works.
  let totalContributions = 0;
  let days = [];

  try {
    const contributions = getContributions();
    totalContributions = contributions.totalContributions;
    days = contributions.days;
    console.log(`Contributions: ${totalContributions} total over ${days.length} days.`);
  } catch (err) {
    console.warn('⚠ Contribution calendar unavailable; continuing without it:', err.message);
  }

  const updatedAt = getLatestCommitTimestamp();

  const stats = {
    updatedAt,
    totalContributions,
    days,
    generatedAt: new Date().toISOString(),
  };

  const outDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'stats.json');
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2) + '\n', 'utf8');

  console.log(`Latest commit: ${updatedAt}`);
  console.log(`Written to ${outPath}`);
}

try {
  main();
} catch (err) {
  console.error('Failed to update stats:', err.message);
  process.exit(1);
}
