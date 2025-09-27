import type { User } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { connection as rabbitmqConnection } from "../shared/lib/rabbitmq";
import { logger } from "../shared/lib/logger";
import type { Channel } from "amqplib";

const NOTIFICATION_QUEUE = "user-notifications-queue";
const DEAD_LETTER_QUEUE = "user-notifications-dlq";

export const userService = {
  async create(name: string, email: string): Promise<User> {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use.");
    }

    const newUser = await userRepository.create({ name, email });

    const channelWrapper = rabbitmqConnection.createChannel({
      setup: (channel: Channel) => {
        return Promise.all([
          channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true }),
          channel.assertQueue(NOTIFICATION_QUEUE, {
            durable: true,
            deadLetterExchange: "",
            deadLetterRoutingKey: DEAD_LETTER_QUEUE,
          }),
        ]);
      },
    });

    try {
      const message = JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      });

      await channelWrapper.sendToQueue(
        NOTIFICATION_QUEUE,
        Buffer.from(message),
        { persistent: true }
      );

      logger.info(`Message USER_CREATED sent to queue for user ${newUser.id}`);
    } catch (error) {
      logger.error({ error }, "Failed to send USER_CREATED message to queue.");
    } finally {
      await channelWrapper.close();
    }

    return newUser;
  },

  async findAll(): Promise<User[]> {
    return userRepository.findAll();
  },
};
