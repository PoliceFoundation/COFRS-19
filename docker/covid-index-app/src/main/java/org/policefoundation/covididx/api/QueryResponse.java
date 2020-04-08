package org.policefoundation.covididx.api;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.policefoundation.covididx.api.Cord19QueryResponse.Author;

public class QueryResponse {
	public String url;
	public String[] tags;
	public String owner;
	public String[] purpose;
	public String type;
	public String description;
	public String title;
	public String date;
	public String source;
	public static final QueryResponse fromSolrResponse(SolrQueryResponse.Doc solrResponse) {
		QueryResponse ret = new QueryResponse();
		ret.url = solrResponse.id;
		ret.tags = solrResponse.covid_tags;
		ret.owner = solrResponse.covid_owner;
		ret.purpose = solrResponse.covid_purpose;
		ret.type = solrResponse.type != null && solrResponse.type.length > 0 ? solrResponse.type[0] : null;
		ret.description = solrResponse.covid_description;
		ret.title = solrResponse.title;
		ret.date = solrResponse.date != null ? solrResponse.date.substring(0, 10) : null;
		ret.source = QueryRequest.SOURCE_PF;
		return ret;
	}
	public static final QueryResponse fromCord19Response(Cord19QueryResponse.ResponseChild responseChild) {
		QueryResponse ret = new QueryResponse();
		ret.url = responseChild.fields.doi;
		ret.tags = new String[] { "CORD-19" };
		List<String> authors = new ArrayList<String>();
		Author[] authorsArray = responseChild.fields.authors;
		if (authorsArray != null) {
			if (authorsArray.length > 3) {
				authorsArray = Arrays.copyOfRange(authorsArray, 0, 4);
				authorsArray[3].name = "et al";
			}
			for (Cord19QueryResponse.Author a : authorsArray) {
				if (a != null && a.name != null) {
					authors.add(a.name.replace("&apos;", "'"));
				}
			}
		}
		ret.owner = String.join(", ", authors);
		ret.purpose = new String[] { "CORD-19 Research" };
		ret.type = "text/html";
		String cleanedTitle = responseChild.fields.title;
		cleanedTitle = cleanedTitle.replace("<hi>", "").replace("</hi>", "");
		ret.description = cleanedTitle;
		ret.title = cleanedTitle;
		ret.date = responseChild.fields.datestring;
		ret.source = QueryRequest.SOURCE_CORD_19;
		return ret;
	}
}
