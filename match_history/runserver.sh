#!/bin/bash

until nc -z $POSTGRES_HOST $POSTGRES_PORT; do
	echo "Waiting for postgres to be available..."
	sleep 1
done

python manage.py makemigrations
python manage.py migrate

python manage.py get_match_history_rabbitmq & \
gunicorn -w 4 -b 0.0.0.0:8080 user_management_api.wsgi:application
