FROM amd64/node:16.15.0 as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM amd64/node:16.15.0 as runner
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY .env .
COPY server server
COPY --from=builder /usr/src/app/dist dist
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/app.js"]