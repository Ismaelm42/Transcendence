FROM node:lts-bookworm-slim

RUN mkdir /app/

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 8000

#ISM: CMD for development. Use ["npm", "start"] for production
#ISM: package.json has a script called dev that make the npm install command and then runs nodemon. Only for development with volumes! Remove it for production!
CMD ["npm", "run", "dev"]
