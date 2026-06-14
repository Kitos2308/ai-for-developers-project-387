FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache make

WORKDIR /project
COPY Makefile .
COPY . ./frontend
COPY --from=builder /app/build ./frontend/build
COPY --from=builder /app/.svelte-kit ./frontend/.svelte-kit

EXPOSE 3000
ENTRYPOINT ["./frontend/entrypoint.sh"]