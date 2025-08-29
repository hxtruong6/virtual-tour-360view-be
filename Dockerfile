# Base image
FROM node:22-slim AS base

# Configure environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Disable husky for CI and Docker
ENV HUSKY=0

RUN npm install -g corepack@latest

# Enable corepack to use pnpm
RUN corepack enable

RUN echo "After corepack enable: corepack version => $(corepack --version)"

RUN pnpm --version

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to leverage Docker cache for dependencies
COPY package.json pnpm-lock.yaml wait-for-it.sh ./

RUN chmod +x wait-for-it.sh

# Production dependencies stage
FROM base AS prod-deps

# Use Docker's cache mount feature for pnpm store to speed up builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build dependencies and code
FROM base AS build

# Install all dependencies (including dev)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the application source code after dependency installation (leverage caching)
COPY . .

RUN echo "NODE_ENV: $NODE_ENV"
RUN pnpm run build:prod

# Final stage: Create the production image
FROM base

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules /app/node_modules

# Copy the built application from the build stage
COPY --from=build /app/dist /app/dist

# Expose the application port (adjust as necessary for your app)
EXPOSE $PORT

# Run migrations and start the application
# CMD pnpm run migrations:prod && pnpm run start:prod

CMD ./wait-for-it.sh iprotect_postgres:5432 --timeout=20 -- pnpm run migrations:prod && pnpm run start:prod

