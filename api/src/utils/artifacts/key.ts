export type ArtifactScopeType = "MICROSECTION" | "LESSON" | "CHAPTER";
export type ArtifactType =
  | "BRAILLE_PREVIEW"
  | "BRAILLE_BRF"
  | "STORY_PLAN"
  | "STORY_SLIDES"
  | "STORY_AUDIO";

export interface MakeArtifactKeyInput {
  scopeType: ArtifactScopeType;
  scopeId: string;
  version: number;
  locale: string;
  artifactType: ArtifactType;
  variantId?: string | null;
}

/**
 * Deterministic artifact cache key.
 * Format: lh:v3:{artifactType}:{scopeType}:{scopeId}:v{version}:{locale}:{variantIdOr0}
 */
export const makeArtifactKey = (input: MakeArtifactKeyInput): string => {
  const scopeId = String(input.scopeId || "").trim();
  const locale = String(input.locale || "").trim();
  if (!scopeId) throw new Error("scopeId is required");
  if (!locale) throw new Error("locale is required");
  if (!Number.isFinite(input.version) || input.version < 0) {
    throw new Error("version must be a non-negative number");
  }

  const variant = input.variantId ? String(input.variantId).trim() : "0";

  return [
    "lh",
    "v3",
    input.artifactType,
    input.scopeType,
    scopeId,
    `v${input.version}`,
    locale,
    variant || "0",
  ].join(":");
};

