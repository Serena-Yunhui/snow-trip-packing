import {
  STORAGE_KEY,
  addItem,
  clearStatuses,
  createDefaultState,
  createPerson,
  cycleCell,
  exportState,
  importState,
  normalizeState,
  removeItem,
  setPeople,
  summarizeState,
  updateItem,
} from "./state.js";

const STATUS_META = {
  unknown: { icon: "?", label: "Unknown" },
  packed: { icon: "✓", label: "Packed" },
  unpacked: { icon: "!", label: "Unpacked" },
};

const board = document.querySelector("#board");
const emptyState = document.querySelector("#empty-state");
const summaryNumbers = document.querySelector("#summary-numbers");
const progressBar = document.querySelector("#progress-bar");
const itemDialog = document.querySelector("#item-dialog");
const itemForm = document.querySelector("#item-form");
const peopleDialog = document.querySelector("#people-dialog");
const peopleForm = document.querySelector("#people-form");
const peopleFields = document.querySelector("#people-fields");
const confirmDialog = document.querySelector("#confirm-dialog");
const toast = document.querySelector("#toast");

let state = loadState();
let toastTimer;

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeState(JSON.parse(stored)) : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast("This browser could not save the board.");
  }
}

function commit(nextState, message) {
  state = nextState;
  saveState();
  render();
  if (message) showToast(message);
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2400);
}

function makeButton(className, text, ariaLabel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
  return button;
}

function render() {
  board.replaceChildren();
  const summary = summarizeState(state);
  summaryNumbers.innerHTML = `<strong>${summary.packed}</strong> packed · <strong>${summary.unpacked}</strong> unpacked · <strong>${summary.unknown}</strong> unknown`;
  progressBar.style.width = `${Math.round(summary.packedPercent * 100)}%`;

  emptyState.hidden = Boolean(state.people.length && state.items.length);
  if (!state.people.length || !state.items.length) return;

  for (const item of state.items) {
    const article = document.createElement("article");
    article.className = "item-card";

    const heading = document.createElement("div");
    heading.className = "item-card__heading";
    const name = document.createElement("h2");
    name.textContent = item.name;
    const actions = document.createElement("div");
    actions.className = "item-card__actions";
    const edit = makeButton("text-button", "Edit", `Edit ${item.name}`);
    edit.addEventListener("click", () => openItemDialog(item));
    const remove = makeButton("text-button text-button--danger", "Remove", `Remove ${item.name}`);
    remove.addEventListener("click", () => {
      if (window.confirm(`Remove “${item.name}” from the board?`)) commit(removeItem(state, item.id), "Item removed.");
    });
    actions.append(edit, remove);
    heading.append(name, actions);

    const cells = document.createElement("div");
    cells.className = "item-card__cells";
    for (const person of state.people) {
      const status = state.statuses[item.id][person.id];
      const meta = STATUS_META[status];
      const cell = makeButton(`status-button status-${status}`, "", `${item.name} for ${person.name}: ${meta.label}. Activate to change status.`);
      cell.dataset.itemId = item.id;
      cell.dataset.personId = person.id;
      const personName = document.createElement("span");
      personName.className = "status-button__person";
      personName.textContent = person.name;
      const statusText = document.createElement("span");
      statusText.className = "status-button__state";
      statusText.innerHTML = `<span aria-hidden="true">${meta.icon}</span> ${meta.label}`;
      cell.append(personName, statusText);
      cell.addEventListener("click", () => commit(cycleCell(state, item.id, person.id)));
      cells.append(cell);
    }
    article.append(heading, cells);
    board.append(article);
  }
}

function openItemDialog(item = null) {
  document.querySelector("#item-dialog-title").textContent = item ? "Edit item" : "Add item";
  document.querySelector("#item-id").value = item?.id || "";
  document.querySelector("#item-name").value = item?.name || "";
  itemDialog.showModal();
  requestAnimationFrame(() => document.querySelector("#item-name").focus());
}

function createPersonField(person = createPerson("")) {
  const row = document.createElement("div");
  row.className = "person-field";
  row.dataset.personId = person.id;
  const input = document.createElement("input");
  input.value = person.name === "New person" ? "" : person.name;
  input.maxLength = 60;
  input.required = true;
  input.setAttribute("aria-label", "Person name");
  const remove = makeButton("icon-button icon-button--danger", "×", `Remove ${person.name || "person"}`);
  remove.addEventListener("click", () => row.remove());
  row.append(input, remove);
  return row;
}

function openPeopleDialog() {
  peopleFields.replaceChildren(...state.people.map(createPersonField));
  peopleDialog.showModal();
}

itemForm.addEventListener("submit", (event) => {
  if (event.submitter?.value !== "save") return;
  event.preventDefault();
  if (!itemForm.reportValidity()) return;
  const id = document.querySelector("#item-id").value;
  const name = document.querySelector("#item-name").value.trim();
  commit(id ? updateItem(state, id, name) : addItem(state, name), id ? "Item updated." : "Item added.");
  itemDialog.close();
});

peopleForm.addEventListener("submit", (event) => {
  if (event.submitter?.value !== "save") return;
  event.preventDefault();
  if (!peopleForm.reportValidity()) return;
  const people = [...peopleFields.querySelectorAll(".person-field")].map((row) =>
    createPerson(row.querySelector("input").value, row.dataset.personId),
  );
  commit(setPeople(state, people), "People updated.");
  peopleDialog.close();
});

document.querySelector("#add-item").addEventListener("click", () => openItemDialog());
document.querySelector("#edit-people").addEventListener("click", openPeopleDialog);
document.querySelector("#add-person-field").addEventListener("click", () => {
  const field = createPersonField();
  peopleFields.append(field);
  field.querySelector("input").focus();
});
document.querySelector("#clear-statuses").addEventListener("click", () => confirmDialog.showModal());
confirmDialog.addEventListener("close", () => {
  if (confirmDialog.returnValue === "confirm") commit(clearStatuses(state), "All statuses cleared.");
});

document.querySelector("#export-board").addEventListener("click", () => {
  const blob = new Blob([exportState(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `snow-trip-packing-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Backup exported.");
});

document.querySelector("#import-board").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    commit(importState(await file.text()), "Backup imported.");
  } catch {
    showToast("That backup file could not be read.");
  } finally {
    event.target.value = "";
  }
});

render();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
