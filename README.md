### COVID-19 First Responder Research & Practice Reference Search (COFRS-19)

This repository houses the source code for the [COFRS-19](https://cofrs-19.org) application.

#### Background

COFRS-19, the First Responder Research & Practice Reference Search project, was created to support the needs of the first responder community by building a search capability that allows a user to access content from any organization, site or reference materials without having to conduct searches across multiple sites. Additionally, COFRS-19 was inspired by the Allen Institute for AI’s CORD-19 dataset project and therefore incorporates the CORD-19 dataset to support the research needs of the first responder community and to further the community’s reliance on scientific evidence generally. COFRS-19 is a unique open source tool and dataset because its designed to serve the strategic, tactical and research needs of first responder agencies and because it can identify and return content from across a variety of first responder organization websites and data repositories, reducing the need for first responder organizations to have to conduct searches across multiple organizations and associations.

The National Police Foundation acknowledges the important contribution of the CORD-19 dataset under license from the Allen Institute for AI, as well as the project development support and expertise of Scott Came and Cascadia Analytics. Additionally, the National Police Foundation recognizes the valuable content contributions via the public websites of the Centers for Disease Control and other U.S. government agencies as well as the International Association of Chiefs of Police, the Police Executive Research Forum and others.

The source code artifacts in this repository are licensed to the public under the terms of the Apache Software License, version 2.0. We welcome contributions from the community. Feel free to submit pull requests or contact us at info@policefoundation.org.

#### Application Architecture

COFRS-19 is intended to be run as a Docker application (set of coordinated Docker services) defined in the `docker/docker-compose.yaml` file.

The front-end is a [SvelteJS](https://svelte.dev/) app that uses [Tailwind](https://tailwindcss.com/) for styling, bundled with [RollupJS](https://rollupjs.org/guide/en/). The back-end is a REST API built with [Spring Boot 2](https://spring.io/projects/spring-boot). The COFRS-19 API relays users' searches to an [Apache Solr](https://lucene.apache.org/solr/) index which is populated from a list of resources maintained by the National Police Foundation using [Apache Nutch](http://nutch.apache.org/). The COFRS-19 API integrates the results of Solr index searches with information obtained through searching the [CORD-19](https://github.com/vespa-engine/cord-19/blob/master/cord-19-queries.md) API.

#### Repository Structure

COFRS-19 is intended to be run as a Docker application (set of coordinated Docker services) defined in the `docker/docker-compose.yaml` file. The containers launched by Docker Compose use images defined in the following directories:

* **covid-index-apache-2.4.39**: A streamlined build of the Apache HTTP server, used in COFRS-19 as a proxy server
* **covid-index-apache-proxy**: Extension of the `covid-index-apache-2.4.39` image with proxy configuration
* **covid-index-app**: A Spring Boot / Svelte app that queries the Solr index and an external API (CORD-19) and enables users to search these data sources. It contains these subdirectories:
  - `src/`: Maven project containing Java / Spring Boot source code for the backend
  - `ui/`: Svelte/JS code for the frontend
* **covid-index-certbot**: Image to use for obtaining/renewing LetsEncrypt certificates for http/s
* **covid-index-nutch**: A python/java8 image that contains python scripts to parse a list of curated resources
from an Excel spreadsheet, and create other resources used by Apache Nutch to crawl the resources and populate the Solr index defined in the `covid-index-solr` image
* **covid-index-solr**: Solr app/index of COFRS-19 resources
* **covid-index-tomcat**: Tomcat web container for hosting the Spring Boot backend
