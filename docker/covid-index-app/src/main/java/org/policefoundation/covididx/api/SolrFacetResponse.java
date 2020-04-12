package org.policefoundation.covididx.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class SolrFacetResponse {
	
	public FacetCounts facet_counts;
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class FacetCounts {
		public FacetFields facet_fields;
	}
	
	public static final class FacetFields {
		public Object[] covid_tags;
		public Object[] covid_purpose;
	}

}
