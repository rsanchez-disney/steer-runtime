# agentSpawn hook: retrieve relevant context chunks via TF-IDF index
$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { "$env:USERPROFILE\.kiro" }
$IndexFile = "$KiroDir\context\_index.json"

if (-not (Test-Path $IndexFile)) { exit 0 }

$Query = $input | Out-String
if (-not $Query.Trim()) { exit 0 }

# Delegate to python for TF-IDF scoring (same logic as .sh version)
python3 -c @"
import json, sys, os, re

index_path = r'$IndexFile'
query = '''$($Query.Replace("'", "\'"))'''

try:
    idx = json.load(open(index_path))
except:
    sys.exit(0)

chunks = idx.get('chunks', [])
idf = idx.get('idf', {})
if not chunks: sys.exit(0)

def tokenize(text):
    return [w for w in re.findall(r'[a-z0-9]{3,}', text.lower())]

query_terms = tokenize(query)
if not query_terms: sys.exit(0)

query_tf = {}
for t in query_terms:
    query_tf[t] = query_tf.get(t, 0) + 1
for t in query_tf:
    query_tf[t] /= len(query_terms)

scored = []
for i, chunk in enumerate(chunks):
    score = sum(query_tf.get(t,0) * idf.get(t,0) * chunk.get('tf',{}).get(t,0) for t in query_tf)
    if score > 0: scored.append((score, i))

scored.sort(reverse=True)
print('## Retrieved Context\n')
total = 0
for score, i in scored[:5]:
    text = chunks[i].get('text', '')
    if total + len(text) > 4096: break
    print(f'### {chunks[i]["file"]} (chunk {chunks[i]["offset"]})\n\n{text}\n')
    total += len(text)
"@
