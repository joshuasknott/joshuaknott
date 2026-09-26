(() => {
  "use strict";
  const shotDirectory = "assets/projects/2026-09/";
  const header = document.getElementById("site-header");
  const updateHeader = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 70);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const shot = gallery.querySelector("[data-shot]");
    const image = shot?.querySelector("img");
    const buttons = [...gallery.querySelectorAll("[data-view]")];
    let selection = 0;
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        if (!image || !shot) return;
        const request = ++selection;
        const source = `${shotDirectory}${button.dataset.view}.webp`;
        const preload = new Image();
        preload.onload = () => {
          if (request !== selection) return;
          image.src = source;
          image.alt = button.dataset.alt || "";
          image.width = preload.naturalWidth;
          image.height = preload.naturalHeight;
          shot.href = source;
          shot.dataset.caption = button.dataset.caption || "";
          const projectName =
            gallery.closest("article")?.querySelector("h2")?.textContent ||
            "product";
          shot.setAttribute(
            "aria-label",
            `Enlarge ${projectName} ${button.textContent.trim()} screenshot`,
          );
          buttons.forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        };
        preload.src = source;
      }),
    );
  });

  const dialog = document.querySelector(".shot-dialog");
  const dialogImage = document.getElementById("shot-dialog-image");
  const dialogCaption = document.getElementById("shot-dialog-caption");
  const zoomButton = dialog?.querySelector(".shot-dialog__zoom");
  const imageViewport = dialog?.querySelector(".shot-dialog__viewport");
  let activeShot = null;
  function setZoom(zoomed) {
    dialog?.classList.toggle("is-zoomed", zoomed);
    zoomButton?.setAttribute("aria-pressed", String(zoomed));
    if (zoomButton)
      zoomButton.textContent = zoomed ? "Fit to screen" : "View actual size";
    if (imageViewport) imageViewport.scrollTo(0, 0);
  }
  if (
    dialog &&
    dialogImage &&
    dialogCaption &&
    typeof dialog.showModal === "function"
  ) {
    document.querySelectorAll("[data-shot]").forEach((shot) =>
      shot.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        activeShot = shot;
        dialogImage.src = shot.href;
        dialogImage.alt = shot.querySelector("img")?.alt || "";
        dialogCaption.textContent = shot.dataset.caption || "";
        setZoom(false);
        dialog.showModal();
        dialog.querySelector(".shot-dialog__close")?.focus();
      }),
    );
    dialog
      .querySelector(".shot-dialog__close")
      ?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      dialogImage.removeAttribute("src");
      dialogImage.alt = "";
      activeShot?.focus({ preventScroll: true });
      activeShot = null;
    });
    zoomButton?.addEventListener("click", () =>
      setZoom(!dialog.classList.contains("is-zoomed")),
    );
  }

  const petImage = document.getElementById("mote-pet");
  const petCaption = document.getElementById("pet-caption");
  const petButtons = [...document.querySelectorAll("[data-pet]")];
  let petSelection = 0;
  petButtons.forEach((button) =>
    button.addEventListener("click", () => {
      if (!petImage) return;
      const request = ++petSelection;
      const source = `${shotDirectory}mote-${button.dataset.pet}.webp`;
      const preload = new Image();
      preload.onload = () => {
        if (request !== petSelection) return;
        petImage.classList.remove("is-arriving");
        petImage.src = source;
        petImage.alt = button.dataset.petAlt || "";
        requestAnimationFrame(() => petImage.classList.add("is-arriving"));
        petButtons.forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
        if (petCaption)
          petCaption.textContent = `${button.textContent.trim()} · Artwork from Mote’s native renderer`;
      };
      preload.src = source;
    }),
  );

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
