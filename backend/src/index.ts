import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
// import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

// Import configurations
import { connectMongoDB, connectRedis, checkDatabaseHealth } from './config/database';
import { setupMongoCollections } from './database/mongo-setup';

// Import middleware
import { 
  errorHandler, 
  notFound, 
  generalRateLimiter,
  auditLog 
} from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gigRoutes from './routes/gigs';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
// import webhookRoutes from './routes/webhooks';

// Import services
// import { setupSocketHandlers } from './services/socketService';
// import { setupBackgroundWorkers } from './workers';

dotenv.config();

const app = express();
const server = createServer(app);
// const io = new SocketIOServer(server, {
//   cors: {
//     origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });

const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalRateLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const status = Object.values(dbHealth).every(healthy => healthy);
    
    res.status(status ? 200 : 503).json({
      success: status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      databases: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/gigs`, gigRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/chat`, chatRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
// app.use(`/api/${API_VERSION}/webhooks`, webhookRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GigConnect Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Socket.IO setup skipped for build-only mode

// Initialize database connections and start server
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting GigConnect Backend...');
    
    // Connect to databases
    console.log('📊 Connecting to databases...');
    await connectMongoDB();
    await connectRedis();
    
    // Setup MongoDB collections
    console.log('🗄️ Setting up MongoDB collections...');
    await setupMongoCollections();
    
    // Background workers skipped for build-only mode
    
    // Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 API Version: ${API_VERSION}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/${API_VERSION}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('\n🔄 Shutting down gracefully...');
  
  try {
    // Close server
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
    
    // Close database connections
    const { closeMongoDB, closeRedis } = await import('./config/database');
    await closeMongoDB();
    await closeRedis();
    
    console.log('✅ All connections closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start the server when executed directly (ESM-compatible)
try {
  const isDirectRun = import.meta && process.argv[1] && (import.meta.url === pathToFileURL(process.argv[1]).href);
  if (isDirectRun) {
    startServer();
  }
} catch {
  // Fallback: start server if meta/url check fails
  startServer();
}

export default app;
