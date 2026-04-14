# Shared Structure Rules

Choose detailed structure based on project configuration.

- use self-host-api structure when projectArchetype is self-host-api
- use serverless structure when projectArchetype is serverless

General rules:
- mirror the configured reference project when one exists
- keep namespace roots aligned to project names
- keep infrastructure access out of controllers and handlers
- keep orchestration out of controllers and handlers
