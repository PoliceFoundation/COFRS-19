package org.policefoundation.covididx.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class SolrQueryResponse {
	
	public Response response;
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class Response {
		public int numFound;
		public int start;
		public Doc[] docs;
	}
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class Doc {
		public String id;
		public String host;
		public String title;
		public String[] type;
		public String covid_owner;
		public String covid_description;
		public String[] covid_purpose;
		public String[] covid_tags;
		public String date;
	}

}
