# Portal — Project Context

## What it is

The portal is the official documentation site for the JedAI platform, built with Astro. It is the primary reference for teams onboarding to JedAI, learning how to use available models, and understanding platform capabilities.

## Tech Stack

- **Framework**: Astro (SSR or static, confirm with team)
- **Content**: Markdown / MDX pages
- **UI components**: React islands where interactivity is needed
- **Styling**: Tailwind CSS
- **Deployment**: Static hosting or SSR adapter (Vercel, Netlify, or internal)

## Content areas

- Getting started guides (onboarding, first API call)
- Model catalog — descriptions, capabilities, pricing, usage examples
- Integration guides — how to connect via LiteLLM, OpenWebUI, or direct API
- Reference docs — API endpoints, virtual key management, rate limits
- Changelog / release notes for the JedAI platform

## Key Principle

> Documentation lives alongside the platform. When a feature ships in LiteLLM or OpenWebUI, a corresponding doc page should ship in the portal.

## Ownership

- **Team**: JedAI Platform
- **Repo**: `jedai/portal` on `github.disney.com`
