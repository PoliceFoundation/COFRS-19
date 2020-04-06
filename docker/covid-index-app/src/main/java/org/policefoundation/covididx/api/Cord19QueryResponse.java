package org.policefoundation.covididx.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class Cord19QueryResponse {
	
	public ResponseRoot root;
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class ResponseRoot {
		public ResponseChild[] children;
	}
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class ResponseChild {
		public ResponseRecord fields;
	}
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class ResponseRecord {
		public String title;
		public String datestring;
		public String journal;
		public String doi;
		public Author[] authors;
	}
	
	@JsonIgnoreProperties(ignoreUnknown=true)
	public static final class Author {
		public String name;
	}

}
