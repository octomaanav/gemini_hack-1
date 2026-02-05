import test from "node:test";
import assert from "node:assert/strict";
import { parseVoiceCommandDeterministic } from "../src/utils/voice/parser.js";

test("voice parser: navigation", () => {
  const cmd = parseVoiceCommandDeterministic("Open dashboard", {});
  assert.ok(cmd);
  assert.equal(cmd.action, "NAVIGATE_ROUTE");
  assert.deepEqual(cmd.args, { route: "/dashboard" });
});

test("voice parser: accessibility toggles", () => {
  const cmd = parseVoiceCommandDeterministic("focus mode on", {});
  assert.ok(cmd);
  assert.equal(cmd.action, "TOGGLE_ACCESSIBILITY");
  assert.equal(cmd.args.key, "focusMode");
  assert.equal(cmd.args.value, true);
});

test("voice parser: next/previous", () => {
  assert.equal(parseVoiceCommandDeterministic("next", {})?.action, "NEXT_MICROSECTION");
  assert.equal(parseVoiceCommandDeterministic("previous", {})?.action, "PREV_MICROSECTION");
});

test("voice parser: jump to quiz", () => {
  const cmd = parseVoiceCommandDeterministic("go to quiz", {});
  assert.ok(cmd);
  assert.equal(cmd.action, "JUMP_TO_TYPE");
  assert.equal(cmd.args.type, "quiz");
});

