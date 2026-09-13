#!/usr/bin/env bash
# Local (non-Docker) dev runner — starts every service with `npm run dev`
# (nodemon) in parallel via `concurrently`. Requires:
#   - MongoDB running locally on the default port for each service's MONGO_URI
#   - RabbitMQ running locally (amqp://localhost)
#   - Each service's .env populated from its .env.example
#
# For a fuller local environment (Mongo + RabbitMQ included, no manual setup)
# prefer `docker compose up --build` instead — this script is for actively
# iterating on service code with fast reload.

set -e

npx concurrently \
  --names "gateway,auth,dash,notif,product,order,payment" \
  --prefix "[{name}]" \
  --prefix-colors "cyan,magenta,yellow,green,blue,red,white" \
  "cd api-gateway && npm run dev" \
  "cd auth-service && npm run dev" \
  "cd dashboard-service && npm run dev" \
  "cd notification-service && npm run dev" \
  "cd product-service && npm run dev" \
  "cd order-service && npm run dev" \
  "cd payment-service && npm run dev"
