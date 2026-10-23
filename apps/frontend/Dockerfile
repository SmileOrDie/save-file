FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/contracts/src packages/contracts/src
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --filter @save/frontend... --no-frozen-lockfile
COPY apps/frontend apps/frontend
ARG EXPO_PUBLIC_API_URL=https://api-save.shamdani.fr/api/v1
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN pnpm --filter @save/frontend export:web

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/frontend/dist /usr/share/nginx/html
EXPOSE 8080
