FROM nginx:mainline-alpine

RUN mkdir -p /etc/nginx/ssl/private /etc/ssl/certs/

# Copy nginx config and SSL certs into the image (no bind mounts)
COPY ./conf /etc/nginx/conf.d
COPY ./ssl_certs/private /etc/nginx/ssl/private
COPY ./ssl_certs/public /etc/ssl/certs

EXPOSE 8443

CMD ["nginx", "-g", "daemon off;"]
