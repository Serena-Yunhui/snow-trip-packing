export const APP_VERSION = "1.0.0";
export const STORAGE_KEY = "snow-trip-packing-board::state";
export const STATUS_ORDER = ["unknown", "packed", "unpacked"];

const DEFAULT_PEOPLE = ["You", "Travel buddy"];
const DEFAULT_ITEMS = [
  "Snow jacket",
  "Snow pants",
  "Base layers",
  "Snow socks",
  "Gloves",
  "Goggles",
  "Helmet",
  "Snow boots",
  "Beanie",
  "Lift pass",
  "Sunscreen",
  "Water bottle",
  "Phone and charger",
  "Medication",
  "Hotel key",
];

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPerson(name = "New person", id = createId("person")) {
  return { id, name: String(name).trim().slice(0, 60) || "New person" };
}

export function createItem(name = "New item", id = createId("item")) {
  return { id, name: String(name).trim().slice(0, 80) || "New item" };
}

function normalizeEntities(input, createEntity) {
  const seen = new Set();
  return (Array.isArray(input) ? input : [])
    .map((entry) => createEntity(entry?.name, String(entry?.id || "")))
    .filter((entry) => entry.id && !seen.has(entry.id) && seen.add(entry.id));
}

export function normalizeState(input = {}) {
  const people = normalizeEntities(input.people, createPerson);
  const items = normalizeEntities(input.items, createItem);
  const statuses = {};

  for (const item of items) {
    statuses[item.id] = {};
    for (const person of people) {
      const candidate = input.statuses?.[item.id]?.[person.id];
      statuses[item.id][person.id] = STATUS_ORDER.includes(candidate) ? candidate : "unknown";
    }
  }

  return {
    version: APP_VERSION,
    updatedAt: new Date().toISOString(),
    people,
    items,
    statuses,
  };
}

export function createDefaultState() {
  return normalizeState({
    people: DEFAULT_PEOPLE.map((name, index) => createPerson(name, `person-${index + 1}`)),
    items: DEFAULT_ITEMS.map((name, index) => createItem(name, `item-${index + 1}`)),
  });
}

export function cycleStatus(status) {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
}

export function setPeople(state, people) {
  return normalizeState({ ...state, people });
}

export function addItem(state, name) {
  return normalizeState({ ...state, items: [...state.items, createItem(name)] });
}

export function updateItem(state, itemId, name) {
  return normalizeState({
    ...state,
    items: state.items.map((item) => (item.id === itemId ? { ...item, name } : item)),
  });
}

export function removeItem(state, itemId) {
  return normalizeState({ ...state, items: state.items.filter((item) => item.id !== itemId) });
}

export function cycleCell(state, itemId, personId) {
  if (!state.items.some((item) => item.id === itemId) || !state.people.some((person) => person.id === personId)) {
    return state;
  }

  return normalizeState({
    ...state,
    statuses: {
      ...state.statuses,
      [itemId]: {
        ...state.statuses[itemId],
        [personId]: cycleStatus(state.statuses[itemId]?.[personId]),
      },
    },
  });
}

export function clearStatuses(state) {
  return normalizeState({ ...state, statuses: {} });
}

export function summarizeState(state) {
  const values = state.items.flatMap((item) => state.people.map((person) => state.statuses[item.id][person.id]));
  const total = values.length;
  const packed = values.filter((value) => value === "packed").length;
  const unpacked = values.filter((value) => value === "unpacked").length;
  return { total, packed, unpacked, unknown: total - packed - unpacked, packedPercent: total ? packed / total : 0 };
}

export function exportState(state) {
  return JSON.stringify(
    { app: "Snow Trip Packing Board", exportedAt: new Date().toISOString(), state: normalizeState(state) },
    null,
    2,
  );
}

export function importState(payload) {
  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  return normalizeState(parsed.state || parsed);
}
