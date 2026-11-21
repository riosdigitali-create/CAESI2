const services = [
  {
    id: "stps",
    icon: "stps",
    name: "STPS",
    title: "Seguridad y salud laboral",
    description: "Identifica qué evidencias necesita tu centro de trabajo para demostrar el cumplimiento de las NOM aplicables.",
    checks: [
      ["Expedientes por norma", "Actas, registros y evidencias de tu operación."],
      ["Capacitación del personal", "Constancias y documentos de los cursos impartidos."],
      ["Pendientes de cumplimiento", "Acciones y documentos que conviene atender primero."]
    ]
  },
  {
    id: "proteccion-civil",
    icon: "civil",
    name: "Protección Civil",
    title: "Preparación ante emergencias",
    description: "Revisa si tu centro de trabajo cuenta con el programa, la capacitación y la documentación para responder ante una emergencia.",
    checks: [
      ["Programa Interno", "Documentación y registro que aplican a tu centro de trabajo."],
      ["Brigadas", "Integración, capacitación y evidencias de tu equipo."],
      ["Rutas y simulacros", "Planes de evacuación, registros y seguimiento de prácticas."]
    ]
  },
  {
    id: "medio-ambiente",
    icon: "environment",
    name: "Medio Ambiente",
    title: "Obligaciones ambientales",
    description: "Ubica los trámites y reportes que corresponden a tu actividad y organiza su seguimiento.",
    checks: [
      ["Permisos y trámites", "Revisión de la MAU y otros trámites según tu operación."],
      ["Estudios y reportes", "Documentos ambientales, cédulas y registros de entrega."],
      ["Vencimientos", "Fechas y pendientes para planear próximas entregas."]
    ]
  }
];

function serviceTab({ id, icon, name }, index) {
  return `
    <button class="review-tab" type="button" role="tab" id="area-${id}"
      aria-controls="revision-${id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">
      <span class="service-glyph ${icon}" aria-hidden="true"></span>
      <span>${name}</span>
    </button>`;
}

function servicePanel({ id, name, title, description, checks }, index) {
  return `
    <div class="review-panel" role="tabpanel" id="revision-${id}" aria-labelledby="area-${id}"
      tabindex="0"${index ? " hidden" : ""}>
      <div class="review-intro">
        <h3>${title}</h3>
        <p>${description}</p>
        <a class="solution-link btn-arrow" href="#servicio-${id}">Ver servicio <span class="sr-only">de ${name}</span></a>
      </div>
      <ul class="review-checks">
        ${checks.map(([title, detail]) => `
          <li><span class="review-mark" aria-hidden="true"></span><div><strong>${title}</strong><p>${detail}</p></div></li>`
        ).join("")}
      </ul>
    </div>`;
}

function prepareServices(overview) {
  overview.querySelector(".wrap").innerHTML = `
    <div class="review-heading">
      <div>
        <p class="eyebrow reveal">Alcance de la evaluación</p>
        <h2 class="h2" data-line-reveal>Esto es lo que<br><em>revisamos.</em></h2>
      </div>
      <p class="lede reveal d1">Elige un área para ver qué documentos y pendientes revisamos en tu empresa.</p>
    </div>
    <div class="review-board reveal">
      <div class="review-tabs" role="tablist" aria-label="Áreas de cumplimiento">
        ${services.map(serviceTab).join("")}
      </div>
      ${services.map(servicePanel).join("")}
      <div class="review-next">
        <p>¿Qué aplica a tu empresa?</p>
        <a class="btn btn-outline btn-arrow" href="#contacto">Solicitar evaluación</a>
      </div>
    </div>`;

  const tabs = Array.from(overview.querySelectorAll('[role="tab"]'));
  const panels = Array.from(overview.querySelectorAll('[role="tabpanel"]'));

  function select(index) {
    tabs.forEach((tab, position) => {
      const active = index === position;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[position].hidden = !active;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", event => {
      const next = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next);
      tabs[next].focus();
    });
  });
}

function prepareHero(hero) {
  hero.querySelector(".hero-kicker").textContent = "Consultoría industrial";
  hero.querySelector("h1").innerHTML = "Que una inspección<br>no te tome<br><em>por sorpresa.</em>";
  hero.querySelector(".hero-sub").textContent =
    "Ordenamos tus expedientes y te acompañamos en inspecciones de STPS, Protección Civil y Medio Ambiente.";

  const explore = document.createElement("a");
  explore.className = "hero-explore btn-arrow";
  explore.href = "#solucion";
  explore.textContent = "Ver qué revisamos";
  hero.querySelector(".hero-actions").append(explore);

  const proof = hero.querySelector(".hero-trust");
  hero.querySelector(".hero-film-slot").append(proof);
}

function prepareProcess(journey) {
  const steps = [
    ["Detectamos.", "Diagnóstico de tu empresa", "Revisamos tus documentos y riesgos para que sepas qué resolver primero."],
    ["Ordenamos.", "Expedientes y seguimiento", "Organizamos tus evidencias por área y damos seguimiento a los vencimientos."],
    ["Acompañamos.", "Respaldo en la inspección", "Te acompaña un equipo técnico y legal para atender la visita y sus requerimientos."]
  ];
  journey.querySelector(".eyebrow").textContent = "Cómo trabajamos";
  const words = journey.querySelectorAll("[data-journey-word]");
  const cards = journey.querySelectorAll("[data-journey-card]");
  steps.forEach(([word, heading, detail], index) => {
    words[index].textContent = word;
    cards[index].querySelector("h3").textContent = heading;
    cards[index].querySelector("p").textContent = detail;
    cards[index].dataset.step = String(index + 1).padStart(2, "0");
  });
}

export function enhanceHome() {
  const hero = document.querySelector("#hero");
  const overview = document.querySelector("#solucion");
  const journey = document.querySelector("#cumplimiento");
  const founder = document.querySelector("#fundador");
  const resources = document.querySelector("#nosotros");
  const contact = document.querySelector("#contacto");
  if (!hero || !overview || !journey || !founder || !resources || !contact) return;

  prepareHero(hero);
  prepareServices(overview);
  prepareProcess(journey);
  hero.after(overview);

  founder.querySelector("h2").innerHTML = "Un equipo detrás de<br><em>tu cumplimiento.</em>";
  const expertise = document.createElement("p");
  expertise.className = "lede founder-expertise";
  expertise.textContent = "Asesoría técnica y legal para preparar expedientes, atender requerimientos y dar seguimiento a tu operación.";
  founder.querySelector("h2").after(expertise);
  founder.after(resources);

  resources.querySelector("h2").innerHTML = "¿Cómo es una visita<br><em>de la STPS?</em>";
  contact.querySelector("h2").innerHTML = "Empieza por saber<br><em>qué te falta.</em>";
  contact.querySelector(".lede").textContent =
    "Déjanos tu nombre y teléfono. Te contactamos para conocer tu operación y enfocar la evaluación en lo que necesitas.";

  document.querySelectorAll(".nav-cta, .menu-inner .btn, .hero-actions .btn, .evaluation-dock a").forEach(link => {
    if (link.getAttribute("href") === "#contacto") link.textContent = "Solicitar evaluación";
  });

  document.documentElement.classList.add("caesi-landing");
}
