FROM node:lts-bookworm-slim

RUN mkdir /app/

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 8000

#ISM: Use production start when not using bind mounts
CMD ["npm", "start"]
