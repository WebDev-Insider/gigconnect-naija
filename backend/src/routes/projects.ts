import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import { getMongoDB } from '../config/database';
import { UserRole } from '../types';

const router = Router();

// Validation rules
const createProjectValidation = [
  body('title').isString().trim().isLength({ min: 3, max: 120 }),
  body('description').isString().trim().isLength({ min: 10 }),
  body('category').isString().trim().isLength({ min: 2 }),
  body('budget').isNumeric(),
  body('deliveryTime').isString().trim().isLength({ min: 1 }),
  body('skills').optional().isArray(),
  body('attachments').optional().isArray(),
];

// POST /projects - Create a new project (Client)
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.CLIENT),
  createProjectValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const db = getMongoDB();
      const projects = db.collection('projects');

      const now = new Date();
      const project = {
        client_user_id: req.user!.id,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        budget: Number(req.body.budget), // store in NGN as number
        delivery_time: req.body.deliveryTime,
        skills: Array.isArray(req.body.skills) ? req.body.skills : [],
        attachments: Array.isArray(req.body.attachments)
          ? req.body.attachments
          : [],
        status: 'open',
        created_at: now,
        updated_at: now,
      };

      const result = await projects.insertOne(project as any);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { id: result.insertedId.toString(), ...project },
      });
    } catch (error) {
      console.error('Create project error:', error);
      res
        .status(500)
        .json({ success: false, error: 'Failed to create project' });
    }
  }
);

// GET /projects - List projects (filter by clientId)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getMongoDB();
    const projects = db.collection('projects');

    const { clientId, status, search } = req.query as {
      clientId?: string;
      status?: string;
      search?: string;
    };

    const filter: any = {};
    if (clientId) filter.client_user_id = clientId;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const results = await projects
      .find(filter)
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    const mapped = results.map((p: any) => ({ id: p._id.toString(), ...p }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ success: false, error: 'Failed to list projects' });
  }
});

// GET /projects/:id - Get a single project
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getMongoDB();
    const projects = db.collection('projects');
    const { ObjectId } = await import('mongodb');

    const doc = await projects.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: { id: doc._id.toString(), ...doc } });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, error: 'Failed to get project' });
  }
});

// PUT /projects/:id - Update a project (owner only)
router.put(
  '/:id',
  authenticateToken,
  requireRole([UserRole.CLIENT, UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const db = getMongoDB();
      const projects = db.collection('projects');
      const { ObjectId } = await import('mongodb');

      const projectId = new ObjectId(req.params.id);
      const doc = await projects.findOne({ _id: projectId });
      if (!doc) {
        return res
          .status(404)
          .json({ success: false, error: 'Project not found' });
      }

      if (
        req.user!.role !== UserRole.ADMIN &&
        doc.client_user_id !== req.user!.id
      ) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const update: any = { updated_at: new Date() };
      const allowed = [
        'title',
        'description',
        'category',
        'budget',
        'delivery_time',
        'skills',
        'attachments',
        'status',
      ];
      for (const key of allowed) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      }

      await projects.updateOne({ _id: projectId }, { $set: update });
      const updated = await projects.findOne({ _id: projectId });

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: { id: updated!._id.toString(), ...updated },
      });
    } catch (error) {
      console.error('Update project error:', error);
      res
        .status(500)
        .json({ success: false, error: 'Failed to update project' });
    }
  }
);

export default router;
