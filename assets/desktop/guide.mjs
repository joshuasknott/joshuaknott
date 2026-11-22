import {bio} from './portfolio.mjs';

// Use the same project descriptions, contact links and CV facts as the windows.
// The local index also serves browsers without an installed language model.
export function portfolioNotes({projects, contacts, person}) {
  const notes = projects.map(p => ({
    route: p.id, title: p.name, tags: [p.label, p.topics].filter(Boolean).join(' '), text: [p.description, p.build, p.note].filter(Boolean).join(' '),
  }));
  const note = (route, title, tags, text) => notes.push({route, title, tags, text});
  note('projects', 'Projects', 'portfolio overview collection all apps projects products built made work examples',
    'Josh’s portfolio includes ' + projects.length + ' projects. The three featured projects are Mivlet, an AI workspace, Memvella, a memory companion, and Ollo, a Windows job-search app.');
  note('about', 'About Josh', 'who introduction introduce yourself background biography bio location based live guildford where',
    'Joshua Knott is based in ' + bio.location + '. He is a ' + person.description[0].toLowerCase() + person.description.slice(1));
  note('about', 'Education', 'degree study studies studying university graduation graduate when course college education',
    bio.education);
  note('about', 'Skills', 'tech stack technology technologies languages frameworks skills coding program programming',
    'Josh’s CV lists ' + bio.skills + ' His testing and delivery tools include GitHub Actions, Vitest and Playwright.');
  note('about', 'Experience', 'employment previously employed ambassador work experience representative',
    bio.experience);
  note('about', 'Career plans', 'hiring hire opportunity opportunities career looking roles available job plans next',
    'Josh is looking for 2027 graduate roles in product management and technology.');
  for (const [name, role, text] of bio.societies) {
    note('about', name, 'leadership led lead member society societies committee ' + role,
      name + ' · ' + role + '. ' + text);
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
  funded: 'fund', funding: 'fund', funds: 'fund', raised: 'fund', grant: 'fund',
  societies: 'society', universities: 'university', studying: 'study', studied: 'study',
  graduation: 'graduate', graduates: 'graduate', graduating: 'graduate',
  technologies: 'technology', games: 'game', gaming: 'game', leadership: 'lead', led: 'lead',
}));
function words(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).map(word => aliases.get(word) ||
    (word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word));
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
    const isProject = !['projects', 'about', 'contact'].includes(note.route);
    const named = (isProject || title.includes('society')) && phrase.includes(' ' + title.join(' ') + ' ');
    let score = named ? 10 : 0;
    for (const word of keywords) {
      if (title.includes(word)) score += 3;
      if (tags.includes(word)) score += 2.5;
      if (body.includes(word)) score += 1;
    }
    if (aboutProjects && score > 0 && isProject) score += 1.5;
    if (followUp && previous.includes(note) && (score > 0 || !keywords.size)) score += 4;
    return {note, score};
  }).filter(row => row.score > 0).sort((a,b) => b.score - a.score);
  if (!ranked.length) return [];
  return ranked.filter(row => row.score >= Math.max(1, ranked[0].score * .86)).slice(0, 3).map(row => row.note);
}

function localAnswer(matches) {
  if (!matches.length) return 'I couldn’t find that detail in Josh’s portfolio. You can ask about a project, his education, his society roles or how to reach him.';
  return matches.map(note => (note.route !== 'about' && note.route !== 'contact' && note.route !== 'projects'
    ? note.title + ' — ' : '') + note.text).join('\n\n');
}

export function createGuide(portfolio) {
  const notes = portfolioNotes(portfolio);
  const context = notes.map(n => n.title + ': ' + n.text).join('\n');
  return async function answer(question, history) {
    const matches = matchNotes(question, notes, history.at(-1)?.matches);
    const result = {matches, text: localAnswer(matches)};
    const model = globalThis.LanguageModel;
    if (!model?.availability) return result;
    const controller = new AbortController();
    let session;
    const options = {
      expectedInputs: [{type: 'text', languages: ['en']}],
      expectedOutputs: [{type: 'text', languages: ['en']}],
    };
    async function onDevice() {
      if (await model.availability(options) !== 'available' || controller.signal.aborted) return result;
      session = await model.create({...options, signal: controller.signal, initialPrompts: [
        {role: 'system', content: 'Answer questions about Joshua Knott in concise plain text, using only the following portfolio records. If the records do not answer a question, say so. Do not invent facts, dates or links.\n\n' + context},
        ...history.slice(-2).flatMap(turn => [{role: 'user', content: turn.question}, {role: 'assistant', content: turn.text}]),
      ]});
      const text = await session.prompt(question, {signal: controller.signal});
      return text.trim() ? {matches, text: text.trim()} : result;
    }
    // A slow or unavailable model should never leave the composer waiting.
    let timer;
    try {
      return await Promise.race([onDevice(), new Promise(resolve => {
        timer = setTimeout(() => { controller.abort(); resolve(result); }, 12000);
      })]);
    } catch {
      return result;
    } finally {
      clearTimeout(timer);
      controller.abort();
      session?.destroy?.();
    }
  };
}
