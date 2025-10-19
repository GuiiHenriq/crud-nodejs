import 'dotenv/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { connection as rabbitmqConnection } from '@/shared/lib/rabbitmq';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';

const NOTIFICATION_QUEUE = 'user-notifications-queue';
const DEAD_LETTER_QUEUE = 'user-notifications-dlq';

interface UserPayload {
  id: string;
  email: string;
  name: string;
}

async function processMessage(msg: ConsumeMessage | null, channel: Channel) {
  if (!msg) {
    return;
  }

  const content = msg.content.toString();
  const userData: UserPayload = JSON.parse(content) as UserPayload;
  const log = logger.child({ userId: userData.id, queue: NOTIFICATION_QUEUE });

  log.info('Received message.');

  try {
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: { welcome_email_sent_at: true },
    });

    if (user?.welcome_email_sent_at) {
      log.warn('Welcome email already sent. Skipping.');
      channel.ack(msg);
      return;
    }

    if (userData.email.includes('fail')) {
      log.error('Simulating a processing failure for this user.');
      channel.nack(msg, false, false);
      return;
    }

    log.info(`---> 📧 Sending welcome email to ${userData.email}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log.info(`---> ✅ Email sent successfully.`);

    await prisma.user.update({
      where: { id: userData.id },
      data: { welcome_email_sent_at: new Date() },
    });
    log.info('User marked as "welcome email sent".');

    channel.ack(msg);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error({ err }, 'Failed to process message.');
    channel.nack(msg, false, false);
  }
}

async function main() {
  const channelWrapper = rabbitmqConnection.createChannel({
    setup: (channel: Channel) => {
      logger.info('Channel created. Setting up queue and consumer...');
      return Promise.all([
        channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true }),
        channel.assertQueue(NOTIFICATION_QUEUE, {
          durable: true,
          deadLetterExchange: '',
          deadLetterRoutingKey: DEAD_LETTER_QUEUE,
        }),
        channel.prefetch(1),
        channel.consume(NOTIFICATION_QUEUE, (msg) => {
          processMessage(msg, channel).catch((err: unknown) => {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error(
              { error },
              'Error processing message, it will be nacked.',
            );
            if (msg) channel.nack(msg, false, false);
          });
        }),
      ]);
    },
  });

  await channelWrapper.waitForConnect();
  logger.info('Consumer is waiting for messages...');
}

main().catch((error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error({ err }, 'Consumer failed to start.');
  process.exit(1);
});
