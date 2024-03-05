ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS builder

RUN apt-get update && apt-get install -y python3 build-essential

WORKDIR /app

COPY . .

RUN npm install -g pnpm@8
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:${NODE_VERSION}-slim 

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG VERSION=develop
ENV VERSION=${VERSION}
LABEL org.opencontainers.image.source https://github.com/KennethWussmann/github-archive

COPY --from=builder /app/build/index.js /app/index.js

CMD [ "index.js" ]
