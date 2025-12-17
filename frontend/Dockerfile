FROM node:lts-bookworm-slim

RUN apt update && apt -y install lighttpd

COPY ./conf/lighttpd.conf /etc/lighttpd/lighttpd.conf

RUN mkdir -p /src

COPY ./src/ /src

WORKDIR /src

RUN npm install

RUN npx tsc

EXPOSE 3000

# ISM: Copy only files to /src so there's not /src/src
CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
