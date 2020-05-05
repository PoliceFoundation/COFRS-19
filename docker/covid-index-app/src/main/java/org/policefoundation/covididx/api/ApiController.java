package org.policefoundation.covididx.api;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;

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
	
	private static final String CORD19_API_URL = "https://api.cord19.vespa.ai/search/";
	private static final int MONGO_RETRY_ATTEMPTS = 3;
	private static final int MONGO_RETRY_WAIT = 3000;
	
	private final Log log = LogFactory.getLog(ApiController.class);
	
	@Value("${solrApiUrl}")
	private String solrApiUrl;
	
	private QueryLogRepository queryLogRepository;
	
	@Autowired
	@Retryable(value={Exception.class}, maxAttempts=MONGO_RETRY_ATTEMPTS, backoff=@Backoff(value=MONGO_RETRY_WAIT))
	public void setAnalysisRepository(QueryLogRepository queryLogRepository) {
		this.queryLogRepository = queryLogRepository;
	}
	
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
		
		Date now = new Date();
		QueryLog ql = new QueryLog();
		ql.setHits(responses.size());
		ql.setQuery(queryRequest.query);
		ql.setQueryTime(now);
		queryLogRepository.insert(ql);
		
		for (QueryResponse qr : cord19Responses) {
			responses.add(qr);
		}
		
		return responses.stream().toArray(QueryResponse[]::new);
		
	}
	
	@RequestMapping(value="/api/facets", method=RequestMethod.GET)
	public FacetResponse getFacets() throws Exception {
		RestTemplate restTemplate = new RestTemplate();
		SolrFacetResponse solrResponse = restTemplate.getForObject(solrApiUrl + "select?q=*:*&rows=0&facet.field=covid_tags&facet.field=covid_purpose&facet=on", SolrFacetResponse.class);
		return FacetResponse.fromSolrResponse(solrResponse);
	}
	
	@RequestMapping(value="/api/feedback", method=RequestMethod.PUT)
	public String feedback(@RequestBody FeedbackRequest feedbackRequest) throws Exception {
		// note this is no longer used, as we are just directing the user to a google form
		SlackWebhookRequest slackRequest = new SlackWebhookRequest();
		slackRequest.text = feedbackRequest.feedbackContent;
		log.info("Feedback text: " + slackRequest.text);
		RestTemplate restTemplate = new RestTemplate();
		return restTemplate.postForObject("https://hooks.slack.com/services/[fill in keys here]", slackRequest, String.class);
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
		String q = queryRequest.query;
		q = "\"" + q.replace('"', ' ').trim() + "\"";
		q = "covid_text:" + q + " OR title:" + q;
		String url = solrApiUrl + "select?rows=10000&q=" + q;
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
