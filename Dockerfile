FROM node:12.7.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
ADD *.js ./ /usr/src/app/
RUN apk add --no-cache bash
USER node

EXPOSE 4000 

CMD [ "npm", "start" ]