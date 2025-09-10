FROM nginx

WORKDIR /usr/share/nginx/html

RUN apt-get update && apt-get install -y openssl
RUN mkdir /etc/nginx/ssl
RUN openssl req \
	-x509 -nodes -days 365 \
	-newkey rsa:2048 \
	-keyout /etc/nginx/ssl/ssl.key \
	-out /etc/nginx/ssl/ssl.crt \
	-subj "/C=SP/O=42Urduliz/CN=transcendence/"

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443
