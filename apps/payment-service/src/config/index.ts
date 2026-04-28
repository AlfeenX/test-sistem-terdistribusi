export const config = {
  port: parseInt(process.env["PORT"] ?? "3004", 10),
  databaseUrl: process.env["DATABASE_URL"] ?? "postgresql://postgres:postgres@localhost:5435/payments_db",
  rabbitmqUrl: process.env["RABBITMQ_URL"] ?? "amqp://guest:guest@localhost:5672",
  rabbitmqExchange: process.env["RABBITMQ_EXCHANGE"] ?? "gajayana_events",
};
