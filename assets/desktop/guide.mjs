import {bio} from './portfolio.mjs';

// Use the same project descriptions, contact links and CV facts as the windows.
// The local index also serves browsers without an installed language model.
export function portfolioNotes({projects, contacts, person}) {
  const notes = projects.map(p => ({
    route: p.id, title: p.name, project: p, tags: [p.label, p.topics].filter(Boolean).join(' '), text: [p.description, p.build, p.note].filter(Boolean).join(' '),
  }));
  const note = (route, title, tags, text) => notes.push({route, title, tags, text});
  note('projects', 'Projects', 'portfolio overview collection all apps projects products built made work examples',
    'Josh’s portfolio includes ' + projects.length + ' projects. The three featured projects are Mivlet, an AI workspace, Memvella, a memory companion, and Ollo, a Windows job-search app.');
  note('about', 'About Josh', 'who introduction introduce yourself background biography bio location based live guildford where',
    'Joshua Knott is based in ' + bio.location + '. He is a ' + person.description[0].toLowerCase() + person.description.slice(1));
  note('about', 'Education', 'degree study studies studying university graduation graduate when course college education',
    bio.education);
  note('cv', 'CV', 'cv resume curriculum vitae', 'Read Josh’s CV for his education, skills and experience.');
  note('about', 'Skills', 'tech stack technology technologies languages frameworks skills coding program programming',
    'Josh’s CV lists ' + bio.skills + ' His testing and delivery tools include GitHub Actions, Vitest and Playwright.');
  note('about', 'Experience', 'employment previously employed ambassador work experience representative',
    bio.experience);
  note('about', 'Career plans', 'hiring hire opportunity opportunities career looking roles available job plans next',
    'Josh is looking for 2027 graduate roles in product management and technology.');
  for (const [name, role, text] of bio.societies) {
    note('about', name, 'leadership led lead member society societies committee ' + role,
      name + ' · ' + role + '. ' + text);
    notes.at(-1).societyRole = true;
  }
  note('contact', 'Contact', 'reach touch contact connect collaborate collaboration message get hold social profiles',
    'Email Josh at ' + contacts[0].value + '. His GitHub and LinkedIn profiles are linked in Contact.');
  for (const contact of contacts) {
    note('contact', contact.name, contact.name === 'Email' ? 'mail email address e-mail' : 'profile handle',
      contact.name === 'Email' ? 'Josh’s email is ' + contact.value + '.' : 'Josh’s ' + contact.name + ' profile is ' + contact.href + '.');
  }
  return notes;
}

const stopWords = new Set(('a an the is are am was were has have had can could would should did does do ' +
  'what which of on at be to for as how me in and or also with his her he you your yours his it its this that these those ' +
  'i my our any some about tell please more information info details know josh joshua knott s ' +
  'use uses using received there').split(' '));
const aliases = new Map(Object.entries({
  stack: 'technology', tech: 'technology', uni: 'university', resume: 'cv', reach: 'contact', email: 'contact',
  funded: 'fund', funding: 'fund', funds: 'fund', raised: 'fund', grant: 'fund',
  societies: 'society', universities: 'university', studying: 'study', studied: 'study',
  graduation: 'graduate', graduates: 'graduate', graduating: 'graduate',
  technologies: 'technology', games: 'game', gaming: 'game', leadership: 'lead', led: 'lead',
}));
function words(text) {
  text = text.toLowerCase().replace(/\bmemvela\b/g, 'memvella').replace(/\bmivelt\b/g, 'mivlet')
    .replace(/\btoken\s+maxxer\b/g, 'tokenmaxxer').replace(/\bmanta\s+ray\b/g, 'mantaray')
    .replace(/\bpelagic\s+shark\b/g, '3danatomy');
  return (text.match(/[a-z0-9]+/g) || []).map(word => aliases.get(word) ||
    (word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word));
}

function near(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) <= 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function matchNotes(question, notes, previous = []) {
  const phrase = ' ' + words(question).join(' ') + ' ';
  const keywords = new Set(words(question).filter(w => !stopWords.has(w)));
  const broad = ['project', 'portfolio', 'app', 'built', 'made'];
  const aboutProjects = keywords.has('project') || keywords.has('app');
  if (Array.from(keywords).some(word => !broad.includes(word))) {
    for (const term of broad) keywords.delete(term);
  }
  if (keywords.size > 1) keywords.delete('where');
  if (!keywords.size && !previous.length && /who|yourself|about/i.test(question)) keywords.add('biography');
  const followUp = /\b(it|that|this|those|them|more|its)\b/i.test(question);
  const ranked = notes.map(note => {
    const title = words(note.title);
    const tags = words(note.tags);
    const body = words(note.text);
    const isProject = Boolean(note.project);
    const named = (isProject || title.includes('society')) && phrase.includes(' ' + title.join(' ') + ' ');
    let score = named ? (isProject ? 14 : 10) : 0;
    if (named && note.societyRole && /\b(president|vice president|role|roles|positions?|leadership|committee)\b/i.test(question)) score += 10;
    for (const word of keywords) {
      if (title.some(term => near(word, term))) score += 3;
      if (tags.some(term => near(word, term))) score += 2.5;
      if (body.some(term => near(word, term))) score += 1;
    }
    if (aboutProjects && score > 0 && isProject) score += 1.5;
    if (followUp && previous.includes(note) && (score > 0 || !keywords.size)) score += 4;
    return {note, score};
  }).filter(row => row.score > 0).sort((a,b) => b.score - a.score);
  if (!ranked.length) return [];
  return ranked.filter(row => row.score >= Math.max(1, ranked[0].score * .45)).slice(0, 4).map(row => row.note);
}

export const suggestedQuestions = ['What AI projects has Josh built?', 'What games has he made?', 'How can I contact Josh?'];

function source(note) {
  return {label: note.route === 'about' ? 'About Josh' : note.title, route: note.route, href: note.route === 'cv' ? 'assets/documents/Joshua-Knott-CV.pdf' : '#' + note.route};
}

export function createGuide(portfolio) {
  const notes = portfolioNotes(portfolio);
  return async function answer(question, history = [], {onUpdate, signal} = {}) {
    const simple = question.trim().toLowerCase().replace(/[!?.]+$/g, '');
    const base = {matches: [], links: [], related: [], suggestions: []};
    if (!simple) return {...base, text: 'Ask me about Josh’s projects, background or contact details.', suggestions: suggestedQuestions};
    if (/^(hi|hello|hey|good morning|good evening)( there)?$/.test(simple)) return {...base, text: 'Hi! What would you like to know about Josh’s work?', suggestions: suggestedQuestions};
    if (/^(thanks|thank you|cheers)( a lot)?$/.test(simple)) return {...base, text: 'You’re welcome! Happy to help you explore Josh’s work.'};
    const tokens = words(question);
    if (/\b(what|which|list|show)\b/i.test(question) && !portfolio.projects.some(p => words(p.name).every(word => tokens.includes(word))) && /\b(games?|ai projects)\b/i.test(question)) {
      const games = /\bgames?\b/i.test(question);
      const matches = notes.filter(n => n.project && (games ? /game/i : /\bAI\b/i).test([n.tags, n.project.description, n.project.build].filter(Boolean).join(' ')));
      return {...base, matches, text: (games ? 'Games' : 'AI projects') + ' in the portfolio: ' + matches.map(n => n.title).join(', ') + '.', links: matches.map(source)};
    }
    const matches = matchNotes(question, notes, history.at(-1)?.matches);
    if (!matches.length) return {...base, text: 'I couldn’t find that detail in Josh’s portfolio.', suggestions: suggestedQuestions};
    const best = matches[0];
    const project = best.project;
    let text = best.text;
    const links = [source(best)];
    if (project) {
      if (/\b(stack|tech|technolog\w*|built with|made with)\b/i.test(question)) text = project.build || 'The portfolio does not specify the technology stack for ' + project.name + '.';
      else if (/\b(open source|source|github)\b/i.test(question)) {
        text = project.source ? 'The portfolio links to the source repository for ' + project.name + '. A public repository alone does not establish its licence.' : 'No source repository is linked for ' + project.name + ' in the portfolio.';
        if (project.source) links.push({label: 'Source repository', href: project.source});
      } else if (/\b(link|website|visit|url)\b/i.test(question)) {
        text = project.website ? 'You can visit ' + project.name + ' using the website link.' : 'No public website is linked for ' + project.name + '.';
        if (project.website) links.push({label: 'Visit ' + project.name, href: project.website});
      }
    }
    const related = matches.slice(1).filter((n, i, rest) => n.route !== best.route && rest.findIndex(other => other.route === n.route) === i).map(source);
    const result = {...base, matches, text, links, related};
    if (onUpdate && globalThis.LanguageModel?.availability) {
      void refine();
    }
    return result;

    async function refine() {
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener('abort', abort, {once: true});
      if (signal?.aborted) controller.abort();
      const timer = setTimeout(abort, 6000);
      let session;
      try {
        const model = globalThis.LanguageModel;
        if (await model.availability() !== 'available' || controller.signal.aborted) return;
        session = await model.create({signal: controller.signal, initialPrompts: [{role: 'system', content: 'Give one short focused answer using only this verified answer. Do not add facts, dates, links or claims. If unsure repeat it exactly.\n' + text}]});
        if (controller.signal.aborted) return;
        if (session.promptStreaming) {
          for await (const chunk of session.promptStreaming(question, {signal: controller.signal})) {
            if (controller.signal.aborted) break;
            if (chunk.trim()) onUpdate({...result, text: chunk.trim()});
          }
        } else {
          const output = await session.prompt(question, {signal: controller.signal});
          if (!controller.signal.aborted && output.trim()) onUpdate({...result, text: output.trim()});
        }
      } catch {
        if (!signal?.aborted) onUpdate(result);
      } finally {
        clearTimeout(timer);
        controller.abort();
        signal?.removeEventListener('abort', abort);
        session?.destroy?.();
      }
    }
  };
}
