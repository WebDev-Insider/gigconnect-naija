import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { cloudinary } from '../config/cloudinary';

const router = Router();

// POST /uploads - Upload a file (base64) to Cloudinary
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { file, folder = 'gigconnect' } = req.body as { file?: string; folder?: string };
    if (!file) {
      return res.status(400).json({ success: false, error: 'file (base64 data URI) is required' });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      overwrite: false,
    });

    return res.status(201).json({ success: true, data: { url: result.secure_url, public_id: result.public_id } });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

export default router;