import pandas as pd
import json
import requests

df = pd.read_excel('/tmp/nutch/Solr Schema COVID-19 PF.xlsx')

payload = []

for index, row in df.iterrows():
  
  purpose = []
  purposeField = row['Content Purpose']
  if isinstance(purposeField, str) and not purposeField is None:
    purpose = purposeField.split(",")

  tags = []
  tagsField = row['Tags']
  if isinstance(tagsField, str) and not tagsField is None:
    tags = tagsField.split(",")

  payload.append({
    "id": row['URL'],
    "covid_owner": {"set": row['Owner']},
    "covid_description": {"set": row['Description']},
    "covid_purpose": {"set": purpose},
    "covid_tags": {"set": tags}
  })

url = "http://solr:8983/solr/covid/update?commitWithin=1000"
requests.post(url, json=payload)

