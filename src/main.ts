import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Cpu,
  ExternalLink,
  GraduationCap,
  Mail,
  Menu,
  Music,
  Sparkles,
  X,
  createIcons,
} from "lucide";
import "./styles.css";

type Social = Readonly<{
  label: string;
  href: string;
  icon: "email" | "github" | "linkedin" | "x" | "instagram";
}>;

type SceneLink = Readonly<{
  id: string;
  label: string;
  shortLabel: string;
}>;

type EvidenceAsset = Readonly<{
  src: string;
  alt: string;
  label: string;
}>;

type ProjectFeature = Readonly<{
  label: string;
  detail: string;
}>;

type Project = Readonly<{
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  status: string;
  logo?: string;
  screenshot?: EvidenceAsset;
  shots?: readonly EvidenceAsset[];
  features: readonly ProjectFeature[];
  stack: readonly string[];
  proof: string;
}>;

type SideProject = Readonly<{
  title: string;
  note: string;
  image: string;
  alt: string;
  tone: "ink" | "blue" | "green";
}>;

type Role = Readonly<{
  title: string;
  context: string;
  detail: string;
  icon: string;
}>;

const email = "joshhknott@gmail.com";

const socials: readonly Social[] = [
  { label: "Email", href: `mailto:${email}`, icon: "email" },
  { label: "GitHub", href: "https://github.com/joshuasknott", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/joshua-k-618270217/",
    icon: "linkedin",
  },
  { label: "X", href: "https://x.com/joshuasknott", icon: "x" },
  { label: "Instagram", href: "https://www.instagram.com/joshuasknott/", icon: "instagram" },
];

const sceneLinks: readonly SceneLink[] = [
  { id: "opening", label: "Opening", shortLabel: "01" },
  { id: "range", label: "Range", shortLabel: "02" },
  { id: "memvella", label: "Memvella", shortLabel: "03" },
  { id: "societies", label: "Societies", shortLabel: "04" },
  { id: "polis", label: "Polis", shortLabel: "05" },
  { id: "experiments", label: "Experiments", shortLabel: "06" },
  { id: "roles", label: "Roles", shortLabel: "07" },
  { id: "contact", label: "Contact", shortLabel: "08" },
];

const memvella: Project = {
  id: "memvella",
  eyebrow: "Solo ongoing product",
  title: "Memvella",
  summary:
    "An AI digital wellness companion for early-stage cognitive decline, seniors, and the families carrying the hidden coordination burden.",
  status: "Current state: product app, marketing surface, Convex backend, voice work, family Circle flows, senior tablet/independent pathways.",
  logo: "/assets/logos/optimized/memvella-icon.png",
  screenshot: {
    src: "/assets/shots/memvella-marketing.png",
    alt: "Local Memvella marketing demo screenshot",
    label: "Captured from local Memvella marketing demo",
  },
  features: [
    {
      label: "Humane product thesis",
      detail:
        "Grounding, routines, memories, and a familiar voice without framing the product as diagnosis or treatment.",
    },
    {
      label: "Family burden",
      detail:
        "Circle coordination gives organisers and members a lightweight place to keep care context from becoming scattered.",
    },
    {
      label: "Senior-first surfaces",
      detail:
        "Assisted tablet and independent flows are designed for low-friction voice-led interaction and clear recovery paths.",
    },
  ],
  stack: ["Next.js 16", "React 19", "Convex", "Better Auth", "Gemini Live", "PNPM/Turbo"],
  proof:
    "Verified from the Memvella local repo docs and a localhost marketing screenshot. Product app localhost rendered through HTTP but the browser capture timed out, so no product-app screenshot is shown.",
};

const societies: Project = {
  id: "societies",
  eyebrow: "Solo public website system",
  title: "Surrey Societies",
  summary:
    "Three distinct public websites for University of Surrey societies, grown from Surrey Business Society into AI, Business, and Neurotech.",
  status:
    "Current state: local Astro demos for all three public sites captured from localhost with verified society-specific identities.",
  shots: [
    {
      src: "/assets/shots/surrey-ai.png",
      alt: "Local Surrey Artificial Intelligence Society website screenshot",
      label: "AI Society",
    },
    {
      src: "/assets/shots/surrey-business.png",
      alt: "Local Surrey Business Society website screenshot",
      label: "Business Society",
    },
    {
      src: "/assets/shots/surrey-neurotech.png",
      alt: "Local Surrey Neurotech Society website screenshot",
      label: "Neurotech Society",
    },
  ],
  features: [
    {
      label: "Distinct identities",
      detail:
        "AI is technical and kinetic, Business is editorial and professional, Neurotech is scientific and exploratory.",
    },
    {
      label: "Reusable patterns",
      detail:
        "Shared IA, admin concepts, accessible nav, event/committee structures, and site metadata across separate brands.",
    },
    {
      label: "Public usefulness",
      detail:
        "Join, events, committee, contact, and society context are prioritised over placeholder theatre.",
    },
  ],
  stack: ["Astro", "TypeScript", "Tailwind CSS v4", "Convex", "Clerk", "npm workspaces"],
  proof: "Verified from three local localhost Astro demos and the society repo design/content briefs.",
};

const polis: Project = {
  id: "polis",
  eyebrow: "Solo ongoing academic AI workspace",
  title: "Polis",
  summary:
    "A context-aware AI workspace experiment for Joshua's Politics & IR course: context dumping into abstraction while preserving source context, citation integrity, and grounded claims.",
  status:
    "Current state: Next.js/Convex/Clerk app with module, assignment, source, draft, evidence, RAG, and academic integrity contracts in place.",
  logo: "/assets/logos/optimized/polis-logo.png",
  features: [
    {
      label: "Context in, structure out",
      detail:
        "Module material becomes assignments, arguments, evidence, drafts, and review stages rather than a generic chat thread.",
    },
    {
      label: "Citation integrity",
      detail:
        "No invented page numbers, no fabricated citations, scoped retrieval, chunk validation, and explicit unsupported-claim warnings.",
    },
    {
      label: "Course-shaped AI",
      detail:
        "Built around Politics & IR coursework habits: readings, source notes, theory comparison, argument mapping, and draft refinement.",
    },
  ],
  stack: ["Next.js 16", "React 19", "Convex", "Clerk", "Framer Motion", "RAG contracts"],
  proof:
    "Verified from README, product vision, RAG architecture, and academic integrity docs. Local Next dev ports 3103/3106 accepted connections but returned no bytes, so no screenshot is shown.",
};

const sideProjects: readonly SideProject[] = [
  {
    title: "Founder OS",
    note:
      "A brief experimental agentic/founder-system interface: inbox gates, team context, directives, and a founder-control surface.",
    image: "/assets/shots/founder-os.png",
    alt: "Founder OS local demo screenshot",
    tone: "ink",
  },
  {
    title: "Pianoforte",
    note:
      "A piano/music/product curiosity: an Android-first AI piano tutor with a small marketing demo and lesson imagination.",
    image: "/assets/shots/pianoforte.png",
    alt: "Pianoforte local marketing demo screenshot",
    tone: "blue",
  },
  {
    title: "PoppyCheese",
    note:
      "A fun Three.js test project Joshua made with his girlfriend: tiny game energy, kitchen chaos, and a deliberately unserious brief.",
    image: "/assets/shots/poppycheese.png",
    alt: "PoppyCheese local game demo screenshot",
    tone: "green",
  },
];

const roles: readonly Role[] = [
  {
    title: "President",
    context: "Surrey Artificial Intelligence Society",
    detail: "Building the society around practical AI learning, projects, responsibility, and interdisciplinary access.",
    icon: "cpu",
  },
  {
    title: "Vice President",
    context: "Surrey Neurotech Society",
    detail: "Helping shape a student community around neurotechnology, BCIs, research literacy, and responsible exploration.",
    icon: "brain",
  },
  {
    title: "President, formerly VP",
    context: "Surrey Business Society",
    detail: "Relaunching, leading, and designing the digital presence for a commercially focused student society.",
    icon: "building-2",
  },
  {
    title: "BSc Politics & International Relations",
    context: "University of Surrey",
    detail: "Second year, graduating 2027. The academic thread running through Polis, policy curiosity, and systems thinking.",
    icon: "graduation-cap",
  },
];

const iconSet = {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Cpu,
  ExternalLink,
  GraduationCap,
  Mail,
  Menu,
  Music,
  Sparkles,
  X,
};

function lucide(name: string): string {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

function brandIcon(name: Social["icon"]): string {
  if (name === "email") return lucide("mail");
  if (name === "instagram") {
    return `<svg class="brand-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.15-2.3a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/></svg>`;
  }
  if (name === "github") {
    return `<svg class="brand-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .6A11.4 11.4 0 0 0 8.4 22.8c.57.1.78-.25.78-.55v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.54-.29-5.2-1.27-5.2-5.64 0-1.25.44-2.27 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.13-1.17 3.13-1.17.63 1.57.23 2.73.12 3.02.73.8 1.17 1.81 1.17 3.06 0 4.38-2.67 5.34-5.21 5.63.41.35.77 1.04.77 2.1v3.13c0 .31.2.66.79.55A11.4 11.4 0 0 0 12 .6Z"/></svg>`;
  }
  if (name === "linkedin") {
    return `<svg class="brand-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.4v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"/></svg>`;
  }
  return `<svg class="brand-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.42 10.2 23.1 0h-2.06l-7.54 8.84L7.48 0H.54l9.1 13.36L.54 24H2.6l7.95-9.31L16.9 24h6.94l-9.42-13.8Zm-2.82 3.3-.92-1.33L3.34 1.56H6.5l5.92 8.55.92 1.33 7.7 11.12h-3.16L11.6 13.5Z"/></svg>`;
}

function renderSocialLink(social: Social): string {
  const external = social.icon !== "email";
  return `
    <a class="social-link" href="${social.href}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ""} aria-label="${social.label}">
      ${brandIcon(social.icon)}
      <span>${social.label}</span>
    </a>
  `;
}

function renderSceneRail(): string {
  return `
    <nav class="scene-rail" aria-label="Portfolio overview">
      ${sceneLinks
        .map(
          (scene, index) => `
            <button type="button" class="scene-dot" data-jump="${scene.id}" aria-label="Jump to ${scene.label}" aria-current="${index === 0 ? "true" : "false"}">
              <span>${scene.shortLabel}</span>
              <strong>${scene.label}</strong>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderFeatureList(project: Project): string {
  return `
    <div class="feature-list">
      ${project.features
        .map(
          (feature) => `
            <article class="feature-row">
              <strong>${feature.label}</strong>
              <p>${feature.detail}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderStack(stack: readonly string[]): string {
  return `<div class="stack-list">${stack.map((item) => `<span>${item}</span>`).join("")}</div>`;
}

function renderProjectScreenshot(asset: EvidenceAsset, className = ""): string {
  return `
    <figure class="media-frame ${className}">
      <img src="${asset.src}" alt="${asset.alt}" loading="lazy" decoding="async" />
      <figcaption>${asset.label}</figcaption>
    </figure>
  `;
}

function renderHeader(): string {
  return `
    <header class="site-header">
      <a class="brand-mark" href="#opening" aria-label="Joshua Knott home">
        <span>Joshua</span>
        <strong>Knott</strong>
      </a>
      <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false">
        ${lucide("menu")}
        <span class="sr-only">Open navigation</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
        ${sceneLinks
          .filter((scene) => ["range", "memvella", "societies", "polis", "contact"].includes(scene.id))
          .map((scene) => `<a href="#${scene.id}">${scene.label}</a>`)
          .join("")}
      </nav>
    </header>
  `;
}

function renderOpening(): string {
  return `
    <section class="journey-scene opening-scene" id="opening" data-scene="opening" aria-labelledby="opening-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Portfolio as range map</p>
          <h1 id="opening-title">Joshua Knott</h1>
          <p class="hero-line">Politics, AI, product building, piano, experiments, and curiosity turned into software.</p>
          <p class="hero-body">
            I like work that crosses rooms: a Politics & IR seminar, a senior care product, a society website,
            a founder tool, a piano idea, a strange little prototype. The range is the point.
          </p>
          <div class="hero-actions">
            <a class="primary-action" href="#memvella">Start with the products ${lucide("arrow-right")}</a>
            <a class="secondary-action" href="#range">See the range ${lucide("arrow-down")}</a>
          </div>
          <div class="social-strip" aria-label="Social links">
            ${socials.map(renderSocialLink).join("")}
          </div>
        </div>
        <div class="range-theatre no-progress" aria-label="Designed range visual">
          <canvas id="range-canvas" width="900" height="900" aria-hidden="true"></canvas>
          <div class="range-label label-politics">Politics & IR</div>
          <div class="range-label label-ai">AI systems</div>
          <div class="range-label label-product">Product craft</div>
          <div class="range-label label-piano">Piano</div>
          <div class="range-label label-care">Humane tech</div>
          <div class="range-core">
            <span>curiosity</span>
            <strong>range</strong>
          </div>
        </div>
      </div>
      <button class="next-scene-button" type="button" data-next-scene aria-label="Continue to range">
        ${lucide("arrow-down")}
      </button>
    </section>
  `;
}

function renderRange(): string {
  return `
    <section class="journey-scene range-scene" id="range" data-scene="range" aria-labelledby="range-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner editorial-grid">
        <div>
          <p class="eyebrow">Personal range</p>
          <h2 id="range-title">A student, builder, organiser, pianist, and serial rabbit-hole follower.</h2>
        </div>
        <div class="editorial-copy">
          <p>
            Joshua studies <strong>Politics & International Relations at the University of Surrey</strong>, but the work
            rarely stays inside one discipline. Politics gives the questions. AI and product building give the tools.
            Entrepreneurship gives the pressure to make something real.
          </p>
          <p>
            Piano keeps the attention human: timing, practice, listening, taste. The same habit shows up in software:
            build the thing, test the feel, keep the person on the other side visible.
          </p>
          <div class="range-ledger" aria-label="Range ledger">
            <span>AI/product building</span>
            <span>entrepreneurship</span>
            <span>society leadership</span>
            <span>Politics & IR</span>
            <span>piano</span>
            <span>cooking, nature, travel, and small experiments</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderMemvella(): string {
  return `
    <section class="journey-scene project-scene memvella-scene" id="memvella" data-scene="memvella" aria-labelledby="memvella-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner project-layout">
        <div class="project-copy">
          <p class="eyebrow">${memvella.eyebrow}</p>
          <div class="project-title-line">
            ${memvella.logo ? `<img src="${memvella.logo}" alt="" loading="lazy" decoding="async" />` : ""}
            <h2 id="memvella-title">${memvella.title}</h2>
          </div>
          <p class="project-summary">${memvella.summary}</p>
          ${renderFeatureList(memvella)}
          ${renderStack(memvella.stack)}
          <p class="evidence-note">${memvella.proof}</p>
        </div>
        <div class="project-media">
          ${memvella.screenshot ? renderProjectScreenshot(memvella.screenshot, "large-frame") : ""}
          <div class="architecture-strip" aria-label="Memvella architecture">
            <span>Senior voice surface</span>
            <span>Circle coordination</span>
            <span>Convex data model</span>
            <span>AI grounding and support</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSocieties(): string {
  return `
    <section class="journey-scene project-scene societies-scene" id="societies" data-scene="societies" aria-labelledby="societies-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner society-layout">
        <div class="project-copy">
          <p class="eyebrow">${societies.eyebrow}</p>
          <h2 id="societies-title">${societies.title}</h2>
          <p class="project-summary">${societies.summary}</p>
          ${renderFeatureList(societies)}
          ${renderStack(societies.stack)}
          <p class="evidence-note">${societies.proof}</p>
        </div>
        <div class="society-reel no-progress">
          ${societies.shots?.map((shot) => renderProjectScreenshot(shot)).join("") ?? ""}
        </div>
      </div>
    </section>
  `;
}

function renderPolis(): string {
  return `
    <section class="journey-scene project-scene polis-scene" id="polis" data-scene="polis" aria-labelledby="polis-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner polis-layout">
        <div class="project-copy">
          <p class="eyebrow">${polis.eyebrow}</p>
          <div class="project-title-line">
            ${polis.logo ? `<img src="${polis.logo}" alt="" loading="lazy" decoding="async" />` : ""}
            <h2 id="polis-title">${polis.title}</h2>
          </div>
          <p class="project-summary">${polis.summary}</p>
          ${renderFeatureList(polis)}
          ${renderStack(polis.stack)}
          <p class="evidence-note">${polis.proof}</p>
        </div>
        <div class="polis-system no-progress" aria-label="Polis source-grounding model">
          <div class="system-step">
            <span>01</span>
            <strong>Context dump</strong>
            <p>Readings, lectures, briefs, notes, drafts.</p>
          </div>
          <div class="system-arrow"></div>
          <div class="system-step">
            <span>02</span>
            <strong>Abstraction</strong>
            <p>Modules, assignments, arguments, evidence.</p>
          </div>
          <div class="system-arrow"></div>
          <div class="system-step">
            <span>03</span>
            <strong>Grounded output</strong>
            <p>Scoped retrieval, citations, warnings, no hallucinated claims.</p>
          </div>
          <div class="citation-rules">
            <span>No fabricated citations</span>
            <span>No invented page numbers</span>
            <span>Unsupported claims get flagged</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderExperiments(): string {
  return `
    <section class="journey-scene experiments-scene" id="experiments" data-scene="experiments" aria-labelledby="experiments-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner experiments-layout">
        <div class="section-kicker">
          <p class="eyebrow">Light projects</p>
          <h2 id="experiments-title">Not every experiment needs to become a company. Some are just useful signals.</h2>
        </div>
        <div class="experiment-reel">
          ${sideProjects
            .map(
              (project) => `
                <article class="experiment-strip tone-${project.tone}">
                  <img src="${project.image}" alt="${project.alt}" loading="lazy" decoding="async" />
                  <div>
                    <h3>${project.title}</h3>
                    <p>${project.note}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderRoles(): string {
  return `
    <section class="journey-scene roles-scene" id="roles" data-scene="roles" aria-labelledby="roles-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner roles-layout">
        <div>
          <p class="eyebrow">Initiative, not resume padding</p>
          <h2 id="roles-title">The roles are where range gets stress-tested.</h2>
          <p class="roles-intro">
            Societies are product surfaces too: identity, events, volunteers, operations, expectation-setting,
            and enough momentum that people feel the thing is alive.
          </p>
        </div>
        <div class="role-stack">
          ${roles
            .map(
              (role) => `
                <article class="role-item">
                  <span>${lucide(role.icon)}</span>
                  <div>
                    <h3>${role.title}</h3>
                    <strong>${role.context}</strong>
                    <p>${role.detail}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderContact(): string {
  return `
    <section class="journey-scene contact-scene" id="contact" data-scene="contact" aria-labelledby="contact-title">
      <div class="story-void" aria-hidden="true"></div>
      <div class="scene-inner contact-layout">
        <p class="eyebrow">Contact</p>
        <h2 id="contact-title">Curious, building, and open to serious conversations.</h2>
        <p>
          The useful through-line is still simple: work with range, keep it grounded, make it human, and ship the thing.
        </p>
        <div class="contact-actions">
          <a class="primary-action" href="mailto:${email}">${lucide("mail")} Email Joshua</a>
          <div class="social-strip final-socials" aria-label="Social links">
            ${socials.map(renderSocialLink).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPortfolio(): string {
  return `
    ${renderHeader()}
    ${renderSceneRail()}
    <main id="main" class="portfolio-journey">
      ${renderOpening()}
      ${renderRange()}
      ${renderMemvella()}
      ${renderSocieties()}
      ${renderPolis()}
      ${renderExperiments()}
      ${renderRoles()}
      ${renderContact()}
    </main>
  `;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select, summary, .no-progress, .media-frame, .scene-rail, .site-header"));
}

function setupNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>("#site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll<HTMLButtonElement>("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => scrollToScene(button.dataset.jump));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-next-scene]").forEach((button) => {
    button.addEventListener("click", () => scrollToScene(getNextSceneId()));
  });
}

function scrollToScene(id: string | undefined): void {
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

function getCurrentSceneIndex(): number {
  const current = document.querySelector<HTMLElement>(".journey-scene.is-current");
  const id = current?.id ?? "opening";
  return Math.max(0, sceneLinks.findIndex((scene) => scene.id === id));
}

function getNextSceneId(): string {
  const index = getCurrentSceneIndex();
  return sceneLinks[Math.min(index + 1, sceneLinks.length - 1)]?.id ?? "contact";
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setupSceneProgression(): void {
  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isInteractiveTarget(document.activeElement)) return;
    event.preventDefault();
    scrollToScene(getNextSceneId());
  });

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || isInteractiveTarget(event.target)) return;
    if (!(event.target instanceof Element)) return;
    const scene = event.target.closest<HTMLElement>(".journey-scene");
    const isEmptySceneArea = event.target === scene || event.target.classList.contains("story-void") || event.target.classList.contains("scene-inner");
    if (!scene || !isEmptySceneArea) return;
    scrollToScene(getNextSceneId());
  });
}

function setupSceneObserver(): void {
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>(".scene-dot"));
  const scenes = Array.from(document.querySelectorAll<HTMLElement>(".journey-scene"));

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible?.target || !(visible.target instanceof HTMLElement)) return;
      scenes.forEach((scene) => scene.classList.toggle("is-current", scene === visible.target));
      dots.forEach((dot) => {
        dot.setAttribute("aria-current", String(dot.dataset.jump === visible.target.id));
      });
    },
    { threshold: [0.35, 0.55, 0.72] },
  );

  scenes.forEach((scene) => observer.observe(scene));
  scenes[0]?.classList.add("is-current");
}

function setupRangeCanvas(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#range-canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  const colors = ["#246BFD", "#FF6F61", "#12A87D", "#D6A43C", "#111827"];
  const reduced = prefersReducedMotion();
  const points = Array.from({ length: 34 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    r: 2 + Math.random() * 6,
    vx: (Math.random() - 0.5) * 0.0007,
    vy: (Math.random() - 0.5) * 0.0007,
    color: colors[index % colors.length],
  }));

  let frame = 0;
  let animation = 0;

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (): void => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(width * 0.44, height * 0.46, 30, width * 0.5, height * 0.5, width * 0.62);
    gradient.addColorStop(0, "rgba(255,255,255,0.78)");
    gradient.addColorStop(0.45, "rgba(246,250,255,0.38)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1.2;
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (!reduced) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0.08 || point.x > 0.92) point.vx *= -1;
        if (point.y < 0.08 || point.y > 0.92) point.vy *= -1;
      }
      for (let j = i + 1; j < points.length; j += 1) {
        const other = points[j];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 0.23) {
          context.strokeStyle = `rgba(17, 24, 39, ${0.11 - distance * 0.32})`;
          context.beginPath();
          context.moveTo(point.x * width, point.y * height);
          context.quadraticCurveTo(width * 0.5, height * 0.48, other.x * width, other.y * height);
          context.stroke();
        }
      }
    }

    points.forEach((point, index) => {
      const pulse = reduced ? 0 : Math.sin(frame * 0.018 + index) * 1.8;
      context.fillStyle = point.color;
      context.beginPath();
      context.roundRect(point.x * width, point.y * height, point.r * 3.5 + pulse, point.r * 1.7, 8);
      context.fill();
    });

    frame += 1;
    if (!reduced) animation = window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animation);
    resize();
    draw();
  });
}

function mount(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("Application root #app was not found.");

  app.innerHTML = renderPortfolio();
  createIcons({ icons: iconSet });
  setupNavigation();
  setupSceneObserver();
  setupSceneProgression();
  setupRangeCanvas();
}

mount();
