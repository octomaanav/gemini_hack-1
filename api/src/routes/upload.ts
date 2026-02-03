import { Router } from 'express';
import multer from 'multer';
import { 
  uploadVideo, 
  uploadRecording, 
  uploadImage, 
  deleteFile, 
  listFiles,
  getSignedUploadUrl,
  getSignedDownloadUrl,
getPublicUrl
} from '../utils/s3.js';

const uploadRouter = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

/**
 * POST /api/upload/video
 * Upload a video file for a lesson
 */
uploadRouter.post('/video', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const lessonId = req.body.lessonId || 'general';
    const result = await uploadVideo(req.file.buffer, req.file.originalname, lessonId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/upload/recording
 * Upload a recording (audio/video from user)
 */
uploadRouter.post('/recording', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.body.userId || 'anonymous';
    const type = req.body.type === 'video' ? 'video' : 'audio';
    const result = await uploadRecording(req.file.buffer, req.file.originalname, userId, type);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Recording upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload recording',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/upload/image
 * Upload an image
 */
uploadRouter.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = req.body.folder || 'images';
    const result = await uploadImage(req.file.buffer, req.file.originalname, folder);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/upload/signed-url
 * Get a signed URL for direct client upload
 */
uploadRouter.get('/signed-url', async (req, res) => {
  try {
    const { key, contentType } = req.query;
    
    if (!key || !contentType) {
      return res.status(400).json({ error: 'key and contentType are required' });
    }

    const uploadUrl = await getSignedUploadUrl(key as string, contentType as string);
    const publicUrl = getPublicUrl(key as string);

    res.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ 
      error: 'Failed to generate signed URL',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/upload/download-url
 * Get a signed download URL for a file
 */
uploadRouter.get('/download-url', async (req, res) => {
  try {
    const key = req.query.key as string;
    
    if (!key) {
      return res.status(400).json({ error: 'key is required' });
    }

    const downloadUrl = await getSignedDownloadUrl(key);

    res.json({
      downloadUrl,
      key,
    });
  } catch (error) {
    console.error('Download URL error:', error);
    res.status(500).json({ 
      error: 'Failed to generate download URL',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/upload/list
 * List files in a folder
 */
uploadRouter.get('/list', async (req, res) => {
  try {
    const prefix = (req.query.prefix as string) || '';
    const files = await listFiles(prefix);

    res.json({
      prefix,
      files,
      count: files.length,
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ 
      error: 'Failed to list files',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/upload
 * Delete a file
 */
uploadRouter.delete('/', async (req, res) => {
  try {
    const key = req.query.key as string;
    
    if (!key) {
      return res.status(400).json({ error: 'key is required' });
    }

    await deleteFile(key);

    res.json({
      success: true,
      deleted: key,
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default uploadRouter;
