package org.policefoundation.covididx.api;

public class Cord19QueryRequest {
	public String yql = "select id,title, authors, datestring, journal, doi from sources * where userQuery();";
	public String query;
	public String type = "all";
	public String ranking = "default";
	public int hits = 50;
}
