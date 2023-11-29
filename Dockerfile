FROM node:18-alpine AS base

FROM base AS tsbuilder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM base AS builder

WORKDIR /usr/src/app

COPY --from=tsbuilder /usr/src/app/dist ./dist
COPY package*.json ./

RUN npm install --production

RUN npm install -g @vercel/ncc

RUN ncc build ./dist/index.js -o prod

FROM base AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/prod/ ./prod

EXPOSE 3001

CMD [ "node", "prod/index.js" ]