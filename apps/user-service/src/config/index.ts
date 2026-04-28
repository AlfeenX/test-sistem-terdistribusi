export const config = {
  port: parseInt(process.env["PORT"] ?? "3001", 10),
  databaseUrl: process.env["DATABASE_URL"] ?? "postgresql://postgres:postgres@localhost:5432/users_db",
  rabbitmqUrl: process.env["RABBITMQ_URL"] ?? "amqp://guest:guest@localhost:5672",
  rabbitmqExchange: process.env["RABBITMQ_EXCHANGE"] ?? "gajayana_events",
};
