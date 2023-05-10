FROM node:latest

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install bcryptjs
COPY . .

CMD ["npm", "run", "start:debug"]