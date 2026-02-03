import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3-compatible client configuration (works with MinIO locally, AWS S3 in production)
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || 'lesson-media';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file to S3/MinIO
 */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return {
    key,
    url: getPublicUrl(key),
    size: buffer.length,
    contentType,
  };
}

/**
 * Upload a video/recording file
 */
export async function uploadVideo(
  buffer: Buffer,
  filename: string,
  lessonId: string
): Promise<UploadResult> {
  const ext = filename.split('.').pop() || 'mp4';
  const key = `videos/${lessonId}/${Date.now()}-${sanitizeFilename(filename)}`;
  const contentType = getContentType(ext);
  
  return uploadFile(buffer, key, contentType);
}

/**
 * Upload a recording (audio/video)
 */
export async function uploadRecording(
  buffer: Buffer,
  filename: string,
  userId: string,
  type: 'audio' | 'video' = 'audio'
): Promise<UploadResult> {
  const ext = filename.split('.').pop() || (type === 'audio' ? 'webm' : 'mp4');
  const key = `recordings/${userId}/${Date.now()}-${sanitizeFilename(filename)}`;
  const contentType = getContentType(ext);
  
  return uploadFile(buffer, key, contentType);
}

/**
 * Upload an image
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  folder: string = 'images'
): Promise<UploadResult> {
  const ext = filename.split('.').pop() || 'png';
  const key = `${folder}/${Date.now()}-${sanitizeFilename(filename)}`;
  const contentType = getContentType(ext);
  
  return uploadFile(buffer, key, contentType);
}

/**
 * Get a signed URL for temporary access to a private file
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading directly from client
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3/MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  await s3Client.send(command);
}

/**
 * List files in a folder
 */
export async function listFiles(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  });
  
  const response = await s3Client.send(command);
  return response.Contents?.map(obj => obj.Key || '') || [];
}

/**
 * Get the public URL for a file (for publicly accessible buckets)
 */
export function getPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
  return `${endpoint}/${BUCKET}/${key}`;
}

/**
 * Sanitize filename for S3 key
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Get content type from file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    // Video
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Documents
    pdf: 'application/pdf',
  };
  
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

export { s3Client, BUCKET };
