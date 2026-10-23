\
FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/contracts/src packages/contracts/src
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --filter @save/backend... --no-frozen-lockfile
COPY apps/backend apps/backend
RUN pnpm --filter @save/backend build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
RUN addgroup -S -g 10001 save && adduser -S -u 10001 -G save save
COPY apps/backend/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts
COPY --from=build --chown=save:save /workspace/apps/backend/dist ./dist
USER 10001:10001
EXPOSE 3000
CMD ["node", "dist/main.js"]
