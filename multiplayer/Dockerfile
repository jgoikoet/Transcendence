FROM python:3.11

WORKDIR /usr/src/app

COPY ./runserver.sh /usr/bin
RUN chmod +x /usr/bin/runserver.sh

RUN pip install \
	Django \
	channels \
	daphne \
	aiohttp \
	psycopg2 \
	djangorestframework \
	djangorestframework-simplejwt \
	django-cors-headers \
	pika

EXPOSE 8080

CMD [ "/usr/bin/runserver.sh" ]
