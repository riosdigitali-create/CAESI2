"use strict";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const siteHeader = document.querySelector(".site-header");
const menuButton = document.querySelector("#menuToggle");
const menuPanel = document.querySelector("#menuPanel");
const sections = Array.from(document.querySelectorAll("[data-view]"));
const tabs = Array.from(document.querySelectorAll("[data-tab]"));
const views = new Set(tabs.map(tab => tab.dataset.tab));
const anchors = document.querySelectorAll("[data-view][id], [data-route-anchor][id]");
const anchoredSections = new Map(Array.from(anchors, section => [section.id, section]));

function setMenu(open) {
  menuPanel.hidden = !open;
  menuButton.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  scheduleScrollUpdate();
}

menuButton.addEventListener("click", () => setMenu(menuPanel.hidden));
siteHeader.addEventListener("focusin", () => siteHeader.classList.remove("is-offscreen"));
document.addEventListener("click", event => {
  if (!menuPanel.hidden && !menuPanel.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !menuPanel.hidden) {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia("(max-width: 1050px)").addEventListener("change", () => setMenu(false));

let currentView = "inicio";
let routeFrame = 0;
function showRoute(hash, animate = false) {
  const anchor = hash.slice(1);
  if (anchor === "contenido") return;
  const section = views.has(anchor) ? null : anchoredSections.get(anchor);
  const view = views.has(anchor) ? anchor : section?.closest("[data-view]")?.dataset.view ?? "inicio";
  const changed = view !== currentView;
  currentView = view;
  sections.forEach(item => item.classList.toggle("act", item.dataset.view === view));
  tabs.forEach(tab => {
    const active = tab.dataset.tab === view;
    tab.classList.toggle("act", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });

  cancelAnimationFrame(routeFrame);
  routeFrame = requestAnimationFrame(() => {
    measureFilm();
    const behavior = animate && !changed && !reducedMotion.matches ? "smooth" : "instant";
    if (section) section.scrollIntoView({ block: "start", behavior });
    else window.scrollTo({ top: 0, behavior });
    scheduleScrollUpdate();
  });
  if (window.trackEvent) window.trackEvent("view_change", { view });
}

document.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute("href");
  const destination = anchoredSections.get(hash.slice(1));
  if (!views.has(hash.slice(1)) && !destination) return;
  event.preventDefault();
  if (menuPanel.contains(link)) {
    setMenu(false);
    document.querySelector("#contenido").focus({ preventScroll: true });
  }
  if (location.hash !== hash) history.pushState(null, "", hash);
  showRoute(hash, true);
  if (hash === "#contacto") contactSection.querySelector("h2").focus({ preventScroll: true });
  if (destination?.matches("[data-route-anchor]")) destination.focus({ preventScroll: true });
});
window.addEventListener("hashchange", () => showRoute(location.hash));
document.documentElement.classList.add("view-ready");

const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("es", { granularity: "grapheme" }) : null;

function staggerLetters(line, startIndex) {
  let index = startIndex;
  const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const fragment = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part.trim()) {
        fragment.append(part);
        continue;
      }
      const word = document.createElement("span");
      word.className = "motion-word";
      const letters = segmenter ? Array.from(segmenter.segment(part), entry => entry.segment) : Array.from(part);
      for (const character of letters) {
        const letter = document.createElement("span");
        letter.className = "motion-letter";
        letter.style.setProperty("--letter-index", index++);
        letter.textContent = character;
        word.append(letter);
      }
      fragment.append(word);
    }
    node.replaceWith(fragment);
  }
  return index;
}

function prepareHeading(heading) {
  const letterReveal = heading.hasAttribute("data-letter-reveal");
  const original = Array.from(heading.childNodes);
  heading.setAttribute("aria-label", original.map(node => node.nodeName === "BR" ? " " : node.textContent).join("").trim());
  const lines = [];
  let line = document.createElement("span");
  for (const node of original) {
    if (node.nodeName === "BR") {
      lines.push(line);
      line = document.createElement("span");
    } else {
      line.append(node);
    }
  }
  lines.push(line);
  heading.replaceChildren();

  let letterIndex = 0;
  lines.forEach((text, lineIndex) => {
    const mask = document.createElement("span");
    mask.className = "motion-mask";
    mask.setAttribute("aria-hidden", "true");
    // The whitespace keeps line boundaries readable in copied text.
    if (lineIndex) heading.append(" ");
    text.className = letterReveal ? "motion-letter-line" : "motion-line";
    if (letterReveal) letterIndex = staggerLetters(text, letterIndex);
    else text.style.setProperty("--line-index", lineIndex);
    mask.append(text);
    heading.append(mask);
  });
}

function countUp(element) {
  const value = Number(element.dataset.counter);
  const start = performance.now();
  function update(time) {
    const progress = Math.min((time - start) / 1050, 1);
    if (reducedMotion.matches) {
      element.textContent = value;
      return;
    }
    element.textContent = Math.round(value * (1 - (1 - progress) ** 3));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const root = document.documentElement;
const hero = document.querySelector(".hero-stage");
const heroLayout = hero.querySelector(".hero-layout");
const filmSlot = hero.querySelector(".hero-film-slot");
const heroActions = hero.querySelector(".hero-actions");
const expandFilm = window.matchMedia("(min-width: 1080px) and (min-height: 720px)");
const contactSection = document.querySelector("#contacto");
const evaluationDock = document.querySelector(".evaluation-dock");
const mobileDock = window.matchMedia("(max-width: 820px)");
const journey = document.querySelector("[data-journey]");
const journeyWords = Array.from(journey.querySelectorAll("[data-journey-word]"));
const journeyCards = Array.from(journey.querySelectorAll("[data-journey-card]"));
const journeyMarkers = journeyCards.map(card => {
  const marker = document.createElement("span");
  marker.className = "journey-marker";
  marker.setAttribute("aria-hidden", "true");
  card.before(marker);
  return marker;
});
const journeyFeatures = journey.querySelector(".journey-features");
for (const frame of document.querySelectorAll(".intro-media, .founder-photo")) {
  frame.classList.remove("reveal", "d2");
  frame.dataset.scrollFrame = "";
}
const scrollReveals = Array.from(document.querySelectorAll("[data-line-reveal], [data-scroll-frame]"));
const clamp = value => Math.max(0, Math.min(value, 1));
let scrollFrame = 0;
let observer;
let previousScrollY = Math.max(0, window.scrollY);
let scrollDistance = 0;
let filmTravel = 0;

function measureFilm() {
  const layout = heroLayout.getBoundingClientRect();
  const slot = filmSlot.getBoundingClientRect();
  const width = Math.min(layout.width, (layout.height - 64) * 16 / 9);
  const canExpand = expandFilm.matches && !reducedMotion.matches && slot.width > 0 && width > slot.width;
  hero.classList.toggle("is-expanding", canExpand);

  if (!canExpand) {
    hero.classList.remove("film-expanded");
    filmTravel = 0;
    return;
  }

  hero.style.setProperty("--film-shift", `${layout.left + (layout.width - width) / 2 - slot.left}px`);
  hero.style.setProperty("--film-growth", width / slot.width - 1);
  filmTravel = hero.offsetHeight - heroLayout.offsetHeight;
}

function updateFilm() {
  if (!filmTravel) return;
  const progress = clamp(-hero.getBoundingClientRect().top / filmTravel);
  const zoom = progress * progress * (3 - 2 * progress);
  setProgress(hero, "--cover-progress", zoom);
  hero.classList.toggle("film-expanded", zoom > .46);
}

function updateHeader(scrollY) {
  const change = scrollY - previousScrollY;
  previousScrollY = scrollY;

  if (scrollY <= 4 || !menuPanel.hidden || siteHeader.querySelector(":focus-visible")) {
    siteHeader.classList.remove("is-offscreen");
    scrollDistance = 0;
    return;
  }
  if (!change) return;
  if (Math.sign(change) !== Math.sign(scrollDistance)) scrollDistance = 0;
  scrollDistance += change;

  if (scrollY > 24 && scrollDistance > 12) siteHeader.classList.add("is-offscreen");
  if (scrollDistance < -12) siteHeader.classList.remove("is-offscreen");
}

function updateOnScroll() {
  scrollFrame = 0;
  const scrollY = Math.max(0, window.scrollY);
  const viewport = window.innerHeight;
  updateHeader(scrollY);
  updateEvaluationDock(viewport);
  if (!root.classList.contains("motion-ready")) return;

  const pageDistance = Math.max(1, root.scrollHeight - viewport);
  const track = journeyFeatures.getBoundingClientRect();
  const markerTops = track.height ? journeyMarkers.map(marker => marker.getBoundingClientRect().top) : [];
  const reveals = scrollReveals.map(element => [element, element.getBoundingClientRect()]);

  setProgress(root, "--page-progress", scrollY / pageDistance);
  updateFilm();
  for (const [element, bounds] of reveals) {
    if (bounds.height) setProgress(element, "--reveal-progress", (viewport * .93 - bounds.top) / (viewport * .29));
  }

  if (!track.height) return;
  const target = viewport * .6;
  const fills = markerTops.map(top => (target - top + 32) / Math.min(150, viewport * .24));
  const activeCard = fills.findLastIndex(fill => fill > .22);
  setProgress(journey, "--journey-progress", (target - track.top) / track.height);
  journeyCards.forEach((card, index) => {
    card.classList.toggle("active", index === activeCard);
    journeyMarkers[index].classList.toggle("active", index === activeCard);
    setProgress(journeyWords[index], "--word-progress", fills[index]);
    setProgress(card, "--card-progress", (viewport * .94 - markerTops[index]) / (viewport * .34));
  });
}

function updateEvaluationDock(viewport) {
  if (!evaluationDock) return;
  if (!mobileDock.matches || !menuPanel.hidden) {
    evaluationDock.hidden = true;
    return;
  }
  const primary = heroActions.getBoundingClientRect();
  const contact = contactSection.getBoundingClientRect();
  const primaryVisible = primary.height > 0 && primary.bottom > 0 && primary.top < viewport;
  const beforeContact = contact.height === 0 || contact.top >= viewport - 12;
  evaluationDock.hidden = primaryVisible || !beforeContact;
}

function setProgress(element, property, fraction) {
  const value = clamp(fraction).toFixed(3);
  if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
}

function scheduleScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateOnScroll);
}

function setupHeroVideo() {
  const video = document.querySelector("#heroVideo");
  const toggle = document.querySelector(".hero-video-toggle");
  const footerActions = document.querySelector(".colab-link")?.parentElement;
  if (!video || !toggle || !footerActions) return;

  // Keep the pause control in the footer so the film itself stays unobstructed.
  toggle.className = "hero-motion-toggle";
  toggle.removeAttribute("aria-label");
  footerActions.classList.add("foot-actions");
  footerActions.prepend(toggle);

  const source = new URL(video.dataset.src, document.baseURI);
  source.searchParams.set("v", "3");

  const connection = navigator.connection;
  let choice = "auto";
  let inView = !("IntersectionObserver" in window);

  function playbackEnabled() {
    return choice === "play" || (choice === "auto" && !reducedMotion.matches && !connection?.saveData);
  }

  function syncPlayback() {
    const enabled = playbackEnabled();
    const label = enabled ? "Pausar video de portada" : "Activar video de portada";
    if (toggle.textContent !== label) toggle.textContent = label;
    if (!inView || document.hidden || !enabled) {
      video.pause();
      return;
    }
    if (!video.hasAttribute("src")) video.src = source.href;
    if (video.paused) video.play().catch(() => {});
  }

  video.addEventListener("playing", () => video.classList.add("has-frame"));
  video.addEventListener("error", () => {
    video.classList.remove("has-frame");
    toggle.hidden = true;
  });
  toggle.addEventListener("click", () => {
    choice = playbackEnabled() ? "pause" : "play";
    syncPlayback();
  });
  document.addEventListener("visibilitychange", syncPlayback);
  reducedMotion.addEventListener("change", syncPlayback);
  connection?.addEventListener?.("change", syncPlayback);
  toggle.hidden = false;

  if ("IntersectionObserver" in window) {
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .15;
      syncPlayback();
    }, { threshold: .15 });
    visibility.observe(video.closest(".hero-film"));
  }
  syncPlayback();
}

function setMotion() {
  if (!("IntersectionObserver" in window)) return;
  const ready = !reducedMotion.matches;
  root.classList.toggle("motion-ready", ready);
  measureFilm();
  observer?.disconnect();
  if (!ready) return;

  observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add("in");
      if (target.hasAttribute("data-counter")) countUp(target);
      observer.unobserve(target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -4% 0px" });

  document.querySelectorAll(".reveal, [data-line-reveal], [data-letter-reveal], [data-counter]").forEach(element => {
    if (!element.classList.contains("in")) observer.observe(element);
  });
  scheduleScrollUpdate();
}

document.querySelectorAll("[data-line-reveal], [data-letter-reveal]").forEach(prepareHeading);
reducedMotion.addEventListener("change", setMotion);
window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  measureFilm();
  scheduleScrollUpdate();
}, { passive: true });
const optionalDetails = document.querySelector(".lf-optional");
optionalDetails?.addEventListener("invalid", () => { optionalDetails.open = true; }, true);
document.fonts?.ready.then(() => {
  measureFilm();
  scheduleScrollUpdate();
});
showRoute(location.hash);
setMotion();
setupHeroVideo();
