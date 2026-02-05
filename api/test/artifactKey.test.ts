import test from "node:test";
import assert from "node:assert/strict";
import { makeArtifactKey } from "../src/utils/artifacts/key.js";

test("makeArtifactKey is stable and includes all components", () => {
  const key = makeArtifactKey({
    scopeType: "MICROSECTION",
    scopeId: "curr:cbse:123:grade11:physics:ch01:ms0101",
    version: 7,
    locale: "en-US",
    artifactType: "BRAILLE_PREVIEW",
    variantId: null,
  });

  assert.equal(
    key,
    "lh:v3:BRAILLE_PREVIEW:MICROSECTION:curr:cbse:123:grade11:physics:ch01:ms0101:v7:en-US:0"
  );
});

test("makeArtifactKey differentiates by variantId", () => {
  const base = {
    scopeType: "LESSON" as const,
    scopeId: "lh:lesson:class:sub:ch:sec",
    version: 1,
    locale: "en",
    artifactType: "STORY_PLAN" as const,
  };

  const a = makeArtifactKey({ ...base, variantId: "v1" });
  const b = makeArtifactKey({ ...base, variantId: "v2" });
  assert.notEqual(a, b);
});

test("makeArtifactKey rejects missing scopeId/locale", () => {
  assert.throws(
    () =>
      makeArtifactKey({
        scopeType: "CHAPTER",
        scopeId: "",
        version: 1,
        locale: "en",
        artifactType: "BRAILLE_BRF",
      }),
    /scopeId is required/
  );
  assert.throws(
    () =>
      makeArtifactKey({
        scopeType: "CHAPTER",
        scopeId: "x",
        version: 1,
        locale: "",
        artifactType: "BRAILLE_BRF",
      }),
    /locale is required/
  );
});

