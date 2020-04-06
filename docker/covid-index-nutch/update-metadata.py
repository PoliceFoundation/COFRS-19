import pandas as pd
import json
import requests

df = pd.read_excel('/tmp/nutch/Solr Schema COVID-19 PF.xlsx')

payload = []

for index, row in df.iterrows():
  payload.append({
    "id": row['URL'],
    "covid_owner": {"set": row['Owner']},
    "covid_description": {"set": row['Description']},
    "covid_purpose": {"set": row['Content Purpose'].split("|")},
    "covid_tags": {"set": row['Tags'].split("|")}
  })

url = "http://solr:8983/solr/covid/update?commitWithin=1000"
requests.post(url, json=payload)
