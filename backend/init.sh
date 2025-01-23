#!/bin/bash

# no cache to reduce the size of the image
pip install --no-cache-dir -r requirements.txt

# check if postgres is ready
until pg_isready -h postgres -p 5432;do
  sleep 2
done

# database migration
python3 manage.py makemigrations
python3 manage.py migrate

# init Django server
python3 manage.py runserver 0.0.0.0:8000
