FROM node:20-alpine

WORKDIR /app

RUN mkdir -p /var/log/sports-store

COPY package.json ./
RUN npm install --omit=dev

COPY src/ ./src/

CMD ["node", "src/index.js"]