import crypto from "crypto";

export const normalizeJson = (value: any): any => {
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    const out: any = {};
    for (const key of keys) {
      out[key] = normalizeJson(value[key]);
    }
    return out;
  }
  return value;
};

export const sha256Json = (value: any): string => {
  const normalized = normalizeJson(value);
  const s = JSON.stringify(normalized);
  return crypto.createHash("sha256").update(s).digest("hex");
};

export const sha256Text = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
