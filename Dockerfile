FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
RUN apt update && apt-get install wait-for-it
CMD ["npm", "run", "docker-dev"]
