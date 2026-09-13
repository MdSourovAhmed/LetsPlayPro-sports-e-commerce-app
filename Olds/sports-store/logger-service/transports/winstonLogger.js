const winston = require("winston");
require("winston-mongodb");

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const createLogger = (mongoUri) => {
  const transports = [
    // Always log to console
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        devFormat
      ),
    }),
    // Persist errors separately
    new winston.transports.File({
      filename: "/var/log/sports-store/error.log",
      level: "error",
      format: combine(timestamp(), errors({ stack: true }), winston.format.json()),
    }),
    // All service activity
    new winston.transports.File({
      filename: "/var/log/sports-store/combined.log",
      format: combine(timestamp(), winston.format.json()),
    }),
  ];

  // MongoDB transport for structured event storage (report queries)
  if (mongoUri) {
    transports.push(
      new winston.transports.MongoDB({
        db: mongoUri,
        collection: "winston_logs",
        level: "info",
        options: { useUnifiedTopology: true },
        format: combine(timestamp(), winston.format.json()),
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports,
    exitOnError: false,
  });
};

module.exports = { createLogger };