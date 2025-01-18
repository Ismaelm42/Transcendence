# Versión debian
FROM buildpack-deps:bullseye

RUN apt update -y && apt install python3-pip -y

RUN pip install django

# Puerto 8000
EXPOSE 8000

CMD ["tail", "-f", "/dev/null"]
