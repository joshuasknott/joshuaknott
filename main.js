(() => {
  "use strict";
  const filters = document.querySelector(".project-filters");
  const cards = [...document.querySelectorAll(".project-card")];
  const filterStatus = document.getElementById("filter-status");
  const grids = [...document.querySelectorAll(".project-grid")];
  let stopPreviews = () => {};
  const setFilter = (category) => {
    stopPreviews();
    let count = 0;
    cards.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    filters
      ?.querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === category),
        ),
      );
    grids.forEach((grid) => {
      grid.hidden = category !== "all" && grid.dataset.projectGroup !== category;
      grid.classList.toggle("is-filtered", category !== "all");
    });
    if (filterStatus)
      filterStatus.textContent = `${count} project${count === 1 ? "" : "s"} shown`;
  };
  if (filters) {
    filters.hidden = false;
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (button) setFilter(button.dataset.filter);
    });
  }
  // Direct section links reveal the requested project even after filtering.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (!link.hasAttribute("data-project"))
      link.addEventListener("click", () => {
        if (cards.some((card) => `#${card.id}` === link.hash)) setFilter("all");
      });
  });

  const projects = JSON.parse(
    document.getElementById("project-data")?.textContent || "[]",
  );
  const dialog = document.getElementById("project-dialog");
  const cvDialog = document.getElementById("cv-dialog");
  const video = document.getElementById("walkthrough");
  const image = document.getElementById("dialog-image");
  const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const previewStates = [];
  let activePreview = null;

  const stopPreview = (state) => {
    state.request++;
    state.media.pause();
    state.card.classList.remove("is-playing");
    if (activePreview === state) activePreview = null;
  };
  stopPreviews = () => {
    if (activePreview) stopPreview(activePreview);
  };
  const startPreview = async (state) => {
    if (state.card.hidden || dialog?.open || cvDialog?.open || document.hidden) return;
    if (reducedMotion.matches || !hoverPointer.matches) return;
    // A stationary pointer must not interrupt the project selected with Tab.
    if (activePreview && activePreview !== state &&
        document.activeElement === activePreview.cover) return;
    if (activePreview === state) return;
    stopPreviews();
    activePreview = state;
    const request = ++state.request;
    if (!state.media.hasAttribute("src")) {
      state.media.src = state.project.preview || state.project.video;
    }
    // Each new tour starts at the beginning, with the poster visible until playback.
    if (state.media.readyState > 0) state.media.currentTime = 0;
    try {
      await state.media.play();
      if (request !== state.request) return;
      state.card.classList.add("is-playing");
    } catch {
      if (request !== state.request) return;
      stopPreview(state);
    }
  };

  projects.forEach((project) => {
    if (!project.video) return;
    const card = cards.find((item) => item.id === project.id);
    const cover = card?.querySelector(".project-card__visual");
    if (!cover) return;
    // Keep the project link: hover previews it, while activation opens details.
    const media = document.createElement("video");
    media.className = "project-card__preview";
    media.muted = true;
    media.defaultMuted = true;
    media.loop = true;
    media.playsInline = true;
    media.preload = "none";
    media.setAttribute("aria-hidden", "true");
    media.tabIndex = -1;
    cover.append(media);
    const state = {
      card, cover, media, project, request: 0,
    };
    previewStates.push(state);
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") startPreview(state);
    });
    card.addEventListener("pointerleave", () => {
      if (document.activeElement !== cover) stopPreview(state);
    });
    cover.addEventListener("focus", () => startPreview(state));
    cover.addEventListener("blur", () => stopPreview(state));
    media.addEventListener("error", () => {
      stopPreview(state);
    });
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && activePreview?.card === entry.target) {
          const bounds = entry.target.getBoundingClientRect();
          if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) stopPreviews();
        }
      });
    }, { threshold: 0 });
    previewStates.forEach((state) => observer.observe(state.card));
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPreviews();
  });
  window.addEventListener("blur", stopPreviews);
  reducedMotion.addEventListener("change", stopPreviews);
  hoverPointer.addEventListener("change", stopPreviews);

  let opener = null;
  let previousHash = "";
  let modalRequest = 0;
  const fitModal = () => {
    const width = video.hidden ? image.naturalWidth : video.videoWidth;
    const height = video.hidden ? image.naturalHeight : video.videoHeight;
    if (width && height) dialog.style.setProperty("--media-ratio", width / height);
  };
  const showModalPoster = () => {
    video.pause();
    video.hidden = true;
    image.hidden = false;
    fitModal();
  };
  video?.addEventListener("loadedmetadata", fitModal);
  image?.addEventListener("load", fitModal);
  const linkFor = (href, label) => {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label;
    const icon = document.createElement("img");
    icon.src = "assets/icons/arrow-up-right.svg";
    icon.alt = "";
    icon.className = "icon";
    anchor.append(icon);
    return anchor;
  };
  const openProject = (id, trigger) => {
    stopPreviews();
    const project = projects.find((item) => item.id === id);
    if (!project || !dialog || typeof dialog.showModal !== "function") return;
    const request = ++modalRequest;
    const card = cards.find((item) => item.id === id);
    if (card?.hidden) setFilter("all");
    opener =
      trigger ||
      document.querySelector(`[data-project="${id}"]`) ||
      document.activeElement;
    dialog.setAttribute("aria-label", `${project.name} preview`);
    const poster = card?.querySelector(".project-card__image");
    dialog.style.setProperty("--media-ratio", poster?.naturalWidth && poster.naturalHeight
      ? poster.naturalWidth / poster.naturalHeight : 1.6);
    image.src = project.poster;
    image.alt = project.alt || `${project.name} running locally`;
    image.hidden = Boolean(project.video);
    video.hidden = !project.video;
    video.pause();
    video.removeAttribute("src");
    video.load();
    if (project.video) {
      video.poster = project.poster;
      video.src = project.video;
      video.load();
    }
    const links = document.getElementById("dialog-links");
    links.replaceChildren();
    const destination = project.visit || project.source;
    if (destination) links.append(linkFor(destination, `View ${project.displayName || project.name}`));
    if (project.visit && project.showSource && project.source) {
      links.append(linkFor(project.source, "View source"));
    }
    if (!dialog.open) {
      previousHash = location.hash.startsWith("#project-")
        ? "#work"
        : location.hash;
      dialog.showModal();
      document.body.classList.add("has-dialog");
      history.pushState(null, "", `#project-${project.id}`);
    }
    dialog.querySelector(".dialog-close").focus();
    if (project.video) {
      video.play().catch(() => {
        if (request === modalRequest && dialog.open) showModalPoster();
      });
    }
  };
  document.querySelectorAll("[data-project]").forEach((trigger) =>
    trigger.addEventListener("click", (event) => {
      if (!dialog || typeof dialog.showModal !== "function") return;
      event.preventDefault();
      openProject(trigger.dataset.project, trigger);
    }),
  );
  dialog
    ?.querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !dialog.open) return;
    const stops = [
      ...dialog.querySelectorAll("button, a[href]"),
    ].filter((element) => !element.disabled && element.getClientRects().length);
    const first = stops[0],
      last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog?.addEventListener("close", () => {
    modalRequest++;
    video.pause();
    video.removeAttribute("src");
    video.load();
    document.body.classList.remove("has-dialog");
    history.replaceState(
      null,
      "",
      `${location.pathname}${location.search}${previousHash}`,
    );
    opener?.focus();
  });
  video?.addEventListener("error", () => {
    if (!video.hasAttribute("src")) return;
    showModalPoster();
  });
  const openFromHash = () => {
    if (location.hash.startsWith("#project-"))
      openProject(location.hash.slice(9));
    else if (dialog?.open) dialog.close();
  };
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
  window.addEventListener("popstate", openFromHash);

  let cvOpener = null;
  const cvPages = cvDialog?.querySelector(".cv-dialog__pages");
  const cvZoom = cvDialog?.querySelector(".cv-dialog__zoom");
  document.querySelectorAll("[data-cv-preview]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      // Keep normal PDF navigation when JavaScript/dialogs are unavailable,
      // or when visitors explicitly open the link in another tab.
      if (!cvDialog || typeof cvDialog.showModal !== "function" ||
          event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      stopPreviews();
      cvOpener = trigger;
      const preview = cvPages.querySelector("img");
      if (!preview.hasAttribute("src")) preview.src = preview.dataset.src;
      cvDialog.showModal();
      document.body.classList.add("has-dialog");
      cvPages.scrollTo(0, 0);
    });
  });
  cvZoom?.addEventListener("click", () => {
    const zoomed = cvPages.classList.toggle("is-zoomed");
    cvZoom.setAttribute("aria-pressed", String(zoomed));
    cvZoom.setAttribute("aria-label", zoomed ? "Zoom out of CV" : "Zoom in on CV");
    cvZoom.title = zoomed ? "Click to zoom out" : "Click to zoom in";
  });
  cvDialog?.querySelector(".cv-dialog__close").addEventListener("click", () => cvDialog.close());
  cvDialog?.addEventListener("click", (event) => {
    if (event.target !== cvDialog) return;
    const bounds = cvDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) cvDialog.close();
  });
  cvDialog?.addEventListener("close", () => {
    if (!dialog?.open) document.body.classList.remove("has-dialog");
    cvPages.classList.remove("is-zoomed");
    cvZoom.setAttribute("aria-pressed", "false");
    cvZoom.setAttribute("aria-label", "Zoom in on CV");
    cvZoom.title = "Click to zoom in";
    cvOpener?.focus({ preventScroll: true });
  });

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
    const date = new Date(
      stats.contributionsUpdatedAt || stats.generatedAt || stats.updatedAt,
    );
    if (Number.isNaN(date.getTime()) || date.getTime() < latestActivity) return;
    latestActivity = date.getTime();
    const grid = document.createElement("div");
    grid.className = "contributions-grid";
    // The rolling year can begin mid-week. Keep Sundays in the first row.
    const firstWeekday = new Date(
      `${stats.days[0].date}T00:00:00Z`,
    ).getUTCDay();
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
  [
    "data/stats.json",
    "https://raw.githubusercontent.com/joshuasknott/joshuaknott/main/data/stats.json",
  ].forEach((url) =>
    fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(8000) })
      .then((response) => {
        if (!response.ok) throw new Error("Activity unavailable");
        return response.json();
      })
      .then(renderActivity)
      .catch(() => {
        /* Activity is optional; project content remains available. */
      }),
  );
  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());
  document.documentElement.dataset.ready = "true";
})();
