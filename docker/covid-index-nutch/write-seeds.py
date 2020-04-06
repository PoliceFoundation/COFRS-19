import pandas as pd

df = pd.read_excel('/tmp/nutch/Solr Schema COVID-19 PF.xlsx')

with open("/tmp/seeds.txt", "w") as outfile:
  outfile.write("\n".join(df['URL'].values.tolist()))