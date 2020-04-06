FROM openjdk:8

RUN apt-get update && \
  apt-get remove -y python && \
  apt autoremove -y && \
  apt-get install -y python3.7 python3-pip

RUN pip3 install --upgrade pip
RUN pip3 install pandas xlrd requests

RUN mkdir -p /opt && \
  cd /opt && \
  curl -SsLO https://downloads.apache.org/nutch/1.16/apache-nutch-1.16-bin.zip && \
  unzip apache-nutch-1.16-bin.zip

COPY nutch-site.xml /opt/apache-nutch-1.16/conf/
COPY index-writers.xml /opt/apache-nutch-1.16/conf/
COPY covid-crawl /opt/apache-nutch-1.16/bin

RUN chmod ugo+x /opt/apache-nutch-1.16/bin/covid-crawl

ENV PATH=$PATH:/opt/apache-nutch-1.16/bin

WORKDIR /opt/apache-nutch-1.16

COPY *.py /

CMD "covid-crawl"