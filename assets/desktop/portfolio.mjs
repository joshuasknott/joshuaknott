// Captures and destinations from the portfolio catalogue. The first three are the featured projects.
const media = [
  {
    id: "mivlet",
    label: "AI workspace",
    image: "mivlet.webp",
    alt: "Mivlet’s desktop workspace with a real model response",
    video: "mivlet.mp4",
    website: "https://getmivlet.vercel.app/",
    source: "https://github.com/joshuasknott/mivlet",
    build: "Josh built the interface in React and TypeScript and the desktop backend in Rust and Tauri. Agents can work in separate copies of a repository, run checks and present changes for approval. The app uses encrypted SQLite storage.",
    note: "Recorded 6 October 2026: an existing model response, model controls and workspace navigation. Personal account details are omitted.",
  },
  {
    id: "memvella",
    label: "Memory companion",
    image: "assets/projects/2026-11/memvella-20261122.webp",
    alt: "Memvella’s public companion tablet website",
    website: "https://memvella.me",
    source: "https://github.com/joshuasknott/memvella",
    build: "Josh connected the family workspace and tablet companion using Next.js and Convex. He secured funding for the project through competitive pitches.",
    note: "Public website captured 22 November 2026. The companion preview uses fictional example stories and reminders.",
  },
  {
    id: "ollo",
    label: "Job search",
    title: "Ollo",
    image: "ollo.webp",
    alt: "ollo’s signed-in desktop workspace",
    video: "ollo.mp4",
    website: "https://getollo.vercel.app/",
    build: "Built for Windows, Ollo uses CV context, job preferences and a choice of AI providers to help people find relevant roles and review applications.",
    note: "Recorded 6 October 2026. The connected job search returned no confirmed matches; the application tracker and model controls are also shown.",
  },
  {
    id: "tokenmaxxer",
    label: "AI usage dashboard",
    image: "tokenmaxxer-usage-20261016.webp",
    alt: "TokenMaxxer showing live Codex quotas and saved usage history",
    video: "tokenmaxxer-usage-20261016.mp4",
    website: "https://tokenmaxxer-joshuaknotts-projects.vercel.app",
    source: "https://github.com/joshuasknott/tokenmaxxer",
    note: "Recorded 16 October 2026 with a connected Codex account. Live quota readings, refresh and saved usage history are shown. Account email is masked.",
  },
  {
    id: "betwfriends",
    label: "Group wagers",
    image: "betwfriends.webp",
    alt: "BetWFriends with a group created through its app",
    video: "betwfriends.mp4",
    source: "https://github.com/joshuasknott/BetWFriends",
    note: "Recorded 6 October 2026 with an isolated local backend. The wallet uses demo credit; live payments and settlement were not tested.",
  },
  {
    id: "surrey-ai",
    label: "Student community",
    title: "Surrey AI Society",
    image: "assets/projects/2026-11/surrey-ai-20261122.webp",
    alt: "The Surrey AI Society homepage",
    website: "https://surreyaisociety.org",
    note: "Public website captured 22 November 2026.",
    source: "https://github.com/joshuasknott/surreysocieties",
    build: "One of three society websites Josh built with shared Astro and TypeScript components.",
  },
  {
    id: "surrey-business",
    label: "Student community",
    image: "assets/projects/2026-11/surrey-business-20261122.webp",
    alt: "The Surrey Business Society homepage",
    website: "https://surreybusinesssociety.org",
    note: "Public website captured 22 November 2026.",
    source: "https://github.com/joshuasknott/surreysocieties",
    build: "One of three society websites Josh built with shared Astro and TypeScript components.",
  },
  {
    id: "surrey-neurotech",
    label: "Student community",
    image: "assets/projects/2026-11/surrey-neurotech-20261122.webp",
    alt: "The Surrey Neurotech Society homepage",
    website: "https://surreyneurotechsociety.org",
    note: "Public website captured 22 November 2026.",
    source: "https://github.com/joshuasknott/surreysocieties",
    build: "One of three society websites Josh built with shared Astro and TypeScript components.",
  },
  {
    id: "mantaray",
    label: "Giant manta ray anatomy",
    image: "mantaray.webp",
    alt: "The giant manta ray model in the Manta Ray anatomy study",
    video: "mantaray.mp4",
    source: "https://github.com/joshuasknott/mantaray",
    note: "Recorded 6 October 2026. An artist-built educational model with schematic cartilage; rotation, dissection and isolation are shown.",
  },
  {
    id: "poppycheese",
    label: "Railway runner",
    topics: "game",
    image: "poppycheese-gameplay-20261021.webp",
    alt: "Poppycheese’s Alpenmarkt Express game",
    video: "poppycheese-gameplay-20261021.webm",
    website: "games/poppycheese/",
    note: "Recorded 21 October 2026. Real keyboard controls show lane changes, jumps, slides and cheese collection.",
  },
  {
    id: "pianoforte",
    label: "Piano tutor",
    image: "pianoforte.webp",
    alt: "Pianoforte’s Android lesson with sheet music and piano keyboard",
    video: "pianoforte.mp4",
    source: "https://github.com/joshuasknott/pianoforte",
    note: "Recorded on an Android emulator, 6 October 2026. The clip is silent; live AI tutor replies were not verified.",
  },
  {
    id: "poppyfish",
    label: "Ocean game",
    image: "poppyfish.webp",
    alt: "Poppyfish’s playable ocean game",
    video: "poppyfish.mp4",
    note: "Recorded 6 October 2026. Swimming and boost are shown; eating and score progression are outside this recording.",
  },
  {
    id: "3danatomy",
    label: "Whale shark anatomy",
    image: "3danatomy.webp",
    alt: "The whale shark model in the Pelagic Shark anatomy exhibit",
    video: "3danatomy.mp4",
    website: "https://pelagic-whale-shark.vercel.app",
    note: "Recorded 6 October 2026. Rotation, anatomical layers and separated structures are shown in the WebGL exhibit.",
  },
];

// Biographical details come from Josh's October CV. The structured data in
// index.html supplies the same names, descriptions and contacts used by search engines.
export const bio = {
  location: 'Guildford, Surrey',
  intro: 'I study Politics and International Relations at the University of Surrey. I build desktop tools for working with AI and software that helps families care for one another.',
  grounding: 'Politics keeps my work grounded in institutions, incentives and the people software is built to serve.',
  education: 'BSc Politics & International Relations, University of Surrey. Expected graduation in June 2027.',
  work: 'I’m looking for 2027 graduate roles in product management and technology.',
  skills: 'TypeScript, JavaScript, Rust, React, Next.js, Astro, Tauri, Electron, Convex and SQLite.',
  experience: 'University of Surrey roles include Student Ambassador and elected Politics Course Representative for 2025/26. Earlier roles include Kitchen Associate at JD Wetherspoon and bar and waiting staff at the New Inn.',
  societies: [
    ['Surrey AI Society', 'President', 'Grew membership to 160+ in about a month. Leads a 14-person committee.'],
    ['Surrey Neurotech Society', 'Vice President', 'Runs digital communications. Helped organise a clinical research and biotechnology careers talk with Prima Mente.'],
    ['Surrey Business Society', 'Former President', 'Led a 10-person committee serving 330+ members and managed the Surrey Business School partnership.'],
  ],
};

export function readPortfolio(graph) {
  const person = graph.find(node => node['@type'] === 'Person');
  const descriptions = new Map(graph.map(node => [node['@id'].split('#').pop(), node]));
  const projects = media.map(item => {
    const record = descriptions.get(item.id);
    return {
      ...item, name: item.title || record.name, description: record.description,
      image: item.image.startsWith('assets/') ? item.image : 'assets/projects/2026-10/' + item.image,
      video: item.video && 'assets/projects/2026-10/' + item.video,
    };
  });
  const github = person.sameAs.find(url => new URL(url).hostname === 'github.com');
  const linkedin = person.sameAs.find(url => new URL(url).hostname.endsWith('linkedin.com'));
  const contacts = [
    {name: 'Email', value: person.email.replace(/^mailto:/, ''), href: person.email, icon: 'envelope-simple'},
    {name: 'GitHub', value: new URL(github).pathname.slice(1), href: github, icon: 'github'},
    {name: 'LinkedIn', value: person.name, href: linkedin, icon: 'linkedin'},
  ];
  return {person, projects, contacts};
}
