# Shared Structure Rules

Choose detailed structure based on project-config.json.

- use dotnet-self-host-api-structure.md when studio is dotnet and projectArchetype is self-host-api
- use dotnet-serverless-structure.md when studio is dotnet and projectArchetype is serverless

General rules:
- mirror the configured reference project when one exists
- keep namespace roots aligned to project names
- keep infrastructure access out of controllers and handlers
- keep orchestration out of controllers and handlers
