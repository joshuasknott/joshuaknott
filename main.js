(function () {
  "use strict";

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;

    function updateHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  function initRevealMotion() {
    var elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08,
      },
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initProjectNavigation() {
    var projects = Array.from(document.querySelectorAll("[data-project]"));
    var links = Array.from(document.querySelectorAll("[data-project-link]"));
    if (!projects.length || !links.length || !("IntersectionObserver" in window)) {
      return;
    }

    var visibleProjects = new Map();
    var activeProjectId = "";

    function updateActiveProject() {
      if (!visibleProjects.size) return;

      var active = Array.from(visibleProjects.entries())
        .filter(function (entry) {
          return entry[1].isIntersecting;
        })
        .sort(function (a, b) {
          return Math.abs(a[1].boundingClientRect.top) -
            Math.abs(b[1].boundingClientRect.top);
        })[0];

      if (!active) return;

      var activeLink = null;
      links.forEach(function (link) {
        var isActive = link.getAttribute("data-project-link") === active[0];
        if (isActive) {
          link.setAttribute("aria-current", "location");
          activeLink = link;
        } else {
          link.removeAttribute("aria-current");
        }
      });

      if (active[0] !== activeProjectId && activeLink) {
        activeProjectId = active[0];
        var rail = activeLink.parentElement;
        var targetLeft =
          activeLink.offsetLeft +
          activeLink.offsetWidth / 2 -
          rail.clientWidth / 2;
        rail.scrollTo({
          left: targetLeft,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
      }
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visibleProjects.set(entry.target.id, entry);
        });
        updateActiveProject();
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0, 0.01, 0.2],
      },
    );

    projects.forEach(function (project) {
      observer.observe(project);
    });
  }

  function initShotModal() {
    var modal = document.getElementById("shot-modal");
    var image = document.getElementById("shot-modal-image");
    var caption = document.getElementById("shot-modal-caption");
    var closeButton = document.querySelector("[data-shot-close]");
    var triggers = Array.from(document.querySelectorAll("[data-shot]"));
    var activeTrigger = null;

    if (
      !modal ||
      !image ||
      !caption ||
      !closeButton ||
      typeof modal.showModal !== "function"
    ) {
      return;
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var sourceImage = trigger.querySelector("img");
        if (!sourceImage) return;

        activeTrigger = trigger;
        image.src = sourceImage.currentSrc || sourceImage.src;
        image.alt = sourceImage.alt || "";
        caption.textContent =
          trigger.getAttribute("data-shot-title") || "Product screenshot";
        modal.setAttribute("aria-label", caption.textContent);
        modal.showModal();
        closeButton.focus();
      });
    });

    function closeModal() {
      if (modal.open) modal.close();
    }

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });

    modal.addEventListener("close", function () {
      image.removeAttribute("src");
      image.alt = "";
      caption.textContent = "";
      if (activeTrigger) activeTrigger.focus();
      activeTrigger = null;
    });
  }

  function levelForCount(count) {
    if (count <= 0) return "0";
    if (count <= 2) return "1";
    if (count <= 5) return "2";
    if (count <= 9) return "3";
    return "4";
  }

  function renderMonthLabels(days) {
    var container = document.getElementById("contributions-months");
    if (!container) return;

    var monthNames = [
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
    var weekCount = Math.ceil(days.length / 7);
    var lastMonth = -1;

    container.innerHTML = "";
    container.style.gridTemplateColumns =
      "repeat(" + weekCount + ", var(--contrib-cell))";

    for (var week = 0; week < weekCount; week += 1) {
      var day = days[week * 7];
      var label = document.createElement("span");

      if (day) {
        var month = new Date(day.date + "T12:00:00").getMonth();
        if (month !== lastMonth) {
          label.textContent = monthNames[month];
          lastMonth = month;
        }
      }

      container.appendChild(label);
    }
  }

  function renderContributions(stats) {
    var section = document.getElementById("contributions");
    var container = document.getElementById("contributions-grid");
    var count = document.getElementById("contributions-count");
    var days = Array.isArray(stats.days) ? stats.days : [];

    if (!section || !container || !days.length) {
      if (section) section.hidden = true;
      return;
    }

    var grid = document.createElement("div");
    grid.className = "contributions__grid";

    days.forEach(function (day) {
      var cell = document.createElement("div");
      var contributionCount = Number(day.count) || 0;
      cell.className = "contributions__cell";
      cell.setAttribute("data-level", levelForCount(contributionCount));
      cell.title =
        contributionCount +
        " contribution" +
        (contributionCount === 1 ? "" : "s") +
        " on " +
        day.date;
      grid.appendChild(cell);
    });

    container.replaceChildren(grid);
    renderMonthLabels(days);

    if (count) {
      var total = Number(stats.totalContributions) || 0;
      count.textContent =
        total.toLocaleString("en-GB") +
        " contribution" +
        (total === 1 ? "" : "s") +
        " in the past year";
    }
  }

  function renderLastUpdated(updatedAt) {
    var target = document.getElementById("last-updated");
    if (!target || !updatedAt) return;

    var date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return;

    target.dateTime = updatedAt;
    target.textContent = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function loadStats() {
    fetch("data/stats.json?v=" + Date.now(), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Stats request failed");
        return response.json();
      })
      .then(function (stats) {
        renderContributions(stats);
        renderLastUpdated(stats.updatedAt);
      })
      .catch(function () {
        var section = document.getElementById("contributions");
        if (section) section.hidden = true;
      });
  }

  function initFooterYear() {
    var target = document.getElementById("current-year");
    if (target) target.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initRevealMotion();
    initProjectNavigation();
    initShotModal();
    initFooterYear();
    loadStats();
  });
})();
