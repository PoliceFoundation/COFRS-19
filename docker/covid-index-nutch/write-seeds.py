import pandas as pd
import re

df = pd.read_excel('/tmp/nutch/Solr Schema COVID-19 PF.xlsx')

files = 0

with open("/tmp/seeds.txt", "w") as outfile:
  for index, row in df.iterrows():
    url = row['URL']
    if re.match("^http", url):
      outfile.write(url + "\n")
      files = files + 1

print("Wrote " + str(files) + " seed URLs for nutch processing")