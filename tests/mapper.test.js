import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rowsToState, stateToRows } from "../src/data/mapper.js";

const fixture = JSON.parse(await readFile(new URL("./fixtures/legacy-local-storage.json", import.meta.url), "utf8"));

test("legacy local-storage fixture round-trips through Supabase rows", () => {
  const rows = stateToRows(fixture, { userId: "user-1", journeyId: "journey-1" });
  const rebuilt = rowsToState(rows, fixture);
  assert.deepEqual(rebuilt, fixture);
});

test("daily log records retain per-day presence and distinct global gifts", () => {
  const rows = stateToRows(fixture, { userId: "user-1", journeyId: "journey-1" });
  const day1 = rows.daily.find(row => row.day === 1);
  assert.deepEqual(day1.skip, { walk: 1 });
  assert.equal(day1.extra.state_presence.low, true);
  assert.equal(rows.settings.gifts["0"], fixture.gifts["0"]);
  assert.equal("gifts" in day1, false);
});
