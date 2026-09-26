(() => {
  "use strict";
  const header = document.getElementById("site-header");
  const updateHeader = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 70);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const societyImage = document.getElementById("society-shot");
  const societyViews = document.querySelector(".society-views");
  if (societyImage && societyViews) {
    const buttons = [...societyViews.querySelectorAll("[data-society]")];
    let selection = 0;
    buttons.forEach((button) => button.addEventListener("click", () => {
      const request = ++selection;
      const preload = new Image();
      preload.onload = () => {
        if (request !== selection) return;
        societyImage.src = preload.src;
        societyImage.alt = button.dataset.alt;
        societyImage.width = preload.naturalWidth;
        societyImage.height = preload.naturalHeight;
        buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      };
      preload.src = `assets/projects/2026-09/surrey-${button.dataset.society}.webp`;
    }));
    societyViews.hidden = false;
  }

  let latestActivity = -Infinity;
  function renderActivity(stats) {
    const activity = document.getElementById("contributions");
    const container = document.getElementById("contributions-grid");
    const count = document.getElementById("contributions-count");
    const updated = document.getElementById("last-updated");
    if (
      !activity ||
      !container ||
      !count ||
      !updated ||
      !Array.isArray(stats.days) ||
      !stats.days.length
    )
      return;
    const date = new Date(stats.contributionsUpdatedAt || stats.generatedAt || stats.updatedAt);
    if (Number.isNaN(date.getTime()) || date.getTime() < latestActivity) return;
    latestActivity = date.getTime();
    const grid = document.createElement("div");
    grid.className = "contributions-grid";
    // The rolling year can begin mid-week. Keep Sundays in the first row.
    const firstWeekday = new Date(`${stats.days[0].date}T00:00:00Z`).getUTCDay();
    for (let day = 0; day < firstWeekday; day++) {
      const spacer = document.createElement("span");
      spacer.setAttribute("aria-hidden", "true");
      grid.appendChild(spacer);
    }
    stats.days.forEach((day) => {
      const value = Number(day.count) || 0;
      const cell = document.createElement("span");
      cell.className = "contribution-cell";
      cell.dataset.level = String(
        value <= 0 ? 0 : value <= 2 ? 1 : value <= 5 ? 2 : value <= 9 ? 3 : 4,
      );
      cell.title = `${value} contribution${value === 1 ? "" : "s"} on ${day.date}`;
      grid.appendChild(cell);
    });
    container.replaceChildren(grid);
    const total = Number(stats.totalContributions) || 0;
    count.textContent = `${total.toLocaleString("en-GB")} contributions in the past year`;
    updated.dateTime = date.toISOString();
    updated.textContent = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    activity.hidden = false;
  }
  // Local data works offline; the latest generated snapshot also keeps previews
  // and GitHub Pages current between site deployments. Never replace newer data.
  ["data/stats.json", "https://raw.githubusercontent.com/joshuasknott/joshuaknott/main/data/stats.json"].forEach((url) => fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(8000) })
    .then((response) => {
      if (!response.ok) throw new Error("Activity unavailable");
      return response.json();
    })
    .then(renderActivity)
    .catch(() => {
      /* Activity is optional; project content remains available. */
    }));
  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());
  document.documentElement.dataset.ready = "true";
})();
