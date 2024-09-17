FROM node:18.14.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000 

CMD [ "node", "dist/src/app.js" ]