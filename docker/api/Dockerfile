FROM node:16

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
RUN npm run build
RUN npm install --prod

ENTRYPOINT ["node", "./build/http-api/index.js"]
