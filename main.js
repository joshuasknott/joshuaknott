/* ============================================
   MAIN.JS — Joshua Knott Portfolio
   Typing animation + contribution grid
   ============================================ */

(function () {
  'use strict';

  const TEXT_LINE1 = "hello, i'm josh.";
  const TEXT_LINE2 = "welcome to my website!";
  const TYPING_SPEED = 50;         // ms per character
  const PAUSE_AFTER_TYPING = 1200; // ms before transitioning

  // --- Typing Animation ---

  function typeText(element, text, speed) {
    return new Promise(function (resolve) {
      let i = 0;

      function tick() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      }

      tick();
    });
  }

  function transitionToPortfolio() {
    var intro = document.getElementById('intro');
    var portfolio = document.getElementById('portfolio');

    // Hide blinking cursors
    document.getElementById('cursor-text').classList.add('hidden');
    document.getElementById('cursor-subtext').classList.add('hidden');

    // Fade out intro
    intro.classList.add('hidden');

    // After intro fades, show portfolio and reveal all content together
    setTimeout(function () {
      intro.style.display = 'none';
      portfolio.classList.add('visible');

      // Reveal header, About, and all projects together
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
    }, 800);
  }

  // --- Init ---

  function loadStats() {
    fetch('/data/stats.json')
      .then(function (res) { return res.json(); })
      .then(function (stats) {
        renderFooter(stats.updatedAt);
        renderContributions(stats);
      })
      .catch(function () {
        // Stats are non-critical; hide the section on failure.
        var section = document.getElementById('contributions');
        if (section) section.style.display = 'none';
      });
  }

  function renderFooter(updatedAt) {
    var el = document.getElementById('last-updated');
    if (!el || !updatedAt) return;

    var date = new Date(updatedAt);
    el.setAttribute('datetime', updatedAt);
    el.textContent = date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function renderContributions(stats) {
    var container = document.getElementById('contributions-grid');
    if (!container) return;

    // No data (seed file or contribution query failed upstream) — hide the section.
    if (!stats.days || !stats.days.length) {
      var section = document.getElementById('contributions');
      if (section) section.style.display = 'none';
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'contributions__grid';

    stats.days.forEach(function (day) {
      var cell = document.createElement('div');
      cell.className = 'contributions__cell';
      cell.setAttribute('data-level', levelForCount(day.count));
      cell.setAttribute('title', day.count + ' contribution' + (day.count === 1 ? '' : 's') + ' on ' + day.date);
      grid.appendChild(cell);
    });

    container.innerHTML = '';
    container.appendChild(grid);
  }

  // Map a day's contribution count to a 0-4 intensity level.
  // Thresholds tuned for a typical personal account's spread.
  function levelForCount(count) {
    if (count <= 0) return '0';
    if (count <= 2) return '1';
    if (count <= 5) return '2';
    if (count <= 9) return '3';
    return '4';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var typedTextEl = document.getElementById('typed-text');
    var typedSubTextEl = document.getElementById('typed-subtext');

    // Check for reduced motion preference
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip animation entirely
      typedTextEl.textContent = TEXT_LINE1;
      typedSubTextEl.textContent = TEXT_LINE2;
      document.getElementById('intro').style.display = 'none';
      var portfolio = document.getElementById('portfolio');
      portfolio.classList.add('visible');
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
      loadStats();
      return;
    }

    // The intro text is present in HTML for no-JavaScript users and crawlers.
    typedTextEl.textContent = '';
    typedSubTextEl.textContent = '';

    // Type first line
    typeText(typedTextEl, TEXT_LINE1, TYPING_SPEED)
      .then(function () {
        // Brief pause, switch cursor to second line, then type second line
        return new Promise(function (resolve) {
          setTimeout(function () {
            document.getElementById('cursor-text').classList.add('hidden');
            document.getElementById('cursor-subtext').classList.remove('hidden');
            typeText(typedSubTextEl, TEXT_LINE2, TYPING_SPEED).then(resolve);
          }, 400);
        });
      })
      .then(function () {
        document.getElementById('cursor-subtext').classList.add('hidden');
        setTimeout(transitionToPortfolio, PAUSE_AFTER_TYPING);
      });

    // Stats load independently of the intro animation
    loadStats();
  });
})();
