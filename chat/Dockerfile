FROM python:3

WORKDIR /usr/src/app

# RUN apt-get update && apt-get install -y git
# RUN git clone https://github.com/aitorfi/transcendence_chat_service.git /usr/src/app

# RUN chmod +x ./runserver.sh
# RUN cp ./runserver.sh /usr/bin/

# WORKDIR /usr/src/app/chat_service

RUN apt-get update && apt-get install -y netcat-openbsd

COPY ./runserver.sh /usr/bin
RUN chmod +x /usr/bin/runserver.sh

RUN pip install Django channels daphne psycopg2 djangorestframework djangorestframework-simplejwt
RUN pip install django-cors-headers

EXPOSE 8080

CMD [ "/usr/bin/runserver.sh" ]
