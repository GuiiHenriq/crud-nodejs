import 'dotenv/config';
import { connection } from '../src/shared/lib/rabbitmq';

export default async () => {
  console.log("\nClosing RabbitMQ connection...");
  await connection.close();
  console.log("RabbitMQ connection closed.");

  process.exit(0);
};
