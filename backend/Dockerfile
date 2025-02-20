FROM node:lts-bookworm

RUN mkdir /app/

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 8000

#ISM: CMD for development. Use ["npm", "start"] for production
CMD ["npm", "run", "dev"]
