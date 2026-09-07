const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { dateRange, graphQL, readPreviousStats, getLatestCommitTimestamp } = require("./update-stats.js");

test("the contribution range starts on Sunday and stays within a year on every weekday", () => {
  for (let day = 6; day <= 12; day++) {
    const now = new Date(Date.UTC(2026, 8, day, 12));
    const { start, end } = dateRange(now);
    assert.equal(start.getUTCDay(), 0);
    assert.ok(end - start < 365 * 86400000);
    assert.equal(end.getUTCDate(), now.getUTCDate());
    assert.equal(now.getUTCHours(), 12);
  }
});

test("GraphQL sends credentials via fetch and rejects HTTP/JSON failures", async (t) => {
  const previous = process.env.STATS_TOKEN;
  process.env.STATS_TOKEN = "synthetic-token";
  t.after(() => { if (previous === undefined) delete process.env.STATS_TOKEN; else process.env.STATS_TOKEN = previous; });
  const fetch = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.github.com/graphql");
    assert.equal(options.headers.Authorization, "bearer synthetic-token");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ data: { ok: true } });
  });
  assert.deepEqual(await graphQL("query", {}), { ok: true });
  fetch.mock.mockImplementation(async () => new Response("synthetic-token", { status: 503 }));
  await assert.rejects(graphQL("query", {}), /HTTP 503/);
  fetch.mock.mockImplementation(async () => Response.json(null));
  await assert.rejects(graphQL("query", {}), /no data/);
  fetch.mock.mockImplementation(async () => new Response("not json"));
  await assert.rejects(graphQL("query", {}), /not JSON/);
});

test("non-object previous stats do not break fallback updates", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-stats-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "stats.json");
  for (const value of ["null", "[]", "42"]) {
    fs.writeFileSync(file, value);
    assert.deepEqual(readPreviousStats(file), {});
  }
});

test("scheduled stats-only commits do not change the displayed content timestamp", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-history-"));
  const cwd = process.cwd();
  t.after(() => { process.chdir(cwd); fs.rmSync(dir, { recursive: true, force: true }); });
  const git = (args, date) => execFileSync("git", args, { cwd: dir, env: { ...process.env, GIT_AUTHOR_NAME: "Test", GIT_AUTHOR_EMAIL: "test@example.test", GIT_COMMITTER_NAME: "Test", GIT_COMMITTER_EMAIL: "test@example.test", GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
  git(["init", "-q"], "2026-09-01T12:00:00Z");
  fs.writeFileSync(path.join(dir, "index.html"), "Portfolio");
  git(["add", "."], "2026-09-01T12:00:00Z");
  git(["commit", "-qm", "Content"], "2026-09-01T12:00:00Z");
  fs.mkdirSync(path.join(dir, "data"));
  fs.writeFileSync(path.join(dir, "data/stats.json"), "{}");
  git(["add", "."], "2026-09-08T12:00:00Z");
  git(["commit", "-qm", "Stats refresh"], "2026-09-08T12:00:00Z");
  process.chdir(dir);
  assert.equal(new Date(getLatestCommitTimestamp()).toISOString(), "2026-09-01T12:00:00.000Z");
});
