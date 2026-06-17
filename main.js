/* ============================================
   MAIN.JS — Joshua Knott Portfolio
   Typing animation + contribution grid
   ============================================ */

(function () {
  "use strict";

  const TEXT_LINE1 = "hello, i'm josh.";
  const TEXT_LINE2 = "welcome to my website!";
  const TYPING_SPEED = 50; // ms per character
  const PAUSE_AFTER_TYPING = 1200; // ms before transitioning
  const SKIP_STORAGE_KEY = "jk-intro-played";

  let typingTimers = [];
  let transitioned = false;
  let skipListenersBound = false;

  function clearTypingTimers() {
    typingTimers.forEach(clearTimeout);
    typingTimers = [];
  }

  // Mark the intro as played so a refresh within the session won't replay it.
  function markPlayed() {
    try {
      sessionStorage.setItem(SKIP_STORAGE_KEY, "1");
    } catch (e) {}
  }

  // --- Typing Animation ---

  function typeText(element, text, speed) {
    return new Promise(function (resolve) {
      let i = 0;

      function tick() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          typingTimers.push(setTimeout(tick, speed));
        } else {
          resolve();
        }
      }

      tick();
    });
  }

  function transitionToPortfolio() {
    if (transitioned) return;
    transitioned = true;

    clearTypingTimers();
    removeSkipListeners();
    markPlayed();

    var intro = document.getElementById("intro");
    var portfolio = document.getElementById("portfolio");

    // Hide blinking cursors
    document.getElementById("cursor-text").classList.add("hidden");
    document.getElementById("cursor-subtext").classList.add("hidden");

    // Fade out intro
    intro.classList.add("hidden");

    // After intro fades, show portfolio and reveal all content together
    setTimeout(function () {
      intro.style.display = "none";
      portfolio.classList.add("visible");

      // Reveal header, About, and all projects together
      document.querySelectorAll(".fade-in").forEach(function (el) {
        el.classList.add("visible");
      });
    }, 800);
  }

  // --- Skip-listeners (click / keypress to skip the intro) ---

  function onSkipKey() {
    transitionToPortfolio();
  }

  function removeSkipListeners() {
    if (!skipListenersBound) return;
    skipListenersBound = false;
    document.removeEventListener("keydown", onSkipKey);
    var intro = document.getElementById("intro");
    if (intro) intro.removeEventListener("click", transitionToPortfolio);
  }

  function bindSkipListeners() {
    if (skipListenersBound) return;
    skipListenersBound = true;
    document.addEventListener("keydown", onSkipKey);
    var intro = document.getElementById("intro");
    if (intro) intro.addEventListener("click", transitionToPortfolio);
  }

  // --- Stats / Contributions ---

  function loadStats() {
    var statsUrl = "/data/stats.json?v=" + Date.now();

    fetch(statsUrl, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Stats request failed");
        return res.json();
      })
      .then(function (stats) {
        renderFooter(stats.updatedAt);
        renderContributions(stats);
      })
      .catch(function () {
        // Stats are non-critical; hide the section on failure.
        var section = document.getElementById("contributions");
        if (section) section.style.display = "none";
      });
  }

  function renderFooter(updatedAt) {
    var el = document.getElementById("last-updated");
    if (!el || !updatedAt) return;

    var date = new Date(updatedAt);
    el.setAttribute("datetime", updatedAt);
    el.textContent = date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderContributions(stats) {
    var container = document.getElementById("contributions-grid");
    if (!container) return;

    // No data (seed file or contribution query failed upstream) — hide the section.
    if (!stats.days || !stats.days.length) {
      var section = document.getElementById("contributions");
      if (section) section.style.display = "none";
      return;
    }

    var grid = document.createElement("div");
    grid.className = "contributions__grid";

    // Tooltip text, built defensively (title is decorative; the grid is
    // aria-hidden, so the accessible summary is the count text above it).
    stats.days.forEach(function (day) {
      var cell = document.createElement("div");
      cell.className = "contributions__cell";
      cell.setAttribute("data-level", levelForCount(day.count));
      cell.setAttribute(
        "title",
        day.count +
          " contribution" +
          (day.count === 1 ? "" : "s") +
          " on " +
          day.date,
      );
      grid.appendChild(cell);
    });

    container.innerHTML = "";
    container.appendChild(grid);

    renderMonthLabels(stats.days);

    // Render the total count above the grid
    var countEl = document.getElementById("contributions-count");
    if (countEl) {
      var total = stats.totalContributions || 0;
      countEl.textContent =
        total.toLocaleString("en-GB") +
        " contribution" +
        (total === 1 ? "" : "s");
    }
  }

  // Label the first week of each month under the grid, like GitHub does.
  // The day list is flat (one entry per day, oldest first); a month label is
  // placed on the week column where the month first appears.
  function renderMonthLabels(days) {
    var monthsEl = document.getElementById("contributions-months");
    if (!monthsEl) return;

    var MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var labels = [];
    var lastMonth = -1;

    // Group days into weeks of 7. Column 0 is the first (oldest) week.
    var weekCount = Math.ceil(days.length / 7);

    for (var w = 0; w < weekCount; w++) {
      var dayIndex = w * 7;
      var day = days[dayIndex];
      if (!day) {
        labels.push("");
        continue;
      }
      var month = new Date(day.date).getMonth();
      if (month !== lastMonth) {
        labels.push(MONTHS[month]);
        lastMonth = month;
      } else {
        labels.push("");
      }
    }

    monthsEl.innerHTML = "";
    // Use a CSS grid that mirrors the grid columns so labels align to weeks.
    monthsEl.style.gridTemplateColumns =
      "repeat(" + weekCount + ", var(--contrib-cell))";
    labels.forEach(function (label) {
      var span = document.createElement("span");
      span.textContent = label;
      monthsEl.appendChild(span);
    });
  }

  // Map a day's contribution count to a 0-4 intensity level.
  // Thresholds tuned for a typical personal account's spread.
  function levelForCount(count) {
    if (count <= 0) return "0";
    if (count <= 2) return "1";
    if (count <= 5) return "2";
    if (count <= 9) return "3";
    return "4";
  }

  // --- Init ---

  function playIntroAnimation() {
    var typedTextEl = document.getElementById("typed-text");
    var typedSubTextEl = document.getElementById("typed-subtext");

    // The intro text is present in HTML for no-JavaScript users and crawlers.
    typedTextEl.textContent = "";
    typedSubTextEl.textContent = "";

    // Type first line
    typeText(typedTextEl, TEXT_LINE1, TYPING_SPEED)
      .then(function () {
        // Brief pause, switch cursor to second line, then type second line
        return new Promise(function (resolve) {
          typingTimers.push(
            setTimeout(function () {
              document.getElementById("cursor-text").classList.add("hidden");
              document
                .getElementById("cursor-subtext")
                .classList.remove("hidden");
              typeText(typedSubTextEl, TEXT_LINE2, TYPING_SPEED).then(resolve);
            }, 400),
          );
        });
      })
      .then(function () {
        document.getElementById("cursor-subtext").classList.add("hidden");
        typingTimers.push(
          setTimeout(transitionToPortfolio, PAUSE_AFTER_TYPING),
        );
      });
  }

  function showPortfolioImmediately() {
    var typedTextEl = document.getElementById("typed-text");
    var typedSubTextEl = document.getElementById("typed-subtext");
    typedTextEl.textContent = TEXT_LINE1;
    typedSubTextEl.textContent = TEXT_LINE2;
    document.getElementById("intro").style.display = "none";
    var portfolio = document.getElementById("portfolio");
    portfolio.classList.add("visible");
    document.querySelectorAll(".fade-in").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      showPortfolioImmediately();
      loadStats();
      return;
    }

    var alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(SKIP_STORAGE_KEY) === "1";
    } catch (e) {
      // sessionStorage may be unavailable (private mode); play the intro.
    }

    if (alreadyPlayed) {
      // Skip the intro for repeat visitors in the same session.
      showPortfolioImmediately();
      loadStats();
      return;
    }

    playIntroAnimation();
    loadStats();
    bindSkipListeners();
  });
})();
