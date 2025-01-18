# Versión oficial de nginx
FROM nginx:stable

# Creación de la ruta para los certificados
RUN mkdir -p /etc/nginx/ssl/private /etc/ssl/certs/

# Puerto 443
EXPOSE 443

# Comando básico para arrancar nginx
CMD ["nginx", "-g", "daemon off;"]
