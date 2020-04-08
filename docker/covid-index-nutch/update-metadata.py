import pandas as pd
import json
import requests
import re

df = pd.read_excel('/tmp/nutch/Solr Schema COVID-19 PF.xlsx')

hashStrip = re.compile("(.+)#.+")
multispace = re.compile("[ ]+")

payload = []

for index, row in df.iterrows():

  url = row['URL']

  if re.match("^http", url):

    url = hashStrip.sub("\\1", url)
  
    print("Updating metadata for URL (id): " + url)

    purpose = row['Content Purpose']

    tags = [row['Tag 1'], row['Tag 2'], row['Tag 3'], row['Tag 4'], row['Tag 5']]
    tags = [t for t in tags if t and isinstance(t, str) and t != '' and t != 'null' and t != 'NaN']

    payload.append({
      "id": url,
      "covid_owner": {"set": row['Owner']},
      "covid_description": {"set": row['Title']},
      "covid_purpose": {"set": purpose},
      "covid_tags": {"set": tags}
    })

requests.post("http://solr:8983/solr/covid/update?commitWithin=1000", json=payload)
