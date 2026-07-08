FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all deps (tsc lives in devDependencies)
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Remove dev dependencies and source
RUN npm prune --omit=dev && rm -rf src/ tsconfig.json

# Runtime assets — dist/index.js serves ../static relative to itself
COPY static/ ./static/

ENV NODE_ENV=production

# Railway injects PORT at runtime; 3005 is the local default (src/index.ts)
EXPOSE 3005

CMD ["node", "dist/index.js"]
