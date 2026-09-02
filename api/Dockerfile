# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- runtime stage ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY public ./public

RUN useradd --uid 1001 --create-home appuser && chown -R appuser /app
USER appuser

# Cloud Run injects $PORT at runtime; 8080 is the documented default.
EXPOSE 8080
CMD ["node", "dist/server.js"]
