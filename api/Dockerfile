FROM node:20.2.0

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "start:debug"]
