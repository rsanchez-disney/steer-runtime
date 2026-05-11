#!/bin/bash
# agentSpawn hook: retrieve relevant context chunks via TF-IDF index
# Reads user's first message from stdin, queries index, outputs top-K chunks

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
INDEX_FILE="$KIRO_DIR/context/_index.json"

# If no index, exit silently (fallback to full loading)
[ ! -f "$INDEX_FILE" ] && exit 0

# Read the user's task/message from stdin
QUERY=$(cat)
[ -z "$QUERY" ] && exit 0

python3 -c "
import json, math, sys, os

index_path = '$INDEX_FILE'
query = '''$QUERY'''

try:
    idx = json.load(open(index_path))
except:
    sys.exit(0)

chunks = idx.get('chunks', [])
idf = idx.get('idf', {})
if not chunks:
    sys.exit(0)

# Tokenize query
def tokenize(text):
    import re
    return [w for w in re.findall(r'[a-z0-9]{3,}', text.lower())]

query_terms = tokenize(query)
if not query_terms:
    sys.exit(0)

query_tf = {}
for t in query_terms:
    query_tf[t] = query_tf.get(t, 0) + 1
for t in query_tf:
    query_tf[t] /= len(query_terms)

# Score chunks
scored = []
for i, chunk in enumerate(chunks):
    score = 0.0
    ctf = chunk.get('tf', {})
    for term, qtf in query_tf.items():
        score += qtf * idf.get(term, 0) * ctf.get(term, 0)
    if score > 0:
        scored.append((score, i))

scored.sort(reverse=True)

# Output top 5, max 4KB
print('## Retrieved Context')
print('')
total = 0
for score, i in scored[:5]:
    text = chunks[i].get('text', '')
    if total + len(text) > 4096:
        break
    print(f'### {chunks[i][\"file\"]} (chunk {chunks[i][\"offset\"]})')
    print('')
    print(text)
    print('')
    total += len(text)
" 2>/dev/null
