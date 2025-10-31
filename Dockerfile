FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
