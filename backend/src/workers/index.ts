import { Queue, Worker } from 'bullmq';
import { supabase } from '../config/database';
import { OrderStatus, TransactionType } from '../types';

// Queue names
export const QUEUE_NAMES = {
  PAYOUTS: 'payouts',
  NOTIFICATIONS: 'notifications',
  RECONCILIATION: 'reconciliation',
  CLEANUP: 'cleanup',
} as const;

// BullMQ expects ioredis-compatible connection options. Build from REDIS_URL.
const getBullMQConnection = () => {
  const urlString = process.env.REDIS_URL || 'redis://localhost:6379';
  const url = new URL(urlString);
  const isTls = url.protocol === 'rediss:';
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    password: url.password || undefined,
    tls: isTls ? {} : undefined,
  } as any;
};

// Queues and workers (initialized lazily)
let payoutQueue: Queue | undefined;
let notificationQueue: Queue | undefined;
let reconciliationQueue: Queue | undefined;
let cleanupQueue: Queue | undefined;

// In BullMQ v2+ the Worker handles delayed and stalled jobs automatically,
// so an explicit QueueScheduler is no longer required.

let payoutWorker: Worker | undefined;
let notificationWorker: Worker | undefined;
let reconciliationWorker: Worker | undefined;
let cleanupWorker: Worker | undefined;

// Initialize queues and workers only when called from server startup
export const initBackgroundQueuesAndWorkers = (): void => {
  if (payoutQueue || notificationQueue || reconciliationQueue || cleanupQueue) {
    return;
  }

  // Skip initialization if no REDIS_URL configured
  const urlString = process.env.REDIS_URL || '';
  if (!urlString) {
    console.warn('Skipping BullMQ initialization: REDIS_URL not set');
    return;
  }

  payoutQueue = new Queue(QUEUE_NAMES.PAYOUTS, {
    connection: getBullMQConnection(),
  });
  notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
    connection: getBullMQConnection(),
  });
  reconciliationQueue = new Queue(QUEUE_NAMES.RECONCILIATION, {
    connection: getBullMQConnection(),
  });
  cleanupQueue = new Queue(QUEUE_NAMES.CLEANUP, {
    connection: getBullMQConnection(),
  });

  // Payout worker - handles freelancer payments
  payoutWorker = new Worker(
    QUEUE_NAMES.PAYOUTS,
    async (job) => {
      try {
        const { orderId, amount, freelancerId } = job.data;

        console.log(
          `Processing payout for order ${orderId}: ${amount} to freelancer ${freelancerId}`
        );

        // TODO: Integrate with Paystack Transfer API
        // For now, we'll just mark the transaction as completed

        // Create payout transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            order_id: orderId,
            type: TransactionType.ADMIN_PAYOUT,
            amount_cents: amount,
            status: 'completed',
            metadata: {
              processed_at: new Date().toISOString(),
              worker_job_id: job.id,
            },
          });

        if (transactionError) {
          throw transactionError;
        }

        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: OrderStatus.COMPLETED,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (orderError) {
          throw orderError;
        }

        // Update wallet balances
        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            reserved_cents: supabase.sql`reserved_cents - ${amount}`,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', freelancerId);

        if (walletError) {
          throw walletError;
        }

        console.log(`Payout completed for order ${orderId}`);

        // Add notification job
        await notificationQueue.add('payout_success', {
          userId: freelancerId,
          type: 'payout_success',
          data: { orderId, amount },
        });
      } catch (error) {
        console.error(`Payout worker error for job ${job.id}:`, error);

        // Add failed payout notification
        await notificationQueue.add('payout_failed', {
          userId: job.data.freelancerId,
          type: 'payout_failed',
          data: { orderId: job.data.orderId, error: error.message },
        });

        throw error;
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 5,
    }
  );

  // Notification worker - handles email and push notifications
  notificationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      try {
        const { userId, type, data } = job.data;

        console.log(`Processing notification ${type} for user ${userId}`);

        // TODO: Integrate with Resend for emails
        // TODO: Integrate with push notification service

        // For now, just log the notification
        console.log(`Notification sent: ${type}`, data);

        // Log to activity logs
        await supabase.from('audit_logs').insert({
          actor_id: 'system',
          action: 'notification_sent',
          target_type: 'user',
          target_id: userId,
          details: { type, data, sent_at: new Date().toISOString() },
        });
      } catch (error) {
        console.error(`Notification worker error for job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 10,
    }
  );

  // Reconciliation worker - daily reconciliation of payments
  reconciliationWorker = new Worker(
    QUEUE_NAMES.RECONCILIATION,
    async (job) => {
      try {
        console.log('Starting daily reconciliation...');

        // TODO: Implement reconciliation logic
        // 1. Compare Paystack transactions with our records
        // 2. Identify discrepancies
        // 3. Generate admin report
        // 4. Send alerts for issues

        console.log('Daily reconciliation completed');
      } catch (error) {
        console.error('Reconciliation worker error:', error);
        throw error;
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 1,
    }
  );

  // Cleanup worker - cleanup old data
  cleanupWorker = new Worker(
    QUEUE_NAMES.CLEANUP,
    async (job) => {
      try {
        console.log('Starting data cleanup...');

        // TODO: Implement cleanup logic
        // 1. Archive old orders
        // 2. Clean up expired sessions
        // 3. Remove old audit logs

        console.log('Data cleanup completed');
      } catch (error) {
        console.error('Cleanup worker error:', error);
        throw error;
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 1,
    }
  );

  // Error handling for workers
  payoutWorker.on('error', (error) => {
    console.error('Payout worker error:', error);
  });
  notificationWorker.on('error', (error) => {
    console.error('Notification worker error:', error);
  });
  reconciliationWorker.on('error', (error) => {
    console.error('Reconciliation worker error:', error);
  });
  cleanupWorker.on('error', (error) => {
    console.error('Cleanup worker error:', error);
  });

  // Job completion logging
  payoutWorker.on('completed', (job) => {
    console.log(`Payout job ${job.id} completed successfully`);
  });
  notificationWorker.on('completed', (job) => {
    console.log(`Notification job ${job.id} completed successfully`);
  });
};

// Note: event handlers are set during initialization

// Add scheduled jobs
export const setupScheduledJobs = async (): Promise<void> => {
  try {
    if (!reconciliationQueue || !cleanupQueue) {
      console.warn('Skipping scheduled jobs setup: queues not initialized');
      return;
    }
    // Daily reconciliation at 2 AM
    await reconciliationQueue.add(
      'daily_reconciliation',
      {},
      {
        repeat: {
          pattern: '0 2 * * *', // Cron pattern: daily at 2 AM
        },
      }
    );

    // Weekly cleanup on Sundays at 3 AM
    await cleanupQueue.add(
      'weekly_cleanup',
      {},
      {
        repeat: {
          pattern: '0 3 * * 0', // Cron pattern: Sundays at 3 AM
        },
      }
    );

    console.log('✅ Scheduled jobs configured');
  } catch (error) {
    console.error('❌ Failed to setup scheduled jobs:', error);
  }
};

// Add payout job
export const addPayoutJob = async (
  orderId: string,
  amount: number,
  freelancerId: string,
  delay?: number
): Promise<void> => {
  try {
    if (!payoutQueue) {
      console.warn('Payout queue not initialized; skipping job');
      return;
    }
    const jobOptions: any = {
      data: { orderId, amount, freelancerId },
    };

    if (delay) {
      jobOptions.delay = delay;
    }

    await payoutQueue.add('process_payout', jobOptions);
    console.log(`Payout job added for order ${orderId}`);
  } catch (error) {
    console.error('Failed to add payout job:', error);
    throw error;
  }
};

// Add notification job
export const addNotificationJob = async (
  userId: string,
  type: string,
  data: any,
  delay?: number
): Promise<void> => {
  try {
    if (!notificationQueue) {
      console.warn('Notification queue not initialized; skipping job');
      return;
    }
    const jobOptions: any = {
      data: { userId, type, data },
    };

    if (delay) {
      jobOptions.delay = delay;
    }

    await notificationQueue.add(type, jobOptions);
    console.log(`Notification job added for user ${userId}: ${type}`);
  } catch (error) {
    console.error('Failed to add notification job:', error);
    throw error;
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  try {
    if (
      !payoutQueue ||
      !notificationQueue ||
      !reconciliationQueue ||
      !cleanupQueue
    ) {
      return {
        payouts: {},
        notifications: {},
        reconciliation: {},
        cleanup: {},
      };
    }
    const [payoutStats, notificationStats, reconciliationStats, cleanupStats] =
      await Promise.all([
        payoutQueue.getJobCounts(),
        notificationQueue.getJobCounts(),
        reconciliationQueue.getJobCounts(),
        cleanupQueue.getJobCounts(),
      ]);

    return {
      payouts: payoutStats,
      notifications: notificationStats,
      reconciliation: reconciliationStats,
      cleanup: cleanupStats,
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    throw error;
  }
};

// Clean up queues on shutdown
export const cleanupQueues = async (): Promise<void> => {
  try {
    await Promise.all([
      payoutQueue?.close(),
      notificationQueue?.close(),
      reconciliationQueue?.close(),
      cleanupQueue?.close(),
    ]);

    console.log('✅ All queues closed');
  } catch (error) {
    console.error('❌ Error closing queues:', error);
  }
};

// Initialize background workers
export const setupBackgroundWorkers = async (): Promise<void> => {
  try {
    console.log('🔄 Setting up background workers...');
    initBackgroundQueuesAndWorkers();

    // Setup scheduled jobs
    await setupScheduledJobs();

    console.log('✅ Background workers setup completed');
  } catch (error) {
    console.error('❌ Failed to setup background workers:', error);
    throw error;
  }
};
