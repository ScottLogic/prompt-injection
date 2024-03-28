FROM node:lts-alpine
ARG BASEDIR=/usr/app
ENV NODE_ENV=prodlite PORT=${PORT:-5000}
ENV VITE_BACKEND_URL=http://localhost:${PORT}/api
RUN echo "Server will run on $VITE_BACKEND_URL"

# Install deps in separate layer, to utilise docker cache
WORKDIR $BASEDIR
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm ci --no-audit

# Copy frontend sources and build UI in separate layer, to utilise docker cache
WORKDIR $BASEDIR/frontend
COPY frontend ./
RUN npm run build

# Copy backend sources
WORKDIR $BASEDIR/backend
COPY backend ./

EXPOSE $PORT

# Preload dotenv module to run locally - env vars via compose file volume
# In remote, mandatory env vars must be provided to the container!
CMD ["node", "--import=tsx", "-r", "dotenv/config", "./src/server/index.ts"]
