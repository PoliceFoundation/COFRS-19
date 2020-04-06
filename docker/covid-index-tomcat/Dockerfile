FROM tomcat:9-jre8

RUN apt-get update && apt-get install -y openjdk-8-jdk

COPY files/server.xml /usr/local/tomcat/conf/
COPY files/covid-index-app.war /usr/local/tomcat/webapps/

RUN sed -i '109iJAVA_OPTS="-XX:PermSize=128m -Xms512m -Xmx1024m -Djava.security.egd=file:/dev/./urandom"' /usr/local/tomcat/bin/catalina.sh
