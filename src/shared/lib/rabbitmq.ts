import amqp from 'amqp-connection-manager';
import { logger } from './logger';

if (!process.env.AMQP_URL) {
  throw new Error('AMQP_URL environment variable is not defined!');
}

const connection = amqp.connect([process.env.AMQP_URL]);

connection.on('connect', () => logger.info('RabbitMQ connected!'));

connection.on('disconnect', (params) => {
  logger.error({ err: params.err }, 'RabbitMQ disconnected.');
});

export { connection };
