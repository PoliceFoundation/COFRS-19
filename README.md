#### COVID Index Images and Application

This repository houses the following Docker images:

* covid-index-solr: A Solr instance to index COVID resources curated by the Police Foundation
* covid-index-nutch: A python/java8 image that contains python scripts to parse a list of curated resources
from an Excel spreadsheet, and create other resources used by Apache Nutch to crawl the resources and populate a Solr index
* covid-index-app: A Spring Boot / Svelte app that queries the Solr index and an external API (CORD-19) and enables users to search these data sources