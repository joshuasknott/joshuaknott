import {
  ArrowRight,
  BookOpen,
  BotMessageSquare,
  BrainCircuit,
  ChartNoAxesCombined,
  ChevronDown,
  CodeXml,
  Download,
  ExternalLink,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Menu,
  Music,
  Network,
  Piano,
  Scale,
  Trophy,
  createIcons,
} from "lucide";
import type * as ThreeTypes from "three";
import type { GeometryCollection, Topology } from "topojson-specification";
import "./styles.css";

const email = "joshhknott@gmail.com";
const linkedIn = "https://www.linkedin.com/in/joshua-k-618270217/";
const gitHub = "https://github.com/joshuasknott";
const calendarInvite =
  "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Chat%20with%20Joshua%20Knott&details=Book%20a%20conversation%20with%20Joshua%20Knott.&add=joshhknott%40gmail.com";
const iconSet = {
  ArrowRight,
  BookOpen,
  BotMessageSquare,
  BrainCircuit,
  ChartNoAxesCombined,
  ChevronDown,
  CodeXml,
  Download,
  ExternalLink,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Menu,
  Music,
  Network,
  Piano,
  Scale,
  Trophy,
};

type Capability = Readonly<{
  title: string;
  body: string;
  icon: string;
  tone: string;
  visual: string;
}>;

type Project = Readonly<{
  id: string;
  title: string;
  role: string;
  body: string;
  tone: string;
  href: string;
  repoHref: string;
  award?: string;
  societyLinks?: readonly Readonly<{ label: string; href: string }>[];
}>;

type Experience = Readonly<{
  title: string;
  org: string;
  date: string;
  body: string;
  icon: string;
  tone: string;
  visual: string;
}>;

type Thought = Readonly<{
  title: string;
  date: string;
  tone: string;
}>;

type Coordinate = readonly [number, number];

type CountryGeometry =
  | Readonly<{ type: "Polygon"; coordinates: Coordinate[][] }>
  | Readonly<{ type: "MultiPolygon"; coordinates: Coordinate[][][] }>;

type CountryFeature = Readonly<{
  type: "Feature";
  properties?: Readonly<{ name?: string }>;
  geometry: CountryGeometry | null;
}>;

type CountryFeatureCollection = Readonly<{
  type: "FeatureCollection";
  features: readonly CountryFeature[];
}>;

type CountryBounds = Readonly<{
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}>;

type CountryPolygon = Readonly<{
  name: string;
  rings: readonly Coordinate[][];
  bounds: CountryBounds;
}>;

type ThreeModule = typeof ThreeTypes;

const capabilities: readonly Capability[] = [
  {
    title: "AI & Product Builder",
    body: "Creating AI-driven products and tools that solve real problems for real people.",
    icon: "bot-message-square",
    tone: "blue",
    visual: "ai",
  },
  {
    title: "Web Developer",
    body: "Designing and building modern websites and digital experiences for communities and organisations.",
    icon: "code-xml",
    tone: "violet",
    visual: "web",
  },
  {
    title: "Leader & Organizer",
    body: "Leading societies, building strategies, partnerships and events that create real impact.",
    icon: "megaphone",
    tone: "rose",
    visual: "organizer",
  },
  {
    title: "Political Thinker",
    body: "Exploring how institutions, policy and global systems shape our world.",
    icon: "scale",
    tone: "green",
    visual: "policy",
  },
  {
    title: "Lifelong Learner",
    body: "Curious about music, ethics, digital innovation and the intersection of ideas.",
    icon: "piano",
    tone: "purple",
    visual: "learning",
  },
];

const projects: readonly Project[] = [
  {
    id: "memvella",
    title: "Memvella",
    role: "Founder",
    body:
      "AI-driven memory companion and digital wellness app for seniors with early-stage dementia and their caregivers.",
    tone: "memvella",
    href: "#memvella-project",
    repoHref: "https://github.com/joshuasknott/memvella",
    award: "Won £500 from Surrey Innovation & Enterprise Hub",
  },
  {
    id: "polis",
    title: "Polis",
    role: "Founder",
    body:
      "An AI-native coursework space that helps students organise module content, learn smarter and write better assignments.",
    tone: "polis",
    href: "#polis-project",
    repoHref: "https://github.com/joshuasknott/polis",
  },
  {
    id: "society-website-system",
    title: "Society Website System",
    role: "Developer",
    body:
      "Building and maintaining digital homes for student communities across AI, business and neurotechnology.",
    tone: "society",
    href: "#society-website-system",
    repoHref: "https://github.com/joshuasknott/surreysocieties",
    societyLinks: [
      { label: "surreyaisociety.org", href: "https://surreyaisociety.org" },
      { label: "surreybusinesssociety.org", href: "https://surreybusinesssociety.org" },
      { label: "surreyneurotechsociety.org", href: "https://surreyneurotechsociety.org" },
    ],
  },
];

const experience: readonly Experience[] = [
  {
    title: "President",
    org: "Surrey Artificial Intelligence Society",
    date: "Oct 2025 - Present",
    body:
      "Defining vision and strategy for the society, leading a 10-person committee and delivering events, partnerships and initiatives.",
    icon: "network",
    tone: "blue",
    visual: "ai-society",
  },
  {
    title: "Vice President",
    org: "Surrey Neurotech Society",
    date: "May 2025 - Present",
    body:
      "Supporting the society's mission and growth while building connections across the neurotechnology community.",
    icon: "brain-circuit",
    tone: "green",
    visual: "neurotech",
  },
  {
    title: "Website Developer",
    org: "Surrey Artificial Intelligence, Business & Neurotech Societies",
    date: "2024 - Present",
    body:
      "Designing and developing modern websites and digital experiences for three student societies.",
    icon: "layout-dashboard",
    tone: "orange",
    visual: "websites",
  },
  {
    title: "Former President",
    org: "Surrey Business Society",
    date: "Oct 2025 - May 2026",
    body:
      "Led the society's direction, development plan and member engagement, supporting its relaunch and continued growth.",
    icon: "chart-no-axes-combined",
    tone: "purple",
    visual: "business-president",
  },
  {
    title: "Former Vice President",
    org: "Surrey Business Society",
    date: "May 2025 - Oct 2025",
    body:
      "Led the society's development plan and fresher's recruitment, supporting the relaunch and membership growth.",
    icon: "handshake",
    tone: "purple",
    visual: "business-vp",
  },
];

const thoughts: readonly Thought[] = [];

let countryPolygonsCache: readonly CountryPolygon[] | null = null;

function icon(name: string): string {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

function brandIcon(name: "github" | "linkedin" | "gmail" | "calendar"): string {
  if (name === "github") {
    return `
      <svg class="brand-icon brand-icon-github" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18.92-.25 1.9-.38 2.88-.39.98.01 1.96.14 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    `;
  }

  if (name === "linkedin") {
    return `
      <svg class="brand-icon brand-icon-linkedin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45ZM22.23 0H1.76C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.76 24h20.47c.97 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z" />
      </svg>
    `;
  }

  if (name === "gmail") {
    return `
      <svg class="brand-icon brand-icon-gmail" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#EA4335" d="M3.2 6.3 12 12.9l8.8-6.6v10.9c0 1-.8 1.8-1.8 1.8h-2.6V11.2L12 14.5l-4.4-3.3V19H5c-1 0-1.8-.8-1.8-1.8V6.3Z" />
        <path fill="#FBBC04" d="M3.2 6.3c0-.9.7-1.6 1.6-1.6.4 0 .7.1 1 .3L12 9.7v3.2L3.2 6.3Z" />
        <path fill="#34A853" d="M20.8 6.3v10.9c0 1-.8 1.8-1.8 1.8h-2.6V9.6l4.4-3.3Z" />
        <path fill="#4285F4" d="M20.8 6.3 12 12.9V9.7L18.2 5c.3-.2.7-.3 1-.3.9 0 1.6.7 1.6 1.6Z" />
      </svg>
    `;
  }

  return `
    <svg class="brand-icon brand-icon-calendar" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" />
      <path fill="#4285F4" d="M6 2h3v5H6zM15 2h3v5h-3zM3 8h18v4H3z" />
      <path fill="#34A853" d="M3 12h5v9H6a3 3 0 0 1-3-3v-6Z" />
      <path fill="#FBBC04" d="M16 12h5v6a3 3 0 0 1-3 3h-2v-9Z" />
      <path fill="#EA4335" d="M8 12h8v9H8z" opacity=".18" />
      <path fill="#26314A" d="M10.2 17.8h1.2v-3.1l-1 .4-.3-.9 1.6-.7h.9v4.3h1.1v1h-3.5v-1Zm4.2.2c.4.1.7.2 1.1.2.7 0 1.1-.3 1.1-.8 0-.5-.4-.7-1.2-.7h-.6v-.9h.6c.7 0 1.1-.3 1.1-.7 0-.4-.3-.7-.9-.7-.4 0-.8.1-1.2.3l-.2-.9c.4-.2.9-.4 1.6-.4 1.2 0 1.9.6 1.9 1.5 0 .6-.3 1-.9 1.3.7.2 1.1.7 1.1 1.4 0 1-.8 1.7-2.2 1.7-.6 0-1.1-.1-1.5-.3l.2-1Z" />
    </svg>
  `;
}

function createCountryPolygons(features: readonly CountryFeature[]): CountryPolygon[] {
  const polygons: CountryPolygon[] = [];

  for (const country of features) {
    const name = country.properties?.name;

    if (!name || !country.geometry) {
      continue;
    }

    const countryShapes =
      country.geometry.type === "Polygon"
        ? [country.geometry.coordinates]
        : country.geometry.coordinates;

    for (const rings of countryShapes) {
      if (rings.length === 0 || rings[0].length < 3) {
        continue;
      }

      polygons.push({
        name,
        rings,
        bounds: getCountryBounds(rings),
      });
    }
  }

  return polygons;
}

async function getCountryPolygons(): Promise<readonly CountryPolygon[]> {
  if (!countryPolygonsCache) {
    const [{ feature: toGeoJson }, topologyModule] = await Promise.all([
      import("topojson-client"),
      import("world-atlas/countries-110m.json"),
    ]);
    const countriesTopology = topologyModule.default as unknown as Topology & {
      objects: { countries: GeometryCollection };
    };
    const countryFeatureCollection = toGeoJson(
      countriesTopology,
      countriesTopology.objects.countries,
    ) as unknown as CountryFeatureCollection;

    countryPolygonsCache = createCountryPolygons(countryFeatureCollection.features);
  }

  return countryPolygonsCache;
}

function getCountryBounds(rings: readonly Coordinate[][]): CountryBounds {
  let minLon = 180;
  let maxLon = -180;
  let minLat = 90;
  let maxLat = -90;

  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }

  return { minLon, maxLon, minLat, maxLat };
}

function pointIsInsideRing(lon: number, lat: number, ring: readonly Coordinate[]): boolean {
  let inside = false;

  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index++) {
    const [currentLon, currentLat] = ring[index];
    const [previousLon, previousLat] = ring[previousIndex];
    const crossesLatitude = currentLat > lat !== previousLat > lat;

    if (!crossesLatitude) {
      continue;
    }

    const intersectLon =
      ((previousLon - currentLon) * (lat - currentLat)) / (previousLat - currentLat) + currentLon;

    if (lon < intersectLon) {
      inside = !inside;
    }
  }

  return inside;
}

function countryAtCoordinates(
  lon: number,
  lat: number,
  countries: readonly CountryPolygon[],
): string | null {
  for (const country of countries) {
    const { bounds, rings } = country;

    if (lon < bounds.minLon || lon > bounds.maxLon || lat < bounds.minLat || lat > bounds.maxLat) {
      continue;
    }

    const [outline, ...holes] = rings;

    if (!outline || !pointIsInsideRing(lon, lat, outline)) {
      continue;
    }

    if (holes.some((hole) => pointIsInsideRing(lon, lat, hole))) {
      continue;
    }

    return country.name;
  }

  return null;
}

function projectCoordinate([lon, lat]: Coordinate, width: number, height: number): readonly [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function drawProjectedRing(
  context: CanvasRenderingContext2D,
  ring: readonly Coordinate[],
  width: number,
  height: number,
): void {
  let previousX = 0;
  let hasStarted = false;

  for (const coordinate of ring) {
    const [x, y] = projectCoordinate(coordinate, width, height);

    if (!hasStarted || Math.abs(x - previousX) > width / 2) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }

    previousX = x;
    hasStarted = true;
  }

  context.closePath();
}

function createEarthTexture(three: ThreeModule, countries: readonly CountryPolygon[]): ThreeTypes.CanvasTexture {
  const canvas = document.createElement("canvas");
  const width = 2048;
  const height = 1024;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create Earth texture canvas.");
  }

  const oceanGradient = context.createLinearGradient(0, 0, 0, height);
  oceanGradient.addColorStop(0, "#083d77");
  oceanGradient.addColorStop(0.45, "#0d5c9f");
  oceanGradient.addColorStop(1, "#062f5d");
  context.fillStyle = oceanGradient;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.18;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;
  for (let lon = -150; lon <= 150; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.globalAlpha = 1;

  context.beginPath();
  for (const country of countries) {
    for (const ring of country.rings) {
      drawProjectedRing(context, ring, width, height);
    }
  }
  const landGradient = context.createLinearGradient(0, height * 0.18, 0, height * 0.88);
  landGradient.addColorStop(0, "#c7b36a");
  landGradient.addColorStop(0.32, "#608d57");
  landGradient.addColorStop(0.66, "#3f7a54");
  landGradient.addColorStop(1, "#b8965b");
  context.fillStyle = landGradient;
  context.fill("evenodd");

  context.beginPath();
  for (const country of countries) {
    for (const ring of country.rings) {
      drawProjectedRing(context, ring, width, height);
    }
  }
  context.strokeStyle = "rgba(246, 250, 255, 0.36)";
  context.lineWidth = 0.85;
  context.stroke();

  const iceGradient = context.createLinearGradient(0, 0, 0, height);
  iceGradient.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  iceGradient.addColorStop(0.11, "rgba(255, 255, 255, 0)");
  iceGradient.addColorStop(0.89, "rgba(255, 255, 255, 0)");
  iceGradient.addColorStop(1, "rgba(255, 255, 255, 0.88)");
  context.fillStyle = iceGradient;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.09;
  context.fillStyle = "#ffffff";
  for (let index = 0; index < 950; index += 1) {
    const x = (Math.sin(index * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(index * 78.233) * 23454.671) % 1;
    context.fillRect(Math.abs(x) * width, Math.abs(y) * height, 1.4, 1.4);
  }
  context.globalAlpha = 1;

  const texture = new three.CanvasTexture(canvas);
  texture.colorSpace = three.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function renderCapabilityVisual(visual: string): string {
  if (visual === "ai") {
    return `
      <svg class="capability-svg" viewBox="0 0 180 120" aria-hidden="true" focusable="false">
        <rect class="svg-panel" x="28" y="28" width="72" height="52" rx="14" />
        <path class="svg-line" d="M64 28V16M44 80v14M84 80v14M100 54h22M28 54H10" />
        <circle class="svg-node" cx="44" cy="54" r="5" />
        <circle class="svg-node" cx="84" cy="54" r="5" />
        <path class="svg-line" d="M126 30c17 8 25 19 25 34s-8 26-25 34" />
        <path class="svg-line soft" d="M137 39c10 7 15 15 15 25s-5 18-15 25" />
        <path class="svg-accent" d="M118 64h34" />
      </svg>
    `;
  }

  if (visual === "web") {
    return `
      <svg class="capability-svg" viewBox="0 0 180 120" aria-hidden="true" focusable="false">
        <rect class="svg-panel" x="24" y="20" width="132" height="82" rx="12" />
        <path class="svg-fill" d="M24 38h132v-6a12 12 0 0 0-12-12H36a12 12 0 0 0-12 12v6Z" />
        <path class="svg-line" d="M52 58 38 70l14 12M128 58l14 12-14 12M82 86l16-32" />
        <path class="svg-line soft" d="M58 96h64M62 47h28M100 47h18" />
      </svg>
    `;
  }

  if (visual === "organizer") {
    return `
      <svg class="capability-svg" viewBox="0 0 180 120" aria-hidden="true" focusable="false">
        <circle class="svg-panel" cx="90" cy="58" r="34" />
        <path class="svg-line" d="M90 18v80M50 58h80" />
        <path class="svg-accent" d="M37 92c12-13 24-20 37-20M143 92c-12-13-24-20-37-20" />
        <circle class="svg-node" cx="44" cy="38" r="8" />
        <circle class="svg-node" cx="136" cy="38" r="8" />
        <circle class="svg-node" cx="90" cy="92" r="8" />
      </svg>
    `;
  }

  if (visual === "policy") {
    return `
      <svg class="capability-svg" viewBox="0 0 180 120" aria-hidden="true" focusable="false">
        <path class="svg-line" d="M90 22v74M48 36h84M58 96h64" />
        <path class="svg-panel" d="M48 36 30 74h36L48 36ZM132 36l-18 38h36l-18-38Z" />
        <path class="svg-line soft" d="M30 74h36M114 74h36" />
        <path class="svg-accent" d="M72 30h36" />
        <circle class="svg-node" cx="90" cy="30" r="6" />
      </svg>
    `;
  }

  return `
    <svg class="capability-svg" viewBox="0 0 180 120" aria-hidden="true" focusable="false">
      <rect class="svg-panel" x="28" y="34" width="124" height="54" rx="14" />
      <path class="svg-line" d="M42 56h96M42 72h96M58 34v54M78 34v54M98 34v54M118 34v54" />
      <path class="svg-accent" d="M42 96c18-13 34-19 49-18 16 1 30 7 47 18" />
      <circle class="svg-node" cx="52" cy="24" r="5" />
      <circle class="svg-node" cx="128" cy="24" r="5" />
    </svg>
  `;
}

function renderExperienceVisual(visual: string): string {
  if (visual === "ai-society") {
    return `
      <svg class="experience-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle class="svg-panel" cx="32" cy="32" r="22" />
        <circle class="svg-node" cx="20" cy="24" r="4" />
        <circle class="svg-node" cx="42" cy="20" r="4" />
        <circle class="svg-node" cx="44" cy="42" r="4" />
        <circle class="svg-node" cx="22" cy="44" r="4" />
        <path class="svg-line" d="M24 25 38 21M42 24l2 14M40 43l-14 1M22 40l-2-12M24 27l16 13" />
      </svg>
    `;
  }

  if (visual === "neurotech") {
    return `
      <svg class="experience-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path class="svg-panel" d="M24 13c-8 0-14 7-14 15 0 5 3 10 7 13v7c0 2 2 4 4 4h9V13h-6ZM40 13c8 0 14 7 14 15 0 5-3 10-7 13v7c0 2-2 4-4 4h-9V13h6Z" />
        <path class="svg-line" d="M19 31h7l4-8 6 18 4-10h7" />
        <path class="svg-accent" d="M32 15v36" />
      </svg>
    `;
  }

  if (visual === "websites") {
    return `
      <svg class="experience-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect class="svg-panel" x="9" y="15" width="20" height="16" rx="4" />
        <rect class="svg-panel" x="35" y="15" width="20" height="16" rx="4" />
        <rect class="svg-panel" x="22" y="39" width="20" height="16" rx="4" />
        <path class="svg-line" d="M29 23h6M19 31v8M45 31v8M22 47H12M42 47h10" />
        <path class="svg-accent" d="M15 22h8M41 22h8M28 46h8" />
      </svg>
    `;
  }

  if (visual === "business-president") {
    return `
      <svg class="experience-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path class="svg-panel" d="M14 48h36v7H14zM19 24h26v24H19z" />
        <path class="svg-line" d="M16 24h32M24 24v24M32 24v24M40 24v24" />
        <path class="svg-accent" d="M20 19c8-8 16-8 24 0" />
        <path class="svg-line" d="M22 37h20" />
      </svg>
    `;
  }

  return `
    <svg class="experience-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="svg-panel" d="M13 30h14l5 5 5-5h14v10l-8 10H21l-8-10V30Z" />
      <path class="svg-line" d="M19 31l8-9 9 9M45 31l-8-9-9 9M25 44h14" />
      <path class="svg-accent" d="M18 18h28" />
      <circle class="svg-node" cx="18" cy="18" r="3" />
      <circle class="svg-node" cx="46" cy="18" r="3" />
    </svg>
  `;
}

function renderCapability(card: Capability): string {
  return `
    <article class="capability-card tone-${card.tone}">
      <div class="capability-visual visual-${card.visual}" aria-hidden="true">
        ${renderCapabilityVisual(card.visual)}
      </div>
      <h3>${card.title}</h3>
      <p>${card.body}</p>
    </article>
  `;
}

function renderProject(project: Project): string {
  const award = project.award
    ? `<div class="award-line">${icon("trophy")}<span>${project.award}</span></div>`
    : "";

  const societyLinks = project.societyLinks
    ? `
      <ul class="society-links">
        ${project.societyLinks
          .map(
            (link) => `
              <li>
                <a href="${link.href}" target="_blank" rel="noopener noreferrer">
                  ${icon("arrow-right")}<span>${link.label}</span>${icon("external-link")}
                </a>
              </li>
            `,
          )
          .join("")}
      </ul>
    `
    : "";

  return `
    <article class="project-card" id="${project.id}">
      <div class="project-visual visual-${project.tone}" aria-hidden="true">
        ${renderProjectVisual(project.tone)}
      </div>
      <div class="project-body">
        <div class="project-title-row">
          <h3><a href="${project.href}">${project.title}</a></h3>
          <span>${project.role}</span>
        </div>
        <p>${project.body}</p>
        <a class="repo-link" href="${project.repoHref}" target="_blank" rel="noopener noreferrer">
          ${brandIcon("github")}<span>View GitHub repo</span>${icon("external-link")}
        </a>
        ${award}
        ${societyLinks}
      </div>
    </article>
  `;
}

function renderProjectVisual(tone: string): string {
  if (tone === "memvella") {
    return `<div class="wordmark memvella-mark"><span class="heart-mark">♡</span> memvella</div>`;
  }

  if (tone === "polis") {
    return `<div class="wordmark polis-mark"><span class="square-mark"></span> polis</div>`;
  }

  return `
    <div class="browser-stack">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
}

function renderExperience(item: Experience): string {
  return `
    <article class="experience-card tone-${item.tone}">
      <div class="experience-head">
        <span class="experience-visual">${renderExperienceVisual(item.visual)}</span>
        <div>
          <h3>${item.title}</h3>
          <p>${item.org}</p>
          <time>${item.date}</time>
        </div>
      </div>
      <p>${item.body}</p>
      <span class="experience-line"></span>
    </article>
  `;
}

function renderThought(item: Thought): string {
  return `
    <article class="thought-item">
      <span class="thought-thumb tone-${item.tone}" aria-hidden="true">${icon("book-open")}</span>
      <div>
        <h3>${item.title}</h3>
        <time>${item.date}</time>
      </div>
    </article>
  `;
}

function renderThoughtsList(): string {
  if (thoughts.length === 0) {
    return `
      <div class="thought-empty">
        <span>${icon("book-open")}</span>
        <p>New writing will appear here soon.</p>
      </div>
    `;
  }

  return thoughts.map(renderThought).join("");
}

function renderPortfolio(): string {
  return `
    <header class="site-header">
      <a class="logo" href="#top" aria-label="Joshua Knott home">
        <span>J</span><span>K</span>
      </a>
      <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false">
        ${icon("menu")}<span class="sr-only">Menu</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#blog">Blog</a>
        <a class="nav-cta" href="mailto:${email}?subject=Let's%20connect">
          <span>Let's Connect</span>${icon("arrow-right")}
        </a>
      </nav>
    </header>

    <main>
      <section class="hero section-shell" id="top">
        <div class="hero-copy">
          <p class="eyebrow">Hi, I'm</p>
          <h1>Joshua Knott</h1>
          <p class="hero-subtitle">Building AI-powered solutions that make a real impact.</p>
          <p class="hero-text">
            Politics & International Relations student, AI builder, and community leader passionate about using technology to solve meaningful problems and bring people together.
          </p>
          <div class="hero-actions">
            <a class="primary-button" href="#projects">Explore My Work ${icon("arrow-right")}</a>
            <a class="secondary-button" href="/Joshua-Knott-CV.pdf" download>Download CV ${icon("download")}</a>
          </div>
          <div class="connect-row" aria-label="Social links">
            <span>Connect with me</span>
            <a href="${gitHub}" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">${brandIcon("github")}</a>
            <a href="${linkedIn}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">${brandIcon("linkedin")}</a>
            <a href="mailto:${email}" aria-label="Email Joshua on Gmail">${brandIcon("gmail")}</a>
            <a href="${calendarInvite}" target="_blank" rel="noopener noreferrer" aria-label="Create a Google Calendar invite with Joshua">${brandIcon("calendar")}</a>
          </div>
        </div>

        <div class="hero-visual" aria-label="Profile picture">
          <figure class="profile-picture">
            <img src="/assets/images/pfp.png" alt="Illustrated profile picture of Joshua Knott" />
          </figure>
        </div>
      </section>

      <a class="scroll-cue" href="#what-i-do">
        <span>Scroll to explore</span>${icon("chevron-down")}
      </a>

      <div class="quick-facts section-shell" aria-label="Personal highlights">
        <span>${icon("map-pin")} Based in the UK</span>
        <span>${icon("graduation-cap")} University of Surrey</span>
        <span>${icon("music")} Piano Player</span>
      </div>

      <section class="section-shell section-block about-section" id="about">
        <div class="about-layout">
          <article class="about-copy">
            <div class="section-heading">
              <h2>About Me</h2>
            </div>
            <p>I'm a Politics & International Relations student who loves the intersection of technology, policy and people.</p>
            <p>Whether I'm building AI products, coding websites, leading communities or playing piano, I'm driven by curiosity and a desire to create things that matter.</p>
          </article>

          <aside class="earth-panel" aria-label="Interactive 3D globe">
            <canvas id="earth-globe" class="earth-globe" aria-label="Realistic draggable 3D Earth. Click a point to identify the country." role="img"></canvas>
            <p class="earth-country-label" id="earth-country-label" aria-live="polite">Drag the globe, then click a country.</p>
          </aside>
        </div>
      </section>

      <section class="section-shell section-block" id="what-i-do">
        <div class="section-heading">
          <h2>What I Do</h2>
        </div>
        <div class="capability-grid">
          ${capabilities.map(renderCapability).join("")}
        </div>
      </section>

      <section class="section-shell section-block" id="projects">
        <div class="section-heading split-heading">
          <h2>Featured Projects</h2>
          <a href="#projects">View all projects ${icon("arrow-right")}</a>
        </div>
        <div class="project-grid">
          ${projects.map(renderProject).join("")}
        </div>
      </section>

      <section class="section-shell section-block" id="leadership">
        <div class="section-heading">
          <h2>Leadership & Experience</h2>
        </div>
        <div class="experience-grid">
          ${experience.map(renderExperience).join("")}
        </div>
      </section>

      <section class="section-shell section-block" id="education">
        <div class="section-heading">
          <h2>Education</h2>
        </div>
        <article class="education-card">
          <div class="degree-visual" aria-hidden="true">
            <svg viewBox="0 0 300 170" focusable="false">
              <path class="degree-map" d="M38 83c16-22 37-32 63-29 20 2 35 12 46 29 13-14 31-21 54-20 23 2 43 12 61 31-17 19-38 29-64 28-20-1-36-9-49-24-13 16-30 24-51 23-25-1-45-14-60-38Z" />
              <circle class="degree-globe" cx="145" cy="82" r="43" />
              <path class="degree-grid" d="M102 82h86M145 39v86M116 53c17 11 41 11 58 0M116 111c17-11 41-11 58 0M126 46c-16 22-16 50 0 72M164 46c16 22 16 50 0 72" />
              <path class="degree-route" d="M62 128c28-41 63-61 106-60 31 1 55 13 72 36" />
              <circle class="degree-node" cx="62" cy="128" r="6" />
              <circle class="degree-node" cx="168" cy="68" r="5" />
              <circle class="degree-node" cx="240" cy="104" r="6" />
              <g class="degree-institution">
                <path d="M42 143h96" />
                <path d="M54 78h72" />
                <path d="M63 91v42M83 91v42M103 91v42" />
                <path d="M46 78l44-26 44 26" />
              </g>
              <g class="degree-policy">
                <rect x="200" y="44" width="58" height="74" rx="8" />
                <path d="M214 62h30M214 78h32M214 94h22" />
                <path d="m236 109 9 9 18-24" />
              </g>
            </svg>
          </div>
          <div class="education-copy">
            <h3>BSc Politics & International Relations</h3>
            <p>University of Surrey <span>Sep 2024 - Jun 2027</span></p>
            <small>Focusing on political theory, international relations and public policy.</small>
          </div>
          <div class="surrey-mark" aria-label="University of Surrey">
            <span class="surrey-symbol">US</span>
            <strong>UNIVERSITY OF<br />SURREY</strong>
          </div>
        </article>
      </section>

      <section class="section-shell bottom-meta-grid">
        <article class="thoughts" id="blog">
          <div class="section-heading split-heading compact-heading">
            <h2>Latest Thoughts</h2>
            <a href="#blog">View all posts ${icon("arrow-right")}</a>
          </div>
          <div class="thought-list">
            ${renderThoughtsList()}
          </div>
        </article>
      </section>

      <section class="section-shell contact-band" id="contact">
        <div class="contact-intro">
          <h2>Let's build something meaningful together.</h2>
          <p>I'm always open to new ideas, collaborations and opportunities.</p>
        </div>
        <div class="contact-links">
          <a href="mailto:${email}">
            <span class="contact-icon brand-contact-icon">${brandIcon("gmail")}</span>
            <span><strong>Email Me</strong><small>${email}</small></span>
          </a>
          <a href="${linkedIn}" target="_blank" rel="noopener noreferrer">
            <span class="contact-icon brand-contact-icon">${brandIcon("linkedin")}</span>
            <span><strong>LinkedIn</strong><small>Connect with me</small></span>
          </a>
          <a href="${gitHub}" target="_blank" rel="noopener noreferrer">
            <span class="contact-icon brand-contact-icon">${brandIcon("github")}</span>
            <span><strong>GitHub</strong><small>Check out my code</small></span>
          </a>
          <a href="${calendarInvite}" target="_blank" rel="noopener noreferrer">
            <span class="contact-icon brand-contact-icon">${brandIcon("calendar")}</span>
            <span><strong>Book a Chat</strong><small>Google Calendar invite</small></span>
          </a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>© 2026 Joshua Knott. All rights reserved.</p>
    </footer>
  `;
}

function setupNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>("#site-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

async function setupEarthGlobe(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>("#earth-globe");
  const label = document.querySelector<HTMLParagraphElement>("#earth-country-label");
  const panel = document.querySelector<HTMLElement>(".earth-panel");

  if (!canvas || !label || !panel) {
    return;
  }

  let countries: readonly CountryPolygon[];
  let three: ThreeModule;

  try {
    [three, countries] = await Promise.all([import("three"), getCountryPolygons()]);
  } catch (error) {
    label.textContent = "The interactive globe could not load.";
    label.dataset.error = error instanceof Error ? error.message : String(error);
    console.error(error);
    return;
  }

  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 5.7);

  const renderer = new three.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const earthTexture = createEarthTexture(three, countries);
  const earthGroup = new three.Group();
  scene.add(earthGroup);

  const globe = new three.Mesh(
    new three.SphereGeometry(1.52, 128, 96),
    new three.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.9,
      metalness: 0.02,
    }),
  );
  earthGroup.add(globe);

  const atmosphere = new three.Mesh(
    new three.SphereGeometry(1.58, 128, 96),
    new three.MeshBasicMaterial({
      color: 0x8dc8ff,
      transparent: true,
      opacity: 0.18,
      side: three.BackSide,
    }),
  );
  earthGroup.add(atmosphere);

  scene.add(new three.AmbientLight(0xffffff, 1.55));
  const sun = new three.DirectionalLight(0xffffff, 2.35);
  sun.position.set(4.6, 2.8, 5.2);
  scene.add(sun);

  earthGroup.rotation.x = -0.12;
  earthGroup.rotation.y = -Math.PI / 2;

  const raycaster = new three.Raycaster();
  const pointer = new three.Vector2();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let isDragging = false;
  let previousX = 0;
  let previousY = 0;
  let movedDistance = 0;

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const updatePointer = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const selectCountry = (event: PointerEvent): void => {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObject(globe);

    if (!hit?.uv) {
      label.textContent = "Click directly on the Earth to identify a country.";
      return;
    }

    const lon = hit.uv.x * 360 - 180;
    const lat = 90 - hit.uv.y * 180;
    const country = countryAtCoordinates(lon, lat, countries);
    label.textContent = country ?? "Ocean or international waters";
    label.classList.add("is-selected");
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    isDragging = true;
    movedDistance = 0;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.classList.add("is-dragging");
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    event.preventDefault();
    const deltaX = event.clientX - previousX;
    const deltaY = event.clientY - previousY;
    movedDistance += Math.abs(deltaX) + Math.abs(deltaY);
    earthGroup.rotation.y += deltaX * 0.0065;
    earthGroup.rotation.x = three.MathUtils.clamp(earthGroup.rotation.x + deltaY * 0.0045, -0.95, 0.95);
    previousX = event.clientX;
    previousY = event.clientY;
  });

  const stopDragging = (event: PointerEvent): void => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    canvas.classList.remove("is-dragging");

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (movedDistance < 8) {
      selectCountry(event);
    }
  };

  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);
  canvas.addEventListener("lostpointercapture", () => {
    isDragging = false;
    canvas.classList.remove("is-dragging");
  });

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const clock = new three.Clock();
  const animate = (): void => {
    const delta = clock.getDelta();

    if (!isDragging && !prefersReducedMotion) {
      earthGroup.rotation.y += delta * 0.025;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  canvas.dataset.ready = "true";
  animate();
}

function setupDraggableExperienceRail(): void {
  const rail = document.querySelector<HTMLElement>(".experience-grid");

  if (!rail) {
    return;
  }

  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  rail.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    isDragging = true;
    startX = event.clientX;
    startScrollLeft = rail.scrollLeft;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    event.preventDefault();
    rail.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const stopDragging = (event: PointerEvent): void => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    rail.classList.remove("is-dragging");

    if (rail.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
  };

  rail.addEventListener("pointerup", stopDragging);
  rail.addEventListener("pointercancel", stopDragging);
  rail.addEventListener("lostpointercapture", () => {
    isDragging = false;
    rail.classList.remove("is-dragging");
  });
}

function mount(): void {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Application root #app was not found.");
  }

  app.innerHTML = renderPortfolio();
  createIcons({ icons: iconSet });
  setupNavigation();
  void setupEarthGlobe();
  setupDraggableExperienceRail();
}

mount();
