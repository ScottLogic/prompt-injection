FROM node:lts-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
RUN npm run build
CMD ["node", "--import=tsx", "./src/server.ts"]
