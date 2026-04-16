# .NET Self-Host API AWS Adapter Guidance

Preferred shape:
- interfaces in abstractions or service layer
- implementations in infrastructure layer
- configuration in options
- dependency registration in explicit extension methods

Typical seams:
- IS3Adapter
- IObjectStorageService
- IEventPublisher
- IIotPublisher
