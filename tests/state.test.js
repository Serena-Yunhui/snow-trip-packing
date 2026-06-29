import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ITEMS,
  clearStatuses,
  createDefaultState,
  cycleCell,
  cycleStatus,
  importState,
  migrateStoredState,
  setPeople,
  summarizeState,
} from "../state.js";

const LEGACY_ITEMS = [
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

test("default board starts with the permanent 11-item list", () => {
  const state = createDefaultState();
  assert.equal(state.version, "1.1.0");
  assert.deepEqual(state.items.map((item) => item.name), DEFAULT_ITEMS);
  assert.equal(state.items.length, 11);
});

test("legacy untouched starter list migrates without losing matching statuses", () => {
  const people = [{ id: "person-1", name: "You" }];
  const legacy = {
    version: "1.0.0",
    people,
    items: LEGACY_ITEMS.map((name, index) => ({ id: `item-${index + 1}`, name })),
    statuses: { "item-7": { "person-1": "packed" } },
  };

  const migrated = migrateStoredState(legacy);
  assert.equal(migrated.items.length, 11);
  assert.deepEqual(migrated.items.map((item) => item.name), DEFAULT_ITEMS);
  assert.equal(migrated.statuses["item-1"]["person-1"], "packed");
});

test("customized legacy list is normalized without replacement", () => {
  const legacy = {
    version: "1.0.0",
    people: [{ id: "person-1", name: "You" }],
    items: LEGACY_ITEMS.map((name, index) => ({ id: `item-${index + 1}`, name })),
    statuses: {},
  };
  legacy.items[0].name = "Custom jacket";

  const normalized = migrateStoredState(legacy);
  assert.equal(normalized.items.length, 15);
  assert.equal(normalized.items[0].name, "Custom jacket");
});

test("status cycles Unknown, Packed, Unpacked, Unknown", () => {
  assert.equal(cycleStatus("unknown"), "packed");
  assert.equal(cycleStatus("packed"), "unpacked");
  assert.equal(cycleStatus("unpacked"), "unknown");
});

test("cell changes are isolated and clear statuses preserves the board", () => {
  const original = createDefaultState();
  const itemId = original.items[0].id;
  const personId = original.people[0].id;
  const changed = cycleCell(original, itemId, personId);
  assert.equal(changed.statuses[itemId][personId], "packed");
  assert.equal(summarizeState(changed).packed, 1);

  const cleared = clearStatuses(changed);
  assert.equal(cleared.statuses[itemId][personId], "unknown");
  assert.deepEqual(cleared.items, original.items);
  assert.deepEqual(cleared.people, original.people);
});

test("removing a person removes orphaned statuses", () => {
  const original = createDefaultState();
  const reduced = setPeople(original, [original.people[0]]);
  const statusPeople = Object.keys(reduced.statuses[original.items[0].id]);
  assert.deepEqual(statusPeople, [original.people[0].id]);
});

test("import rejects invalid statuses and keeps valid entries", () => {
  const original = createDefaultState();
  const itemId = original.items[0].id;
  const personId = original.people[0].id;
  original.statuses[itemId][personId] = "invalid";
  const imported = importState({ state: original });
  assert.equal(imported.statuses[itemId][personId], "unknown");
});
