ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS builder

WORKDIR /app

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM gcr.io/distroless/nodejs${NODE_VERSION}

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG VERSION=develop
ENV VERSION=${VERSION}
LABEL org.opencontainers.image.source https://github.com/KennethWussmann/github-archive

COPY --from=builder /app/build/index.js /app/index.js

CMD [ "index.js" ]
