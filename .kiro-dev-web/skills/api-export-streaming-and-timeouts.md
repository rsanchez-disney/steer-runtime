# Skill: Export streaming & timeouts

Use when optimizing export endpoints.

Checklist:
- Stream results, avoid buffering whole export
- Add server-side batching and backpressure awareness
- Emit real progress if possible (counts/stages)
- Log durations and batch sizes at DEBUG
- Ensure proper headers for downloads/streams
