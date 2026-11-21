"use strict";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = document.querySelector("#menuToggle");
const menuPanel = document.querySelector("#menuPanel");
const sections = Array.from(document.querySelectorAll("[data-view]"));
const tabs = Array.from(document.querySelectorAll("[data-tab]"));
const views = new Set(tabs.map(tab => tab.dataset.tab));
const anchoredSections = new Map(sections.filter(section => section.id).map(section => [section.id, section]));

function setMenu(open) {
  menuPanel.hidden = !open;
  menuButton.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

menuButton.addEventListener("click", () => setMenu(menuPanel.hidden));
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
  const view = views.has(anchor) ? anchor : section?.dataset.view ?? "inicio";
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
  if (!views.has(hash.slice(1)) && !anchoredSections.has(hash.slice(1))) return;
  event.preventDefault();
  if (menuPanel.contains(link)) {
    setMenu(false);
    document.querySelector("#contenido").focus({ preventScroll: true });
  }
  if (location.hash !== hash) history.pushState(null, "", hash);
  showRoute(hash, true);
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
    else text.style.setProperty("--line-delay", `${lineIndex * 95}ms`);
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
const journey = document.querySelector("[data-journey]");
const journeyWords = Array.from(journey.querySelectorAll("[data-journey-word]"));
const journeyCards = Array.from(journey.querySelectorAll("[data-journey-card]"));
const journeyFeatures = journey.querySelector(".journey-features");
const clamp = value => Math.max(0, Math.min(value, 1));
let scrollFrame = 0;
let observer;

function updateOnScroll() {
  scrollFrame = 0;
  if (!root.classList.contains("motion-ready")) return;

  const viewport = window.innerHeight;
  root.style.setProperty("--page-progress", clamp(window.scrollY / Math.max(1, root.scrollHeight - viewport)));

  const heroRect = hero.getBoundingClientRect();
  if (heroRect.height && heroRect.bottom > 0) {
    const offset = Math.max(0, window.scrollY) * .18;
    hero.style.setProperty("--photo-shift", `${Math.min(offset, 78).toFixed(1)}px`);
  }

  const track = journeyFeatures.getBoundingClientRect();
  if (!track.height) return;
  const target = viewport * .6;
  const progress = clamp((target - track.top) / track.height);
  const visible = journeyCards.map(card => {
    const bounds = card.getBoundingClientRect();
    return clamp((target - bounds.top + 30) / Math.min(120, bounds.height * .55));
  });
  journey.style.setProperty("--journey-progress", `${(progress * 100).toFixed(1)}%`);
  const activeCard = visible.findLastIndex(fill => fill > .16);
  journeyCards.forEach((card, index) => {
    card.classList.toggle("active", index === activeCard);
    journeyWords[index].style.setProperty("--word-fill", `${(visible[index] * 100).toFixed(1)}%`);
  });
}

function scheduleScrollUpdate() {
  if (!scrollFrame && root.classList.contains("motion-ready")) scrollFrame = requestAnimationFrame(updateOnScroll);
}

function setMotion() {
  if (!("IntersectionObserver" in window)) return;
  const ready = !reducedMotion.matches;
  root.classList.toggle("motion-ready", ready);
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
window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
showRoute(location.hash);
setMotion();
