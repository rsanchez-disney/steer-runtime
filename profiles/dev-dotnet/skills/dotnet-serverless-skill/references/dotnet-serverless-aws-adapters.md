# .NET Serverless AWS Adapter Guidance

Preferred shape:
- thin handler
- service orchestration layer
- adapter layer for AWS SDK interactions
- explicit request/event models
- tests with fakes or mocks

Typical seams:
- IS3Adapter
- IQueuePublisher
- ITopicPublisher
- IEventProcessor
