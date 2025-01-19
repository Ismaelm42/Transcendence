FROM buildpack-deps:bullseye

RUN apt update -y && apt install python3-pip -y

RUN pip install django

RUN pip install psycopg2

RUN mkdir /app

COPY . /app/

WORKDIR /app

EXPOSE 8000

CMD ["tail", "-f", "/dev/null"]

# python3 manage.py migrate

# python3 manage.py runserver 0.0.0.0:8000
