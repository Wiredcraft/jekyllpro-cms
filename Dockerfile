FROM node:8-alpine

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
RUN yarn

COPY . /app
RUN npm run build

EXPOSE 3000
CMD ["node", "api/index.js"]
