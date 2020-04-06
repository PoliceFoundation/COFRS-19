FROM solr:8.5.0

#COPY solrconfig.xml /opt/solr/server/solr/configsets/_default/conf/

USER root

RUN mkdir -p /opt/solr/server/solr/configsets/nutch/ && \
  cp -r /opt/solr/server/solr/configsets/_default/* /opt/solr/server/solr/configsets/nutch/ && \
  rm -f /opt/solr/server/solr/configsets/nutch/conf/managed-schema

COPY schema.xml /opt/solr/server/solr/configsets/nutch/conf/

USER solr
