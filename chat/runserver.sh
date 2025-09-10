#!/bin/bash

until nc -z $POSTGRES_HOST $POSTGRES_PORT; do
	echo "Waiting for postgres to be available..."
	sleep 1
done

python manage.py makemigrations
python manage.py migrate

daphne -b 0.0.0.0 -p 8080 chat_service.asgi:application
