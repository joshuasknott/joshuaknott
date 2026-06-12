/* ============================================
   MAIN.JS — Joshua Knott Portfolio
   Typing animation + scroll observers
   ============================================ */

(function () {
  'use strict';

  const TEXT_LINE1 = "hello, i'm joshua.";
  const TEXT_LINE2 = "welcome to my portfolio!";
  const TYPING_SPEED = 70;         // ms per character
  const PAUSE_AFTER_TYPING = 1500; // ms before transitioning
  const OBSERVER_THRESHOLD = 0.1;

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

    // After intro fades, show portfolio
    setTimeout(function () {
      intro.style.display = 'none';
      portfolio.classList.add('visible');

      // Start observing fade-in elements after portfolio is visible
      setTimeout(initScrollObserver, 100);
    }, 800);
  }

  // --- Scroll Observer ---

  function initScrollObserver() {
    var fadeElements = document.querySelectorAll('.fade-in');

    // If IntersectionObserver is not supported, show all immediately
    if (!('IntersectionObserver' in window)) {
      fadeElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: OBSERVER_THRESHOLD }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Init ---

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
          }, 500);
        });
      })
      .then(function () {
        setTimeout(transitionToPortfolio, PAUSE_AFTER_TYPING);
      });
  });
})();
