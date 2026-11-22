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
        <p class="eyebrow reveal">Cumplimiento</p>
        <h2 class="h2" data-line-reveal>Servicios para<br><em>tu empresa.</em></h2>
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
  hero.querySelector("h1").innerHTML = "Cumplimiento industrial.<br><em>Defensa ante la STPS.</em>";
  hero.querySelector(".hero-sub").textContent =
    "Revisamos multas de la STPS y te ayudamos a organizar tus expedientes de seguridad laboral, Protección Civil y Medio Ambiente.";

  const primary = hero.querySelector(".hero-actions .btn");
  primary.href = "#consulta-multa-stps";
  primary.textContent = "Revisar mi multa";

  const explore = document.createElement("a");
  explore.className = "hero-explore btn-arrow";
  explore.href = "#solucion";
  explore.textContent = "Ver servicios";
  hero.querySelector(".hero-actions").append(explore);

  const proof = hero.querySelector(".hero-trust");
  hero.querySelector(".hero-film-slot").append(proof);

  hero.insertAdjacentHTML("beforeend", `
    <nav class="wrap home-shortcuts" aria-label="Atajos de CAESI">
      <a class="btn-arrow" href="#multas">Multas de la STPS</a>
      <a class="btn-arrow" href="#solucion">Cumplimiento</a>
      <a class="btn-arrow" href="#formacion">Formación y estudios</a>
      <a class="btn-arrow" href="#portal">Portal para empresas</a>
    </nav>`);
}

function prepareFines(fines) {
  fines.querySelector(".multas-grid").innerHTML = `
    <div>
      <p class="eyebrow reveal">Impugnación de multas de la STPS</p>
      <h2 class="h2" data-line-reveal>¿Recibiste <em>una multa?</em></h2>
      <p class="lede reveal d1">Revisamos la notificación y los antecedentes de tu caso para explicarte qué opciones tienes. Atendemos a empresas en la Ciudad de México.</p>
      <div class="fines-actions reveal d2">
        <a class="btn btn-blue btn-arrow" href="#consulta-multa-stps">Solicitar revisión</a>
      </div>
    </div>
    <div class="fines-review reveal d2">
      <h3>Qué revisamos contigo</h3>
      <ol>
        <li><strong>La notificación</strong><p>Qué recibiste, cuándo y en qué centro de trabajo.</p></li>
        <li><strong>Los antecedentes</strong><p>El acta, la resolución y las evidencias que tienes a la mano.</p></li>
        <li><strong>Opciones de respuesta</strong><p>El equipo te explica los pasos que aplican a tu caso.</p></li>
      </ol>
    </div>`;

  document.querySelector("#servicios .srv.big p").textContent =
    "Revisamos la notificación, sus antecedentes y las opciones de defensa ante la STPS.";
}

function prepareEducation(before) {
  before.insertAdjacentHTML("beforebegin", `
    <section class="education-section" id="formacion" data-view="inicio" aria-labelledby="education-title">
      <div class="wrap">
        <h2 class="h2" id="education-title" data-line-reveal>Formación y <em>acreditación de estudios.</em></h2>
        <div class="education-grid">
          <article class="education-card reveal">
            <p class="eyebrow">Centro Evaluador</p>
            <h3>Doble certificación</h3>
            <p>Para instructores y personas que elaboran manuales de capacitación. Consulta el próximo grupo, los requisitos y el costo.</p>
            <a class="solution-link btn-arrow" href="#consulta-certificacion">Consultar certificación</a>
          </article>
          <article class="education-card reveal d1">
            <p class="eyebrow">Centro Especializado</p>
            <h3>Prepa y estudios superiores</h3>
            <p>Pregunta por la opción de acreditar la prepa mediante examen y por las modalidades de licenciatura e ingeniería.</p>
            <a class="solution-link btn-arrow" href="#consulta-estudios">Consultar modalidades</a>
          </article>
        </div>
      </div>
    </section>`);
}

function preparePortal(portal) {
  portal.querySelector(".eyebrow").textContent = "Portal para empresas";
  portal.querySelector("h2").innerHTML = "Tus expedientes y pendientes<br><em>en un solo lugar.</em>";
  portal.querySelector(".portal-copy .lede").textContent =
    "Si tu empresa trabaja con CAESI, solicita acceso para consultar tus documentos y dar seguimiento a tus avances.";
  portal.querySelector(".portal-copy ul").innerHTML = `
    <li>Consultar el avance por área</li>
    <li>Cargar evidencias y documentos</li>
    <li>Revisar pendientes y vencimientos</li>
    <li>Acceder a reportes de cumplimiento</li>`;
  portal.querySelector(".portal-actions a").href = "#consulta-portal";
  portal.querySelector(".portal-mock").insertAdjacentHTML("afterbegin",
    '<p class="portal-example">Ejemplo de vista del portal</p>');
}

const leadTopics = [
  {
    key: "evaluacion",
    label: "Evaluación de cumplimiento",
    title: "Cuéntanos qué necesitas",
    description: "Déjanos tus datos y dinos qué área de tu operación quieres revisar.",
    hint: "Por ejemplo, qué documentos o pendientes quieres revisar.",
    action: "Solicitar evaluación"
  },
  {
    key: "multa-stps",
    label: "Multa de la STPS",
    title: "Revisión de multa de la STPS",
    description: "Cuéntanos qué recibiste. El equipo de CAESI te contactará para conocer el caso y revisar las posibles opciones.",
    hint: "Si los tienes a la mano, indica la alcaldía o municipio, la fecha de notificación y el motivo de la multa.",
    action: "Solicitar revisión"
  },
  {
    key: "certificacion",
    label: "Doble certificación",
    title: "Consulta la doble certificación",
    description: "Solicita el calendario, los requisitos y el costo de la formación para instructores y elaboración de manuales.",
    hint: "Cuéntanos qué parte de la certificación te interesa.",
    action: "Pedir información"
  },
  {
    key: "estudios",
    label: "Acreditación de estudios",
    title: "Consulta las modalidades de estudio",
    description: "Indica el nivel que te interesa para conocer las opciones disponibles y sus requisitos.",
    hint: "Bachillerato, licenciatura o ingeniería.",
    action: "Consultar modalidades"
  },
  {
    key: "portal",
    label: "Acceso al portal de empresas",
    title: "Solicita acceso al portal",
    description: "Dinos de qué empresa nos escribes para orientarte sobre el acceso a tus expedientes y documentos.",
    hint: "Incluye el nombre de tu empresa en la solicitud.",
    action: "Solicitar acceso"
  }
];

function prepareContact(contact) {
  const form = contact.querySelector("form");
  const details = form.querySelector(".lf-optional");
  const message = form.querySelector("#lf_msg");
  const messageLabel = message.closest("label");
  const heading = contact.querySelector("h2");
  const description = contact.querySelector(".lede");
  const button = form.querySelector('button[type="submit"]');

  heading.removeAttribute("data-line-reveal");
  messageLabel.firstChild.textContent = "Cuéntanos qué necesitas (opcional)";
  message.setAttribute("aria-describedby", "lead-hint");
  const hint = document.createElement("small");
  hint.id = "lead-hint";
  hint.className = "lead-hint";
  messageLabel.classList.add("lead-message");
  details.before(messageLabel, hint);

  const topicLabel = document.createElement("label");
  topicLabel.className = "lead-topic";
  topicLabel.htmlFor = "lead-topic";
  topicLabel.innerHTML = `Motivo de consulta
    <select id="lead-topic">${leadTopics.map(({ key, label }) => `<option value="${key}">${label}</option>`).join("")}</select>`;
  messageLabel.before(topicLabel);
  const selection = topicLabel.querySelector("select");

  for (const { key } of leadTopics.slice(1)) {
    const anchor = document.createElement("span");
    anchor.id = "consulta-" + key;
    anchor.className = "contact-route";
    anchor.dataset.routeAnchor = "";
    anchor.dataset.leadTopic = key;
    anchor.setAttribute("aria-hidden", "true");
    contact.prepend(anchor);
  }

  function setTopic(key) {
    const topic = leadTopics.find(item => item.key === key) ?? leadTopics[0];
    for (const option of selection.options) option.defaultSelected = option.value === topic.key;
    selection.value = topic.key;
    heading.textContent = topic.title;
    description.textContent = topic.description;
    hint.textContent = topic.hint;
    button.textContent = topic.action;
  }

  selection.addEventListener("change", () => setTopic(selection.value));
  const submitLead = form.onsubmit;
  form.onsubmit = event => {
    const previous = message.value;
    const reason = selection.selectedOptions[0]?.textContent ?? leadTopics[0].label;
    message.value = previous.trim() ? `Motivo: ${reason}\n\n${previous.trim()}` : `Motivo: ${reason}`;
    try {
      return submitLead.call(form, event);
    } finally {
      message.value = previous;
    }
  };
  setTopic("evaluacion");
  return setTopic;
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
  const fines = document.querySelector("#multas");
  const portal = document.querySelector("#portal");
  if (!hero || !overview || !journey || !founder || !resources || !contact || !fines || !portal) return;

  prepareHero(hero);
  prepareServices(overview);
  prepareProcess(journey);
  prepareFines(fines);
  prepareEducation(founder);
  preparePortal(portal);
  hero.after(overview);

  founder.querySelector("h2").innerHTML = "Un equipo detrás de<br><em>tu cumplimiento.</em>";
  const expertise = document.createElement("p");
  expertise.className = "lede founder-expertise";
  expertise.textContent = "Asesoría técnica y legal para preparar expedientes, atender requerimientos y dar seguimiento a tu operación.";
  founder.querySelector("h2").after(expertise);
  founder.after(resources);

  resources.querySelector("h2").innerHTML = "¿Cómo es una visita<br><em>de la STPS?</em>";
  const setContactTopic = prepareContact(contact);
  document.querySelector('.site-footer a[href="#multas"]').textContent = "Multas de la STPS";

  document.querySelectorAll(".nav-cta, .menu-inner .btn, .evaluation-dock a").forEach(link => {
    if (link.getAttribute("href") === "#contacto") link.textContent = "Solicitar evaluación";
  });

  document.documentElement.classList.add("caesi-landing");
  return setContactTopic;
}
