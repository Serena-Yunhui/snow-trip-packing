import test from "node:test";
import assert from "node:assert/strict";
import {
  clearStatuses,
  createDefaultState,
  cycleCell,
  cycleStatus,
  importState,
  setPeople,
  summarizeState,
} from "../state.js";

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
