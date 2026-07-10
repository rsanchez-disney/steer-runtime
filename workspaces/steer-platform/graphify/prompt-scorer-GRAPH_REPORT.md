# Graph Report

**Nodes:** 264 | **Edges:** 300 | **Communities:** 52

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 25 | prompt_scorer/dimensions | 2 |
| 29 | prompt_scorer/dimensions | 2 |
| 38 | prompt_scorer | 2 |
| 27 | prompt_scorer/dimensions | 2 |
| 10 | go-prompt-scorer | 4 |
| 15 | prompt_scorer/dimensions | 1 |
| 33 | prompt_scorer | 2 |
| 35 | prompt_scorer | 2 |
| 42 | tests | 9 |
| 49 | tests | 15 |
| 2 | go-prompt-scorer/cmd | 5 |
| 8 | go-prompt-scorer | 4 |
| 14 | prompt_scorer | 2 |
| 40 | tests | 6 |
| 5 | go-prompt-scorer | 1 |
| 22 | prompt_scorer/dimensions | 2 |
| 43 | tests | 8 |
| 48 | tests | 8 |
| 50 | tests | 21 |
| 6 | go-prompt-scorer | 2 |
| 7 | go-prompt-scorer | 10 |
| 9 | go-prompt-scorer | 8 |
| 20 | prompt_scorer/dimensions | 2 |
| 21 | prompt_scorer/dimensions | 2 |
| 26 | prompt_scorer/dimensions | 2 |
| 30 | prompt_scorer/dimensions | 3 |
| 31 | prompt_scorer/dimensions | 3 |
| 1 | api | 9 |
| 19 | prompt_scorer/dimensions | 2 |
| 32 | prompt_scorer/models | 1 |
| 34 | prompt_scorer | 8 |
| 37 | prompt_scorer | 4 |
| 39 | tests | 1 |
| 47 | tests | 31 |
| 12 | prompt_scorer | 1 |
| 28 | prompt_scorer/dimensions | 2 |
| 36 | prompt_scorer | 4 |
| 41 | tests | 8 |
| 44 | tests | 8 |
| 45 | tests | 12 |
| 46 | tests | 6 |
| 3 | go-prompt-scorer/cmd | 6 |
| 4 | go-prompt-scorer | 4 |
| 11 | go-prompt-scorer | 4 |
| 13 | prompt_scorer | 2 |
| 18 | prompt_scorer/dimensions | 2 |
| 51 | tests | 7 |
| 0 | root | 6 |
| 16 | prompt_scorer/dimensions | 1 |
| 17 | prompt_scorer/dimensions | 1 |
| 23 | prompt_scorer/dimensions | 2 |
| 24 | prompt_scorer/dimensions | 2 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| tests/test_safety.py | 31 | 0 | 31 |
| tests/test_security.py | 21 | 0 | 21 |
| tests/test_scorer.py | 16 | 0 | 16 |
| api/server.py | 13 | 0 | 13 |
| tests/test_intent.py | 12 | 0 | 12 |
| prompt_scorer/rule_engine.py | 10 | 0 | 10 |
| __main__.py | 10 | 0 | 10 |
| go-prompt-scorer/rule_engine.go | 9 | 0 | 9 |
| tests/test_completeness.py | 9 | 0 | 9 |
| tests/test_session.py | 9 | 0 | 9 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

No cross-community imports detected.

## Suggested Questions

Questions this graph can help answer:

- What depends on `tests/test_safety.py` and what breaks if it changes?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
