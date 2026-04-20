# Skill: Go event processor implementation

Use when adding or modifying Kinesis/Kafka/SQS event processors.

## Steps

1. Define the event model in `internal/models/`
2. Define processing interface in `internal/core/`
3. Implement the processor logic in the service layer
4. Wire the consumer in `internal/app/` bootstrap
5. Add table-driven tests with mocked dependencies
6. Regenerate mocks: `make mock`

## Checklist

- [ ] Event model matches the upstream Kinesis/Kafka message schema
- [ ] Processor handles partial failures gracefully (don't fail entire batch for one bad record)
- [ ] Context propagation — pass `context.Context` through the chain
- [ ] Idempotency — processor can safely re-process the same event
- [ ] Error handling — log and continue vs fail-fast decision documented
- [ ] No PII or secrets logged
- [ ] Table-driven tests cover: success, malformed event, downstream failure, empty batch
- [ ] Mocks regenerated
- [ ] `make build && make test && make lint` passes
