package org.policefoundation.covididx.api;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class ApiController {
	
	private final Log log = LogFactory.getLog(ApiController.class);
	private static final String CORD19_API_URL = "https://api.cord19.vespa.ai/search/";
	
	@Value("${solrApiUrl}")
	private String solrApiUrl;
	
	@PostConstruct
	public void init() throws Exception {
		log.info("Index app fronting solr api at " + solrApiUrl);
	}
	
	@RequestMapping(value="/api/contentQuery", method=RequestMethod.POST)
	public QueryResponse[] contentQuery(HttpServletRequest request, @RequestBody QueryRequest queryRequest) throws Exception {
		
		QueryResponse[] solrResponses = queryRequest.includesSource(QueryRequest.SOURCE_PF) ? solrContentQuery(queryRequest) : new QueryResponse[0];
		QueryResponse[] cord19Responses = queryRequest.includesSource(QueryRequest.SOURCE_CORD_19) ? cord19ContentQuery(queryRequest) : new QueryResponse[0];
		
		List<QueryResponse> responses = new ArrayList<>();
		
		for (QueryResponse qr : solrResponses) {
			responses.add(qr);
		}
		
		for (QueryResponse qr : cord19Responses) {
			responses.add(qr);
		}
		
		return responses.stream().toArray(QueryResponse[]::new);
		
	}

	private QueryResponse[] cord19ContentQuery(QueryRequest queryRequest) {
		Cord19QueryRequest request = new Cord19QueryRequest();
		request.query = queryRequest.query;
		RestTemplate restTemplate = new RestTemplate();
		Cord19QueryResponse response = restTemplate.postForObject(CORD19_API_URL, request, Cord19QueryResponse.class);
		QueryResponse[] ret = new QueryResponse[0];
		if (response.root != null && response.root.children != null) {
			ret = Arrays.stream(response.root.children).map(QueryResponse::fromCord19Response).toArray(QueryResponse[]::new);
		}
		return ret;
	}

	private QueryResponse[] solrContentQuery(QueryRequest queryRequest) {
		String url = solrApiUrl + "select?q=content:" + queryRequest.query;
		log.info("Querying Solr url " + url);
		RestTemplate restTemplate = new RestTemplate();
		SolrQueryResponse solrResponse = restTemplate.getForObject(url, SolrQueryResponse.class);
		QueryResponse[] ret = new QueryResponse[0];
		if (solrResponse.response != null && solrResponse.response.docs != null) {
			ret = Arrays.stream(solrResponse.response.docs).map(QueryResponse::fromSolrResponse).toArray(QueryResponse[]::new);
		}
		log.info("Returning " + ret.length + " matching Solr documents");
		return ret;
	}

}
