import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMongoDB } from '../config/database';

const router = Router();

// GET /rooms - List user chat rooms
router.get('/rooms', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getMongoDB();
    const chats = db.collection('chats');

    const results = await chats
      .find({ participants: req.user!.id })
      .sort({ last_message_at: -1 })
      .limit(100)
      .toArray();

    const mapped = results.map((c: any) => ({ id: c._id.toString(), ...c }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('List chat rooms error:', error);
    res.status(500).json({ success: false, error: 'Failed to list chat rooms' });
  }
});

// POST /rooms - Create a new chat room between two users (if not exists)
router.post('/rooms', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { participantId, orderId } = req.body as { participantId: string; orderId?: string };
    if (!participantId) {
      return res.status(400).json({ success: false, error: 'participantId is required' });
    }

    const db = getMongoDB();
    const chats = db.collection('chats');

    const existing = await chats.findOne({
      participants: { $all: [req.user!.id, participantId] },
      ...(orderId ? { order_id: orderId } : {}),
    });

    if (existing) {
      return res.status(200).json({ success: true, data: { id: (existing as any)._id.toString(), ...existing } });
    }

    const now = new Date();
    const doc = {
      participants: [req.user!.id, participantId],
      order_id: orderId || null,
      last_message_at: now,
      created_at: now,
    };

    const result = await chats.insertOne(doc as any);
    return res.status(201).json({ success: true, data: { id: result.insertedId.toString(), ...doc } });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ success: false, error: 'Failed to create chat room' });
  }
});

// GET /:chatId/messages - Get chat messages
router.get('/:chatId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getMongoDB();
    const chats = db.collection('chats');
    const messages = db.collection('messages');
    const { ObjectId } = await import('mongodb');

    const chatId = req.params.chatId;
    const chat = await chats.findOne({ _id: new ObjectId(chatId) });
    if (!chat || !(chat as any).participants.includes(req.user!.id)) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    const results = await messages
      .find({ chat_id: chatId })
      .sort({ created_at: 1 })
      .limit(500)
      .toArray();

    const mapped = results.map((m: any) => ({ id: m._id.toString(), ...m }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to get chat messages' });
  }
});

// POST /:chatId/messages - Send message (text or payment proof)
router.post('/:chatId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = getMongoDB();
    const chats = db.collection('chats');
    const messages = db.collection('messages');
    const { ObjectId } = await import('mongodb');

    const chatId = req.params.chatId;
    const { type = 'text', content = '', attachments = [], orderId } = req.body as any;

    const chat = await chats.findOne({ _id: new ObjectId(chatId) });
    if (!chat || !(chat as any).participants.includes(req.user!.id)) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    const now = new Date();
    const messageDoc = {
      chat_id: chatId,
      sender_id: req.user!.id,
      type,
      content,
      attachments,
      order_id: orderId || (chat as any).order_id || null,
      created_at: now,
      read_by: [],
    };

    const result = await messages.insertOne(messageDoc as any);

    await chats.updateOne({ _id: new ObjectId(chatId) }, { $set: { last_message_at: now } });

    res.status(201).json({ success: true, data: { id: result.insertedId.toString(), ...messageDoc } });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

export default router;
