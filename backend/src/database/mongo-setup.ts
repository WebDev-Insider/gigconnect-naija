import { Db, Collection, IndexSpecification } from 'mongodb';
import { getMongoDB } from '../config/database';

export interface MongoCollections {
  chats: Collection;
  messages: Collection;
  activityLogs: Collection;
  fileMetadata: Collection;
  auditEvents: Collection;
}

export const setupMongoCollections = async (): Promise<MongoCollections> => {
  const db = getMongoDB();

  // Create collections
  const chats = db.collection('chats');
  const messages = db.collection('messages');
  const activityLogs = db.collection('activity_logs');
  const fileMetadata = db.collection('file_metadata');
  const auditEvents = db.collection('audit_events');

  // Create indexes for better performance
  await createMongoIndexes(chats, messages, activityLogs, fileMetadata, auditEvents);

  return {
    chats,
    messages,
    activityLogs,
    fileMetadata,
    auditEvents
  };
};

const createMongoIndexes = async (
  chats: Collection,
  messages: Collection,
  activityLogs: Collection,
  fileMetadata: Collection,
  auditEvents: Collection
): Promise<void> => {
  try {
    // Chat indexes
    await chats.createIndex({ participants: 1 });
    await chats.createIndex({ order_id: 1 });
    await chats.createIndex({ last_message_at: -1 });
    await chats.createIndex({ created_at: -1 });

    // Message indexes
    await messages.createIndex({ chat_id: 1 });
    await messages.createIndex({ sender_id: 1 });
    await messages.createIndex({ created_at: -1 });
    await messages.createIndex({ chat_id: 1, created_at: -1 }); // Compound index for chat messages
    await messages.createIndex({ delivered_at: 1 }); // For delivery tracking
    await messages.createIndex({ read_by: 1 }); // For read receipts

    // Activity log indexes
    await activityLogs.createIndex({ user_id: 1 });
    await activityLogs.createIndex({ target_type: 1, target_id: 1 });
    await activityLogs.createIndex({ created_at: -1 });
    await activityLogs.createIndex({ action: 1, created_at: -1 });

    // File metadata indexes
    await fileMetadata.createIndex({ uploader_id: 1 });
    await fileMetadata.createIndex({ file_type: 1 });
    await fileMetadata.createIndex({ used_by: 1 });
    await fileMetadata.createIndex({ created_at: -1 });
    await fileMetadata.createIndex({ storage_url: 1 }); // For quick lookups

    // Audit event indexes
    await auditEvents.createIndex({ actor_id: 1 });
    await auditEvents.createIndex({ target_type: 1, target_id: 1 });
    await auditEvents.createIndex({ created_at: -1 });
    await auditEvents.createIndex({ action: 1, created_at: -1 });
    await auditEvents.createIndex({ ip_address: 1 }); // For security monitoring

    // TTL indexes for data retention
    // Messages older than 2 years will be automatically deleted
    await messages.createIndex({ created_at: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });
    
    // Activity logs older than 1 year will be automatically deleted
    await activityLogs.createIndex({ created_at: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

    console.log('✅ MongoDB indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating MongoDB indexes:', error);
    throw error;
  }
};

// Sample data insertion for testing
export const insertSampleData = async (): Promise<void> => {
  const db = getMongoDB();
  
  try {
    // Insert sample chat
    const sampleChat = {
      participants: ['user1', 'user2'],
      last_message_at: new Date(),
      order_id: 'order123',
      created_at: new Date()
    };

    const chatResult = await db.collection('chats').insertOne(sampleChat);
    console.log('✅ Sample chat inserted:', chatResult.insertedId);

    // Insert sample message
    const sampleMessage = {
      chat_id: chatResult.insertedId.toString(),
      sender_id: 'user1',
      type: 'text',
      content: 'Hello! This is a sample message.',
      created_at: new Date(),
      delivered_at: new Date(),
      read_by: ['user2']
    };

    const messageResult = await db.collection('messages').insertOne(sampleMessage);
    console.log('✅ Sample message inserted:', messageResult.insertedId);

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// Data cleanup utilities
export const cleanupOldData = async (): Promise<void> => {
  const db = getMongoDB();
  
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Clean up old messages (manual cleanup as backup to TTL)
    const messagesResult = await db.collection('messages').deleteMany({
      created_at: { $lt: twoYearsAgo }
    });

    // Clean up old activity logs (manual cleanup as backup to TTL)
    const activityResult = await db.collection('activity_logs').deleteMany({
      created_at: { $lt: oneYearAgo }
    });

    console.log(`✅ Cleaned up ${messagesResult.deletedCount} old messages`);
    console.log(`✅ Cleaned up ${activityResult.deletedCount} old activity logs`);

  } catch (error) {
    console.error('❌ Error cleaning up old data:', error);
  }
};

// Database statistics
export const getDatabaseStats = async (): Promise<{
  chats: number;
  messages: number;
  activityLogs: number;
  fileMetadata: number;
  auditEvents: number;
}> => {
  const db = getMongoDB();
  
  try {
    const [chats, messages, activityLogs, fileMetadata, auditEvents] = await Promise.all([
      db.collection('chats').countDocuments(),
      db.collection('messages').countDocuments(),
      db.collection('activity_logs').countDocuments(),
      db.collection('file_metadata').countDocuments(),
      db.collection('audit_events').countDocuments()
    ]);

    return {
      chats,
      messages,
      activityLogs,
      fileMetadata,
      auditEvents
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
};

// Health check for MongoDB
export const checkMongoHealth = async (): Promise<boolean> => {
  try {
    const db = getMongoDB();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ MongoDB health check failed:', error);
    return false;
  }
};
