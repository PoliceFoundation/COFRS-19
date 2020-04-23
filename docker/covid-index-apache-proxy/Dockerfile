FROM covid-index-apache-2.4.39

ARG APACHE_HOST=localhost

RUN apt-get update && apt-get install -y apache2 curl

RUN mkdir -p /apache-certs

COPY files/httpd.conf /usr/local/apache2/conf/httpd.conf

# generate default self-signed certs. these will be ignored in favor of equivalents bind-mounted into container (e.g., using letsencrypt certs) at /apache-certs
RUN openssl req -new -x509 -nodes -out /apache-certs/server.crt -keyout /apache-certs/server.key -subj "/C=US/ST=DC/L=Washington/O=Police Foundation/CN=localhost.localdomain/emailAddress=docker@localhost"

COPY files/httpd-ssl.conf /usr/local/apache2/conf/extra/httpd-ssl.conf

RUN chmod +x /usr/local/bin/*

RUN mkdir -p /usr/local/apache2/htdocs/.well-known && \
  echo "<html><h2>letsencrypt challenge dir placeholder page</h2></html>" > /usr/local/apache2/htdocs/.well-known/placeholder.html

RUN echo "<html><h2>health check page</h2></html>" > /usr/local/apache2/htdocs/health-check.html
LABEL health-checker-monitor="true"
#HEALTHCHECK --interval=10s --timeout=3s --retries=1 CMD curl -f -k https://localhost/health-check.html

RUN sed -i "s/ServerName localhost/ServerName ${APACHE_HOST}/g" /usr/local/apache2/conf/extra/httpd-ssl.conf

RUN echo "\n\n\n*** NOTE: if you are building this image on the server, you need to specify the server host with --build-arg APACHE_HOST=[hostname]. Currently APACHE_HOST=$APACHE_HOST.\n\n\n"

COPY files/proxy.conf /usr/local/apache2/conf/extra/proxy.conf
