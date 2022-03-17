FROM node:14-alpine

RUN apk add ffmpeg=4.4.1-r2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "init.js"]