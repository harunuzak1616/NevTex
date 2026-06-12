import json
import re

log_path = r" C:\Users\Ýþ\.gemini\antigravity\brain\f04a29b5-6574-4114-a4c9-837a06b9abfe\.system_generated\logs\transcript.jsonl\
valid_html = \\
with open(log_path, \r\, encoding=\utf-8\) as f:
 for line in f:
 try:
 data = json.loads(line)
 if \content\ in data and \<html\ in data[\content\] and \Nev Tex Pro\ in data[\content\]:
 valid_html = data[\content\]
 except:
 pass

if valid_html:
 print(\Found HTML candidate in transcript length:\, len(valid_html))
 with open(\recovered_index.html\, \w\, encoding=\utf-8\) as f:
 f.write(valid_html)

