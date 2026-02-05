import fs from "fs";
import path from "path";
import { BUCKET, getSignedDownloadUrl, uploadFile } from "./s3.js";

export type StorageProvider = "local" | "s3";

export interface StorageConfig {
  provider: StorageProvider;
  localRoot: string;
  publicBaseUrl: string;
}

export const storageConfig: StorageConfig = {
  provider: (process.env.MEDIA_STORAGE_PROVIDER as StorageProvider) || "local",
  localRoot: process.env.MEDIA_LOCAL_ROOT || path.resolve(process.cwd(), "storage"),
  publicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL || "/media",
};

// To support remote storage later (S3/GCS/R2), set MEDIA_STORAGE_PROVIDER and add
// provider-specific credentials like MEDIA_S3_BUCKET, MEDIA_S3_REGION, MEDIA_S3_KEY, MEDIA_S3_SECRET.

export const ensureDir = async (dir: string) => {
  await fs.promises.mkdir(dir, { recursive: true });
};

export interface SavedAsset {
  absolutePath: string;
  publicUrl: string;
  key: string;
  bucket?: string;
  sizeBytes?: number;
  mimeType?: string;
}

export const saveBase64File = async (
  base64: string,
  relativePath: string,
  contentType: string = "application/octet-stream"
): Promise<SavedAsset> => {
  const safeRelativePath = relativePath.replace(/^\/+/, "");
  if (storageConfig.provider === "s3") {
    const buffer = Buffer.from(base64, "base64");
    const uploaded = await uploadFile(buffer, safeRelativePath, contentType);
    return {
      absolutePath: "",
      publicUrl: uploaded.url,
      key: uploaded.key,
      bucket: BUCKET,
      sizeBytes: uploaded.size,
      mimeType: uploaded.contentType,
    };
  }

  const absolutePath = path.join(storageConfig.localRoot, safeRelativePath);

  await ensureDir(path.dirname(absolutePath));
  await fs.promises.writeFile(absolutePath, Buffer.from(base64, "base64"));

  const publicUrl = `${storageConfig.publicBaseUrl}/${safeRelativePath.replace(/\\/g, "/")}`;

  return {
    absolutePath,
    publicUrl,
    key: safeRelativePath,
    sizeBytes: Buffer.byteLength(base64, "base64"),
    mimeType: contentType,
  };
};

export const saveBufferFile = async (
  buffer: Buffer,
  relativePath: string,
  contentType: string = "application/octet-stream"
): Promise<SavedAsset> => {
  const safeRelativePath = relativePath.replace(/^[\\/]+/, "");
  if (storageConfig.provider === "s3") {
    const uploaded = await uploadFile(buffer, safeRelativePath, contentType);
    return {
      absolutePath: "",
      publicUrl: uploaded.url,
      key: uploaded.key,
      bucket: BUCKET,
      sizeBytes: uploaded.size,
      mimeType: uploaded.contentType,
    };
  }

  const absolutePath = path.join(storageConfig.localRoot, safeRelativePath);

  await ensureDir(path.dirname(absolutePath));
  await fs.promises.writeFile(absolutePath, buffer);

  const publicUrl = `${storageConfig.publicBaseUrl}/${safeRelativePath.replace(/\\/g, "/")}`;

  return {
    absolutePath,
    publicUrl,
    key: safeRelativePath,
    sizeBytes: buffer.length,
    mimeType: contentType,
  };
};

export const getDownloadUrlForKey = async (key: string, expiresInSeconds: number = 300): Promise<string> => {
  const safeKey = String(key || "").replace(/^[\\/]+/, "");
  if (!safeKey) throw new Error("key is required");
  if (storageConfig.provider === "s3") {
    return getSignedDownloadUrl(safeKey, expiresInSeconds);
  }
  return `${storageConfig.publicBaseUrl}/${safeKey.replace(/\\/g, "/")}`;
};
