import {bio, readPortfolio} from './portfolio.mjs';
import {createGuide} from './guide.mjs';
import {createSunset} from './sunset.mjs';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function photo(src, alt, className) {
  const img = el('img', className);
  img.src = src;
  img.alt = alt;
  img.draggable = false;
  return img;
}

function link(text, href) {
  const a = el('a', '', text);
  a.href = href;
  if (!href.startsWith('mailto:')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

function projectCard(project, index) {
  const card = el('button', 'project-card');
  card.type = 'button';
  card.dataset.open = project.id;
  const cover = photo(project.cover || project.image, '', project.cover ? 'project-cover artwork' : 'project-cover');
  if (index > 2) cover.loading = 'lazy';
  card.append(cover, el('span', 'project-name', project.name), el('span', 'project-label', project.label));
  return card;
}

function projectDetails(project) {
  const article = el('article', 'desktop-article project-detail');
  if (project.video) {
    const video = el('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = project.image;
    video.src = project.video;
    video.setAttribute('aria-label', project.name + ' walkthrough');
    article.append(video);
  } else {
    article.append(photo(project.image, project.alt));
  }
  const copy = el('div');
  copy.append(el('h3', '', project.label), el('p', '', project.description));
  if (project.build) copy.append(el('p', '', project.build));
  const links = el('div', 'detail-links');
  if (project.website) links.append(link('Visit website', project.website));
  if (project.source) links.append(link('View source', project.source));
  copy.append(links);
  article.append(copy);
  return article;
}

function about(person, openCV) {
  const article = el('article', 'desktop-article');
  const intro = el('div', 'about-intro');
  const copy = el('div');
  copy.append(el('h3', '', person.name), el('p', 'location', bio.location), el('p', '', bio.intro), el('p', '', bio.work));
  const cv = el('button', 'answer-source', 'Read my CV');
  cv.type = 'button';
  cv.addEventListener('click', () => openCV(cv));
  copy.append(cv);
  intro.append(photo('assets/joshua-knott-avatar.png', 'Joshua Knott'), copy);
  article.append(intro);
  for (const [title, text] of [['Education', bio.education], ['Technical skills', bio.skills], ['Experience', bio.experience]]) {
    const section = el('section', 'profile-section');
    section.append(el('h3', '', title), el('p', '', text));
    article.append(section);
  }
  const section = el('section', 'profile-section');
  const roles = el('dl');
  for (const [society, role, text] of bio.societies) {
    roles.append(el('dt', '', society + ' · ' + role), el('dd', '', text));
  }
  section.append(el('h3', '', 'Society leadership'), roles);
  article.append(section);
  return article;
}

function contact(contacts) {
  const article = el('section', 'desktop-article');
  article.append(el('h3', '', 'Get in touch'), el('p', '', bio.work));
  const links = el('div', 'contact-list');
  for (const item of contacts) {
    const a = link('', item.href);
    a.className = 'contact-link';
    a.append(photo('assets/icons/' + item.icon + '.svg', ''), el('b', '', item.name), el('span', '', item.value));
    links.append(a);
  }
  article.append(links);
  return article;
}

const appTitles = {projects: 'Projects', about: 'About', contact: 'Contact', questions: 'Portfolio questions'};

export function createDesktop(screen, {readCV, onExpand}) {
  const desktop = screen.querySelector('.portfolio-desktop');
  const dialog = document.querySelector('.expanded-desktop');
  const win = desktop.querySelector('.desktop-window');
  const title = win.querySelector('#window-title');
  const content = win.querySelector('.window-body');
  const home = win.querySelector('.window-home');
  const back = win.querySelector('.window-back');
  const view = win.querySelector('.window-view');
  const expand = desktop.querySelector('.screen-expand');
  const appButtons = [...desktop.querySelectorAll('[data-app]')];
  const form = desktop.querySelector('.portfolio-composer');
  const input = form.elements.question;
  const send = form.querySelector('button[type="submit"]');
  const status = desktop.querySelector('.desktop-status');
  const compact = matchMedia('(max-width: 760px), (max-height: 420px)');
  const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  const portfolio = readPortfolio(graph);
  const projects = new Map(portfolio.projects.map(project => [project.id, project]));
  const commands = new Map([
    ['projects', 'projects'], ['about', 'about'], ['contact', 'contact'],
    ...portfolio.projects.map(project => [project.name.toLowerCase(), project.id]),
  ]);
  const ask = createGuide(portfolio);
  const history = [];
  const turns = [];
  let route = null;
  let list = false;
  let pending = false;

  function app() { return projects.has(route) ? 'projects' : route; }

  function questions() {
    const log = el('div', 'desktop-article question-thread');
    for (const turn of turns) {
      const article = el('article');
      article.append(el('h3', '', turn.question), el('p', '', turn.text || 'Looking through the portfolio…'));
      const sources = el('div', 'answer-sources');
      const routes = new Set(turn.matches?.map(note => note.route));
      for (const id of routes) {
        const button = el('button', 'answer-source', projects.get(id)?.name || appTitles[id]);
        button.type = 'button';
        button.dataset.open = id;
        sources.append(button);
      }
      article.append(sources);
      log.append(article);
    }
    return log;
  }

  function draw() {
    win.hidden = !route;
    desktop.toggleAttribute('data-open', Boolean(route));
    for (const button of appButtons) {
      if (button.dataset.app === app()) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    content.querySelector('video')?.pause();
    if (!route) {
      desktop.removeAttribute('data-app');
      content.replaceChildren();
      return;
    }
    const project = projects.get(route);
    title.textContent = project?.name || appTitles[route];
    desktop.dataset.app = app();
    view.hidden = route !== 'projects';
    view.title = list ? 'Show project grid' : 'Show project list';
    view.setAttribute('aria-label', view.title);
    view.firstElementChild.src = 'assets/icons/' + (list ? 'squares-four' : 'list-dashes') + '.svg';
    back.hidden = !history.length && !project;
    if (project) content.replaceChildren(projectDetails(project));
    else if (route === 'about') content.replaceChildren(about(portfolio.person, opener => {
      const wasExpanded = dialog.open;
      if (wasExpanded) setExpanded(false);
      readCV(opener, () => { if (wasExpanded) setExpanded(true); });
    }));
    else if (route === 'contact') content.replaceChildren(contact(portfolio.contacts));
    else if (route === 'questions') content.replaceChildren(questions());
    else {
      const grid = el('div', 'project-grid' + (list ? ' is-list' : ''));
      grid.append(...portfolio.projects.map(projectCard));
      content.replaceChildren(grid);
    }
    content.scrollTop = 0;
  }

  function navigate(next, {remember = true, focus = true, opener} = {}) {
    if (!projects.has(next) && !Object.hasOwn(appTitles, next)) return;
    if (remember && route && next !== route) {
      history.push({route, top: content.scrollTop, opener});
    }
    route = next;
    draw();
    if (focus) title.focus({preventScroll: true});
  }

  function goBack() {
    const entry = history.pop();
    if (!entry) {
      if (projects.has(route)) navigate('projects', {remember: false});
      return;
    }
    navigate(entry.route, {remember: false});
    content.scrollTop = entry.top;
    if (entry.opener) content.querySelector('button[data-open="' + CSS.escape(entry.opener) + '"]')?.focus({preventScroll: true});
  }

  function setExpanded(on) {
    if (dialog.open === on) return;
    if (on) {
      dialog.append(desktop);
      dialog.showModal();
    } else {
      dialog.close();
      screen.append(desktop);
    }
    expand.title = on ? 'Return to desk' : 'Expand desktop';
    expand.setAttribute('aria-label', expand.title);
    expand.firstElementChild.src = 'assets/icons/' + (on ? 'arrows-in' : 'expand') + '.svg';
    expand.focus({preventScroll: true});
    onExpand(on);
  }

  function returnHome() {
    const previous = app();
    history.length = 0;
    route = null;
    draw();
    const launcher = appButtons.find(button => button.dataset.app === previous && button.getClientRects().length);
    (launcher || input).focus({preventScroll: true});
  }

  function expandIfSmall() {
    if (compact.matches && !dialog.open) setExpanded(true);
  }

  createSunset(desktop, expandIfSmall);

  desktop.addEventListener('click', event => {
    const button = event.target.closest('button[data-app], button[data-open]');
    if (!button) return;
    expandIfSmall();
    navigate(button.dataset.app || button.dataset.open, {opener: button.dataset.open});
  });
  home.addEventListener('click', returnHome);
  back.addEventListener('click', goBack);
  view.addEventListener('click', () => {
    expandIfSmall();
    list = !list;
    draw();
    view.focus({preventScroll: true});
  });
  expand.addEventListener('click', () => setExpanded(!dialog.open));
  function escapeDesktop() {
    if (projects.has(route)) goBack();
    else if (route) returnHome();
    else if (dialog.open) setExpanded(false);
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); escapeDesktop(); });
  desktop.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || document.fullscreenElement) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!event.repeat) escapeDesktop();
      return;
    }
    const card = event.target.closest('.project-card');
    if (!card || !event.key.startsWith('Arrow')) return;
    const cards = [...card.parentElement.children];
    const columns = list ? 1 : getComputedStyle(card.parentElement).gridTemplateColumns.split(' ').length;
    const step = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns}[event.key];
    if (step) {
      event.preventDefault();
      const next = cards[Math.max(0, Math.min(cards.length - 1, cards.indexOf(card) + step))];
      next.focus({preventScroll: true});
      if (next.offsetTop < content.scrollTop) content.scrollTop = next.offsetTop;
      else if (next.offsetTop + next.offsetHeight > content.scrollTop + content.clientHeight) {
        content.scrollTop = next.offsetTop + next.offsetHeight - content.clientHeight;
      }
    }
  });

  input.addEventListener('focus', () => {
    if (compact.matches && !dialog.open) {
      setExpanded(true);
      input.focus({preventScroll: true});
    }
  });
  window.addEventListener('keydown', event => {
    if (event.key !== '/' || event.defaultPrevented || event.isComposing ||
        event.ctrlKey || event.metaKey || event.altKey || document.fullscreenElement || desktop.hidden || screen.hidden) return;
    const target = event.target;
    if (target.isContentEditable || target.closest?.('input, textarea, select, [role="textbox"]')) return;
    if (document.querySelector('dialog:modal') && !dialog.open) return;
    event.preventDefault();
    input.focus({preventScroll: true});
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    expandIfSmall();
    const command = question.toLowerCase().replace(/^open\s+/, '').replace(/\s+/g, ' ');
    if (commands.has(command)) {
      input.value = '';
      navigate(commands.get(command));
      return;
    }
    if (pending) return;
    const previous = turns.slice();
    const turn = {question, text: ''};
    turns.push(turn);
    input.value = '';
    pending = true;
    send.disabled = true;
    navigate('questions', {focus: false});
    content.scrollTop = content.scrollHeight;
    input.focus({preventScroll: true});
    try {
      Object.assign(turn, await ask(question, previous));
    } catch {
      turn.text = 'The guide couldn’t finish that answer. Try asking again or open Projects, About or Contact.';
    } finally {
      pending = false;
      send.disabled = false;
      if (route === 'questions' && !win.hidden) {
        draw();
        content.scrollTop = content.querySelector('.question-thread article:last-child').offsetTop;
        status.textContent = turn.text;
      }
    }
  });

  function linkedRoute() {
    const id = location.hash.slice(1).replace(/^project-/, '');
    return projects.has(id) || ['projects', 'about', 'contact'].includes(id) ? id : null;
  }
  window.addEventListener('hashchange', () => {
    const id = linkedRoute();
    if (desktop.hidden) return;
    if (id) {
      expandIfSmall();
      navigate(id);
    } else if (route) returnHome();
  });
  return {
    open() {
      desktop.hidden = false;
      const id = linkedRoute();
      if (id) {
        expandIfSmall();
        navigate(id);
      } else draw();
    },
    pauseMedia() { content.querySelector('video')?.pause(); },
  };
}
