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
    cover: "assets/desktop/mivlet.webp",
  },
  {
    id: "memvella",
    label: "Memory companion",
    image: "memvella-companion-20261021.webp",
    alt: "Memvella’s Companion tablet demo with a family story, a gentle reminder and Tap to talk",
    website: "https://memvella.me",
    source: "https://github.com/joshuasknott/memvella",
    build: "Josh connected the family workspace and tablet companion using Next.js and Convex. He secured funding for the project through competitive pitches.",
    cover: "assets/desktop/memvella.webp",
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
    cover: "assets/desktop/ollo.webp",
  },
  {
    id: "tokenmaxxer",
    label: "AI usage dashboard",
    image: "tokenmaxxer-usage-20261016.webp",
    alt: "TokenMaxxer showing live Codex quotas and saved usage history",
    video: "tokenmaxxer-usage-20261016.mp4",
    website: "https://tokenmaxxer-joshuaknotts-projects.vercel.app",
    source: "https://github.com/joshuasknott/tokenmaxxer",
  },
  {
    id: "betwfriends",
    label: "Group wagers",
    image: "betwfriends.webp",
    alt: "BetWFriends with a group created through its app",
    video: "betwfriends.mp4",
    source: "https://github.com/joshuasknott/BetWFriends",
  },
  {
    id: "surrey-ai",
    label: "Student community",
    title: "Surrey AI Society",
    image: "surrey-ai-home.webp",
    alt: "The Surrey AI Society homepage",
    website: "https://surreyaisociety.org",
    source: "https://github.com/joshuasknott/surreysocieties",
    build: "One of three society websites Josh built with shared Astro and TypeScript components.",
  },
  {
    id: "surrey-business",
    label: "Student community",
    image: "surrey-business.webp",
    alt: "The Surrey Business Society homepage",
    website: "https://surreybusinesssociety.org",
    source: "https://github.com/joshuasknott/surreysocieties",
    build: "One of three society websites Josh built with shared Astro and TypeScript components.",
  },
  {
    id: "surrey-neurotech",
    label: "Student community",
    image: "surrey-neurotech.webp",
    alt: "The Surrey Neurotech Society homepage",
    website: "https://surreyneurotechsociety.org",
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
  },
  {
    id: "poppycheese",
    label: "Railway runner",
    topics: "game",
    image: "poppycheese-gameplay-20261021.webp",
    alt: "Poppycheese’s Alpenmarkt Express game",
    video: "poppycheese-gameplay-20261021.webm",
    website: "games/poppycheese/",
  },
  {
    id: "pianoforte",
    label: "Piano tutor",
    image: "pianoforte.webp",
    alt: "Pianoforte’s Android lesson with sheet music and piano keyboard",
    video: "pianoforte.mp4",
    source: "https://github.com/joshuasknott/pianoforte",
  },
  {
    id: "poppyfish",
    label: "Ocean game",
    image: "poppyfish.webp",
    alt: "Poppyfish’s playable ocean game",
    video: "poppyfish.mp4",
  },
  {
    id: "3danatomy",
    label: "Whale shark anatomy",
    image: "3danatomy.webp",
    alt: "The whale shark model in the Pelagic Shark anatomy exhibit",
    video: "3danatomy.mp4",
    website: "https://pelagic-whale-shark.vercel.app",
  },
];

// Biographical details come from Josh's October CV. The structured data in
// index.html supplies the same names, descriptions and contacts used by search engines.
export const bio = {
  location: 'Guildford, Surrey',
  intro: 'I study Politics and International Relations at the University of Surrey. I build desktop tools for working with AI and software that helps families care for one another.',
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
      image: 'assets/projects/2026-10/' + item.image,
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

