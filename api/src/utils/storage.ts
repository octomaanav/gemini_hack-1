import fs from "fs";
import path from "path";

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
}

export const saveBase64File = async (base64: string, relativePath: string): Promise<SavedAsset> => {
  if (storageConfig.provider !== "local") {
    throw new Error("Only local storage is configured. Set MEDIA_STORAGE_PROVIDER=local or implement a remote provider.");
  }

  const safeRelativePath = relativePath.replace(/^\/+/, "");
  const absolutePath = path.join(storageConfig.localRoot, safeRelativePath);

  await ensureDir(path.dirname(absolutePath));
  await fs.promises.writeFile(absolutePath, Buffer.from(base64, "base64"));

  const publicUrl = `${storageConfig.publicBaseUrl}/${safeRelativePath.replace(/\\/g, "/")}`;

  return {
    absolutePath,
    publicUrl,
  };
};

export const saveBufferFile = async (buffer: Buffer, relativePath: string): Promise<SavedAsset> => {
  if (storageConfig.provider !== "local") {
    throw new Error("Only local storage is configured. Set MEDIA_STORAGE_PROVIDER=local or implement a remote provider.");
  }

  const safeRelativePath = relativePath.replace(/^[\\/]+/, "");
  const absolutePath = path.join(storageConfig.localRoot, safeRelativePath);

  await ensureDir(path.dirname(absolutePath));
  await fs.promises.writeFile(absolutePath, buffer);

  const publicUrl = `${storageConfig.publicBaseUrl}/${safeRelativePath.replace(/\\/g, "/")}`;

  return {
    absolutePath,
    publicUrl,
  };
};
