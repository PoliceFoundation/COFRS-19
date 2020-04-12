package org.policefoundation.covididx.api;

import java.util.ArrayList;
import java.util.List;

public class FacetResponse {
	
	public FacetCount[] purpose;
	public FacetCount[] tags;
	
	public static final class FacetCount {
		public String facet;
		public int count;
	}
	
	public static final FacetResponse fromSolrResponse(SolrFacetResponse solrResponse) {
		FacetResponse ret = new FacetResponse();
		List<FacetCount> list = getFacetCounts(solrResponse.facet_counts.facet_fields.covid_purpose);
		ret.purpose = list.toArray(new FacetCount[0]);
		list = getFacetCounts(solrResponse.facet_counts.facet_fields.covid_tags);
		ret.tags = list.toArray(new FacetCount[0]);
		return ret;
	}

	private static List<FacetCount> getFacetCounts(Object[] facetFields) {
		List<FacetCount> list = new ArrayList<>();
		int index = 0;
		while (index < facetFields.length) {
			FacetCount item = new FacetCount();
			item.facet = (String) facetFields[index++];
			if (facetFields[index] instanceof Number) {
				item.count = ((Number) facetFields[index++]).intValue();
			} else {
				item.count = -1;
			}
			list.add(item);
		}
		return list;
	}

}
