# FROM node:20-alpine
# WORKDIR /app
# COPY . .
# RUN npm install
# CMD ["npm", "run", "start"]
# EXPOSE 3000

# ETAP 1: Budowanie (Build)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ETAP 2: Produkcja (Production)
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start"]
EXPOSE 3000