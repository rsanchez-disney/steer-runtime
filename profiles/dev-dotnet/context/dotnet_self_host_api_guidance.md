# .NET Self-Host API Guidance

Use this guidance when projectArchetype is self-host-api.

- prefer thin controllers
- keep Program.cs thin
- use explicit dependency registration extensions
- use Swagger documentation when enabled
- use health checks where appropriate
- keep the application compatible with Windows Service hosting
- keep the design Kubernetes-friendly
