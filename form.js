const countryCodes =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = countryCodes
  .map((code) => countryNames.of(code))
  .sort((a, b) => a.localeCompare(b));

const languageCodes =
  "aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zh zu".split(
    " ",
  );
const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
const languages = [
  ...new Set(
    languageCodes
      .map((code) => ({ code, name: languageNames.of(code) }))
      .filter(
        ({ code, name }) => name && name.toLocaleLowerCase() !== code,
      )
      .map(({ name }) => name),
  ),
]
  .sort((a, b) => a.localeCompare(b));

const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Historical",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Science fiction",
  "Sport",
  "Thriller",
  "War",
  "Western",
  "Experimental",
];
function initializeMultiSelect(root, options) {
  const input = root.querySelector('input[role="combobox"]');
  const selectedList = root.querySelector(".if-multi-selected");
  const listbox = root.querySelector('[role="listbox"]');
  const selected = new Map();
  const allowCustom = root.dataset.allowCustom === "true";
  let activeIndex = -1;

  function updateVisualState() {
    root.classList.toggle(
      "has-value",
      selected.size > 0 || input.value.trim().length > 0,
    );
  }

  function updateValidity() {
    if (root.dataset.required === "true")
      input.setCustomValidity(
        selected.size ? "" : "Choose at least one value.",
      );
  }

  function closeOptions() {
    listbox.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  }

  function renderOptions() {
    const query = input.value.trim().toLocaleLowerCase();
    const matches = options
      .filter((option) => option.toLocaleLowerCase().includes(query))
      .sort(
        (a, b) =>
          Number(b.toLocaleLowerCase() === query) -
          Number(a.toLocaleLowerCase() === query),
      );
    const exactOption = options.some(
      (option) => option.toLocaleLowerCase() === query,
    );
    const entries = matches.map((value) => ({ value, custom: false }));
    if (allowCustom && query && !exactOption)
      entries.push({ value: input.value.trim(), custom: true });
    if (activeIndex >= entries.length)
      activeIndex = entries.length ? 0 : -1;

    listbox.replaceChildren();
    entries.forEach(({ value, custom }, index) => {
      const option = document.createElement("div");
      option.id = `${listbox.id}-${index}`;
      option.className = "if-multi-option";
      option.setAttribute("role", "option");
      option.setAttribute(
        "aria-selected",
        String(selected.has(value.toLocaleLowerCase())),
      );
      option.textContent = custom ? `Add "${value}"` : value;
      if (index === activeIndex) option.classList.add("is-active");
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => {
        addValue(value);
        input.focus();
      });
      listbox.append(option);
    });

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "if-multi-empty";
      empty.textContent = "No matching options.";
      listbox.append(empty);
    }

    input.setAttribute("aria-expanded", "true");
    listbox.hidden = false;
    if (activeIndex >= 0 && entries[activeIndex])
      input.setAttribute("aria-activedescendant", `${listbox.id}-${activeIndex}`);
    else input.removeAttribute("aria-activedescendant");
  }

  function renderSelected() {
    selectedList.replaceChildren();
    for (const [key, value] of selected) {
      const chip = document.createElement("span");
      chip.className = "if-multi-chip";
      const text = document.createElement("span");
      text.textContent = value;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "if-multi-remove";
      remove.setAttribute("aria-label", `Remove ${value}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        selected.delete(key);
        renderSelected();
        if (!listbox.hidden) renderOptions();
        input.focus();
      });
      chip.append(text, remove);
      selectedList.append(chip);

      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = root.dataset.name;
      hidden.value = value;
      selectedList.append(hidden);
    }
    updateValidity();
    updateVisualState();
  }

  updateValidity();
  updateVisualState();

  function addValue(value) {
    const normalized = value.trim().toLocaleLowerCase();
    if (!normalized) return;
    const canonical = options.find(
      (option) => option.toLocaleLowerCase() === normalized,
    );
    const actualValue = canonical || value.trim();
    const key = actualValue.toLocaleLowerCase();
    if (!selected.has(key)) {
      selected.set(key, actualValue);
      renderSelected();
    }
    input.value = "";
    updateVisualState();
    activeIndex = -1;
    renderOptions();
  }

  input.addEventListener("focus", () => {
    activeIndex = -1;
    renderOptions();
  });
  input.addEventListener("input", () => {
    updateVisualState();
    activeIndex = input.value.trim() ? 0 : -1;
    renderOptions();
  });
  input.addEventListener("keydown", (event) => {
    const optionCount = listbox.querySelectorAll('[role="option"]').length;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (listbox.hidden) renderOptions();
      if (optionCount) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        activeIndex =
          activeIndex < 0
            ? direction > 0
              ? 0
              : optionCount - 1
            : (activeIndex + direction + optionCount) % optionCount;
        renderOptions();
      }
    } else if (event.key === "Enter") {
      if (
        activeIndex >= 0 &&
        listbox.children[activeIndex]?.getAttribute("role") === "option"
      ) {
        event.preventDefault();
        listbox.children[activeIndex]?.click();
      } else if (allowCustom && input.value.trim()) {
        event.preventDefault();
        addValue(input.value);
      } else if (!allowCustom && input.value.trim()) {
        event.preventDefault();
        input.value = "";
        updateVisualState();
        renderOptions();
      }
    } else if (event.key === "Escape") {
      closeOptions();
    } else if (event.key === "Backspace" && !input.value && selected.size) {
      const lastKey = [...selected.keys()].at(-1);
      selected.delete(lastKey);
      renderSelected();
    }
  });
  input.addEventListener("blur", () => {
    closeOptions();
    if (!allowCustom) {
      input.value = "";
      updateVisualState();
    }
  });
}

for (const root of document.querySelectorAll(".if-multi-select")) {
  const optionSet = { countries, languages, genres }[root.dataset.options];
  if (!optionSet)
    throw new Error(`Unknown multi-select options: ${root.dataset.options}`);
  initializeMultiSelect(root, optionSet);
}

for (const question of document.querySelectorAll("[data-password-question]")) {
  const details = question.querySelector(".if-password-details");
  const password = details.querySelector('input[type="password"]');
  for (const choice of question.querySelectorAll('input[type="radio"]')) {
    choice.addEventListener("change", () => {
      const protectedMedia = choice.value === "yes";
      details.hidden = !protectedMedia;
      password.required = protectedMedia;
      if (!protectedMedia) password.value = "";
    });
  }
}

const groups = [
  {
    title: "Actors — Lead & Supporting",
    label: "Actor",
    roles: [
      "Actor in a leading role",
      "Actress in a leading role",
      "Actor in a supporting role",
      "Actress in a supporting role",
    ],
  },
  {
    title: "Director(s)",
    label: "Director",
    roles: ["Director", "Co-director"],
  },
  {
    title: "Producer(s)",
    label: "Producer",
    roles: ["Producer", "Executive Producer"],
  },
  { title: "Other — DOP, Editor, Writer, Music…", label: "Credit", roles: [] },
];

const categoryGroups = {
  "Actor / Actress": [
    "Best Actor in a Leading Role",
    "Best Actor in a Supporting Role",
    "Best Actor in a Negative Role",
    "Best Actress in a Leading Role",
    "Best Actress in a Supporting Role",
    "Best Debut Actor",
    "Best Debut Actress",
  ],
  Craft: [
    "Best Cinematography",
    "Best Direction",
    "Best Editor",
    "Best Screenplay Writing",
  ],
  Producer: ["Best International Feature Film"],
};
const categories = Object.values(categoryGroups).flat();
const people = new Map();
let nextPerson = 0;
const crew = document.querySelector("#crew-groups");
const awards = document.querySelector("#award-entries");
const addAward = document.querySelector("#add-award");
const awardStatus = document.querySelector("#award-status");

function refreshAwards() {
  const entries = [...awards.children];
  const used = new Set(
    entries.map((entry) => entry.querySelector("select").value),
  );
  for (const entry of entries) {
    const select = entry.querySelector("select");
    for (const option of select.options) {
      option.disabled =
        !option.value ||
        (option.value !== select.value && used.has(option.value));
    }
    const list = entry.querySelector(".if-nominees");
    const chosen = new Set(
      [...list.querySelectorAll("input:checked")].map((input) => input.value),
    );
    const eligible = [...people].filter(([, person]) => person.name);
    list.replaceChildren();
    for (const [id, person] of eligible) {
      const label = document.createElement("label");
      label.className = "if-check";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = id;
      checkbox.checked = chosen.has(id);
      checkbox.disabled = !select.value;
      label.append(
        checkbox,
        `${person.name} — ${person.role || person.fallback}`,
      );
      list.append(label);
    }
    entry.querySelector(".if-nominee-help").textContent = eligible.length
      ? select.value
        ? "Select one or more people."
        : "Choose a category first."
      : "Enter a name in Cast & crew to make that person available here.";
  }
  const hasBlank = entries.some(
    (entry) => !entry.querySelector("select").value,
  );
  addAward.disabled = hasBlank || entries.length === categories.length;
  awardStatus.textContent = hasBlank
    ? "Choose a category for the current entry to add another."
    : entries.length === categories.length
      ? "All example categories have been added."
      : "";
}

function addPerson(group, list, empty, number, open) {
  const id = String(++nextPerson);
  const fallback = `${group.label} ${number}`;
  const person = { name: "", role: group.roles[0] || "", fallback };
  people.set(id, person);

  const card = document.createElement("details");
  card.className = "if-person";
  card.open = open;
  const roleControl = group.roles.length
    ? `<select class="if-role">${group.roles.map((role) => `<option>${role}</option>`).join("")}</select>`
    : '<input class="if-role" placeholder="e.g. Writer, DOP, Composer" />';
  card.innerHTML = `
    <summary class="if-person-toggle">
      <span class="if-person-label"><strong></strong><small></small></span>
      <span aria-hidden="true">⌄</span>
    </summary>
    <div class="if-crew-body">
      <div class="if-grid">
        <label class="if-field">Full name <span>*</span><input class="if-name" placeholder="Full name" /></label>
        <label class="if-field">Role <span>*</span>${roleControl}</label>
        <label class="if-field if-wide">Photo <span>*</span>
          <input type="file" accept="image/webp,.webp" />
          <small>WEBP only, up to 5 MB. Preview files stay on your device.</small>
        </label>
        <label class="if-field if-wide">Biography <span>*</span><textarea rows="3" placeholder="Short biography"></textarea></label>
      </div>
      <div class="if-contact">
        <h4>Representative</h4>
        <p>Who should we contact about this credit?</p>
        <div class="if-grid">
          <label class="if-field">Representative name <span>*</span><input placeholder="Full name" /></label>
          <label class="if-field">Relationship to crew member <span>*</span><input placeholder="e.g. Self, Agent, Manager" /></label>
          <label class="if-field">Representative email address <span>*</span><input type="email" placeholder="name@example.com" /></label>
          <label class="if-field">Contact phone <small>Optional</small><input type="tel" /></label>
          <label class="if-field if-wide">Instagram <small>Optional</small><input placeholder="@handle or profile URL" /></label>
          <label class="if-field if-wide">Notes <small>Optional</small><textarea rows="3"></textarea></label>
        </div>
      </div>
      <button type="button" class="if-remove-person">Remove</button>
    </div>`;
  const nameInput = card.querySelector(".if-name");
  const roleInput = card.querySelector(".if-role");
  function updatePerson() {
    person.name = nameInput.value.trim();
    person.role = roleInput.value.trim();
    card.querySelector("summary strong").textContent = person.name || fallback;
    card.querySelector("summary small").textContent = person.role;
    refreshAwards();
  }
  nameInput.addEventListener("input", updatePerson);
  roleInput.addEventListener("input", updatePerson);
  card.querySelector(".if-remove-person").addEventListener("click", () => {
    people.delete(id);
    card.remove();
    empty.hidden = list.children.length > 0;
    refreshAwards();
  });
  list.append(card);
  empty.hidden = true;
  updatePerson();
  if (open) nameInput.focus();
}

for (const group of groups) {
  const section = document.createElement("section");
  section.className = "if-crew-group";
  section.innerHTML = `
    <div class="if-crew-heading">
      <h3>${group.title}</h3>
      <button type="button">+ Add ${group.label}</button>
    </div>
    <div class="if-crew-list"></div>
    <p class="if-empty">No entries added yet.</p>`;
  const list = section.querySelector(".if-crew-list");
  const empty = section.querySelector(".if-empty");
  let count = 0;
  section
    .querySelector("button")
    .addEventListener("click", () =>
      addPerson(group, list, empty, ++count, true),
    );
  crew.append(section);
  if (group.roles.length) addPerson(group, list, empty, ++count, false);
}

function addAwardEntry(focus = false) {
  const entry = document.createElement("article");
  entry.className = "if-person";
  entry.innerHTML = `
    <div class="if-crew-heading">
      <h3>Award entry</h3>
      <button type="button">Remove category</button>
    </div>
    <label class="if-field">Award category <span>*</span>
      <select>
        <option value="" selected disabled>Select a category…</option>
        ${Object.entries(categoryGroups)
          .map(([group, awards]) => `
            <optgroup label="${group}">
              ${awards.map((award) => `<option>${award}</option>`).join("")}
            </optgroup>`)
          .join("")}
      </select>
    </label>
    <fieldset class="if-nominee-fieldset">
      <legend>Nominees</legend>
      <p class="if-nominee-help"></p>
      <div class="if-nominees"></div>
    </fieldset>`;
  const select = entry.querySelector("select");
  select.addEventListener("change", () => {
    for (const checkbox of entry.querySelectorAll(".if-nominees input"))
      checkbox.checked = false;
    refreshAwards();
  });
  entry.querySelector("button").addEventListener("click", () => {
    entry.remove();
    refreshAwards();
    if (!addAward.disabled) addAward.focus();
  });
  awards.append(entry);
  refreshAwards();
  if (focus) select.focus();
}

addAward.addEventListener("click", () => addAwardEntry(true));
addAwardEntry();

const sectionNav = document.querySelector(".if-section-nav");
const sectionLinks = [...sectionNav.querySelectorAll("a")];
const sections = sectionLinks.map((link) =>
  document.getElementById(link.hash.slice(1)),
);
const visited = new Set();
const progress = sectionNav.querySelector("progress");
const visitedCount = document.querySelector("#visited-count");
let activeSection = null;
let framePending = false;

function showSection(section) {
  if (section === activeSection) return;
  activeSection = section;
  for (const link of sectionLinks) {
    const id = link.hash.slice(1);
    if (id === section.id) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function markSectionVisited(section) {
  visited.add(section.id);
  for (const link of sectionLinks) {
    link.toggleAttribute(
      "data-visited",
      visited.has(link.hash.slice(1)),
    );
  }
  progress.value = visited.size;
  visitedCount.textContent = `${visited.size} of ${sections.length} sections visited`;
}

function updateSectionFromScroll() {
  const marker = sectionNav.getBoundingClientRect().bottom + 24;
  const current = sections.findLast(
    (section) => section.getBoundingClientRect().top <= marker,
  );
  const last = sections.at(-1);
  const atBottom =
    window.scrollY > 0 &&
    Math.ceil(window.scrollY + window.innerHeight) >=
      document.documentElement.scrollHeight;
  if (atBottom && last.getBoundingClientRect().top < window.innerHeight) {
    showSection(last);
  } else if (current) {
    showSection(current);
  }
}

function scheduleSectionUpdate() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(() => {
    framePending = false;
    updateSectionFromScroll();
  });
}

function updateNavOffset() {
  document.documentElement.style.setProperty(
    "--section-nav-offset",
    `${sectionNav.offsetHeight + 12}px`,
  );
  scheduleSectionUpdate();
}

for (const [index, link] of sectionLinks.entries()) {
  const section = sections[index];
  link.addEventListener("click", () => {
    section.open = true;
    markSectionVisited(section);
    showSection(section);
    section.querySelector("summary").focus({ preventScroll: true });
  });
  section.addEventListener("toggle", () => {
    if (section.open) {
      markSectionVisited(section);
      showSection(section);
    }
    scheduleSectionUpdate();
  });
}

window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
new ResizeObserver(updateNavOffset).observe(sectionNav);
updateNavOffset();
showSection(
  sections.find((section) => `#${section.id}` === location.hash) || sections[0],
);
