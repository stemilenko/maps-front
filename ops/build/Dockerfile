# syntax=docker/dockerfile:1
   
FROM node:20-alpine

# Proxies for yarn command
# ENV http_proxy http://localhost:3128
# ENV https_proxy http://localhost:3128

WORKDIR /app
COPY package.json /app

RUN yarn install --production

# Remove proxies for runtime
# RUN unset http_proxy https_proxy

COPY . /app

CMD ["npm", "start"]
