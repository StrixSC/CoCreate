FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
COPY ./wait-for-it.sh .
EXPOSE 3000
CMD ["npm", "run", "docker-dev"]
