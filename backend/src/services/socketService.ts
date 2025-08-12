import { Server as SocketIOServer, Socket } from 'socket.io';
import { getMongoDB } from '../config/database';
import { supabase } from '../config/database';
import { Chat, Message, MessageType, OrderStatus } from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return next(new Error('Invalid token'));
      }

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('id, role, status')
        .eq('id', user.id)
        .single();

      if (!userData || (userData.status !== 'active' && userData.status !== 'verified')) {
        return next(new Error('User account not active'));
      }

      socket.userId = userData.id;
      socket.userRole = userData.role;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join user to role-based room
    socket.join(`role:${socket.userRole}`);

    // Handle chat room joining
    socket.on('join_chat', async (chatId: string) => {
      try {
        const db = getMongoDB();
        const chat = await db.collection('chats').findOne({ _id: chatId });
        
        if (chat && chat.participants.includes(socket.userId!)) {
          socket.join(`chat:${chatId}`);
          socket.emit('chat_joined', { chatId });
          
          // Mark messages as read
          await db.collection('messages').updateMany(
            { 
              chat_id: chatId, 
              sender_id: { $ne: socket.userId },
              read_by: { $ne: socket.userId }
            },
            { $addToSet: { read_by: socket.userId } }
          );
        } else {
          socket.emit('error', { message: 'Access denied to chat' });
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat room
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      socket.emit('chat_left', { chatId });
    });

    // Handle new message
    socket.on('send_message', async (data: {
      chatId: string;
      content: string;
      type: MessageType;
      attachment_ref?: string;
    }) => {
      try {
        const db = getMongoDB();
        const { chatId, content, type, attachment_ref } = data;

        // Verify user has access to this chat
        const chat = await db.collection('chats').findOne({ 
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Access denied to chat' });
          return;
        }

        // Create message
        const message: Omit<Message, '_id'> = {
          chat_id: chatId,
          sender_id: socket.userId!,
          type,
          content,
          attachment_ref,
          created_at: new Date(),
          delivered_at: new Date(),
          read_by: [socket.userId!] // Sender has read their own message
        };

        const result = await db.collection('messages').insertOne(message);
        const savedMessage = { ...message, _id: result.insertedId };

        // Update chat's last message time
        await db.collection('chats').updateOne(
          { _id: chatId },
          { $set: { last_message_at: new Date() } }
        );

        // Broadcast message to all participants in the chat
        io.to(`chat:${chatId}`).emit('new_message', savedMessage);

        // Send delivery confirmation to sender
        socket.emit('message_sent', { 
          messageId: result.insertedId,
          chatId 
        });

        // Send notification to other participants
        const otherParticipants = chat.participants.filter(id => id !== socket.userId);
        otherParticipants.forEach(participantId => {
          io.to(`user:${participantId}`).emit('message_notification', {
            chatId,
            senderId: socket.userId,
            content: content.substring(0, 100), // Truncate for notification
            type
          });
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle message read receipts
    socket.on('mark_read', async (data: { chatId: string; messageIds: string[] }) => {
      try {
        const db = getMongoDB();
        const { chatId, messageIds } = data;

        // Mark messages as read
        await db.collection('messages').updateMany(
          { 
            _id: { $in: messageIds },
            chat_id: chatId,
            sender_id: { $ne: socket.userId }
          },
          { $addToSet: { read_by: socket.userId } }
        );

        // Notify other participants about read receipts
        socket.to(`chat:${chatId}`).emit('messages_read', {
          chatId,
          userId: socket.userId,
          messageIds
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle order status updates
    socket.on('order_update', async (orderId: string) => {
      try {
        // Get order details
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error || !order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Verify user has access to this order
        if (order.client_id !== socket.userId && order.freelancer_id !== socket.userId) {
          socket.emit('error', { message: 'Access denied to order' });
          return;
        }

        // Notify both client and freelancer about order update
        io.to(`user:${order.client_id}`).emit('order_updated', {
          orderId,
          status: order.status,
          updatedAt: order.updated_at
        });

        io.to(`user:${order.freelancer_id}`).emit('order_updated', {
          orderId,
          status: order.status,
          updatedAt: order.updated_at
        });

      } catch (error) {
        console.error('Error handling order update:', error);
      }
    });

    // Handle payment notifications
    socket.on('payment_update', async (orderId: string) => {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error || !order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Notify freelancer about payment
        io.to(`user:${order.freelancer_id}`).emit('payment_received', {
          orderId,
          amount: order.amount_cents,
          currency: order.currency
        });

      } catch (error) {
        console.error('Error handling payment update:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Leave all rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });
  });

  // Admin notifications
  io.on('admin_notification', (data: {
    type: string;
    message: string;
    targetRole?: string;
    targetUserId?: string;
  }) => {
    const { type, message, targetRole, targetUserId } = data;

    if (targetUserId) {
      // Send to specific user
      io.to(`user:${targetUserId}`).emit('admin_notification', { type, message });
    } else if (targetRole) {
      // Send to all users with specific role
      io.to(`role:${targetRole}`).emit('admin_notification', { type, message });
    } else {
      // Send to all admin users
      io.to('role:admin').emit('admin_notification', { type, message });
    }
  });

  // System-wide notifications
  io.on('system_notification', (data: {
    type: string;
    message: string;
    targetRole?: string;
  }) => {
    const { type, message, targetRole } = data;

    if (targetRole) {
      io.to(`role:${targetRole}`).emit('system_notification', { type, message });
    } else {
      io.emit('system_notification', { type, message });
    }
  });
};

// Utility functions for external use
export const sendNotificationToUser = (io: SocketIOServer, userId: string, notification: any): void => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const sendNotificationToRole = (io: SocketIOServer, role: string, notification: any): void => {
  io.to(`role:${role}`).emit('notification', notification);
};

export const sendOrderStatusUpdate = (io: SocketIOServer, orderId: string, status: OrderStatus): void => {
  // This would typically be called from order service when status changes
  io.emit('order_status_changed', { orderId, status, timestamp: new Date() });
};

export const sendPaymentNotification = (io: SocketIOServer, orderId: string, paymentData: any): void => {
  io.emit('payment_processed', { orderId, ...paymentData, timestamp: new Date() });
};

// Chat room management
export const createChatRoom = async (participants: string[], orderId?: string): Promise<string> => {
  try {
    const db = getMongoDB();
    
    const chat: Omit<Chat, '_id'> = {
      participants,
      last_message_at: new Date(),
      order_id: orderId,
      created_at: new Date()
    };

    const result = await db.collection('chats').insertOne(chat);
    return result.insertedId.toString();
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string, limit: number = 50, before?: Date): Promise<Message[]> => {
  try {
    const db = getMongoDB();
    
    const query: any = { chat_id: chatId };
    if (before) {
      query.created_at = { $lt: before };
    }

    const messages = await db.collection('messages')
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string, userId: string, messageIds: string[]): Promise<void> => {
  try {
    const db = getMongoDB();
    
    await db.collection('messages').updateMany(
      { 
        _id: { $in: messageIds },
        chat_id: chatId,
        sender_id: { $ne: userId }
      },
      { $addToSet: { read_by: userId } }
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};
