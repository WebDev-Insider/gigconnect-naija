import { createClient } from '@supabase/supabase-js';
import { MongoClient, Db } from 'mongodb';
import { RedisClientType, createClient as createRedisClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase configuration. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in the environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// MongoDB Configuration
let mongoClient: MongoClient;
let mongoDb: Db;

export const connectMongoDB = async (): Promise<Db> => {
  if (mongoDb) return mongoDb;

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    // Configure MongoDB client options based on connection type
    const clientOptions: any = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // If connecting to MongoDB Atlas (cloud), add SSL options
    if (mongoUri.includes('mongodb.net') || mongoUri.includes('atlas')) {
      clientOptions.ssl = true;
      clientOptions.tls = true;
      clientOptions.tlsAllowInvalidCertificates = false;
      clientOptions.tlsAllowInvalidHostnames = false;
      clientOptions.retryWrites = true;
      clientOptions.w = 'majority';
    }

    console.log(`🔗 Connecting to MongoDB: ${mongoUri.includes('mongodb.net') ? 'Atlas (Cloud)' : 'Local Docker'}`);
    mongoClient = new MongoClient(mongoUri, clientOptions);
    await mongoClient.connect();
    mongoDb = mongoClient.db(process.env.MONGO_DB_NAME || 'gigconnect');
    console.log('✅ Connected to MongoDB');
    return mongoDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getMongoDB = (): Db => {
  if (!mongoDb) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return mongoDb;
};

export const closeMongoDB = async (): Promise<void> => {
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ MongoDB connection closed');
  }
};

// Redis Configuration
let redisClient: RedisClientType;

export const connectRedis = async (): Promise<RedisClientType> => {
  if (redisClient) return redisClient;

  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('⚠️  REDIS_URL not set, skipping Redis connection');
      return null as any;
    }

    redisClient = createRedisClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000,
        commandTimeout: 10000,
      },
      retry_strategy: (options) => {
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });
   
    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    // Don't throw error for Redis, just log it
    console.warn('⚠️  Redis connection failed, continuing without Redis');
    return null as any;
  }
};

export const getRedis = (): RedisClientType => {
  if (!redisClient) {
    console.warn('⚠️  Redis not connected, returning null');
    return null as any;
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  }
};

// Database Health Check
export const checkDatabaseHealth = async (): Promise<{
  supabase: boolean;
  mongodb: boolean;
  redis: boolean;
}> => {
  const health = {
    supabase: false,
    mongodb: false,
    redis: false,
  };

  try {
    // Check Supabase
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    health.supabase = !error;
  } catch (error) {
    console.error('Supabase health check failed:', error);
  }

  try {
    // Check MongoDB
    const db = getMongoDB();
    await db.admin().ping();
    health.mongodb = true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  try {
    // Check Redis
    const redis = getRedis();
    if (redis && redis.isOpen) {
      await redis.ping();
      health.redis = true;
    }
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return health;
};

// Graceful shutdown
export const gracefulShutdown = async (): Promise<void> => {
  console.log('🔄 Shutting down gracefully...');

  try {
    await closeMongoDB();
    await closeRedis();
    console.log('✅ All database connections closed');
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
  }

  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
