package org.policefoundation.covididx.api;

public class QueryRequest {
	
	public static final String SOURCE_PF = "pf";
	public static final String SOURCE_CORD_19 = "cord-19";
	
	public String query;
	public String[] sources;
	
	public boolean includesSource(String source) {
		boolean ret = false;
		if (source != null) {
			for (String src : sources) {
				if (source.equals(src)) {
					ret = true;
					break;
				}
			}
		}
		return ret;
	}
	
}
