---
disable-model-invocation: true
name: OSS-review
description: OSS technical review process. Use when the user asks to review, evaluate, analyze, or complete a technical review for an open source package, library, or URL pointing to a GitHub repo or registry listing.
---

# OSS Technical Review Process

## When to activate
When the user provides a URL (GitHub repo, npm, Maven Central, PyPI, Confluence OSS page, etc.) or names a package/library and asks for a review or technical evaluation.

## Confluence OSS URL Detection

**If the URL matches `confluence.disney.com`** (e.g. `https://confluence.disney.com/pages/viewpage.action?pageId=...` or `https://confluence.disney.com/spaces/.../pages/...`), treat it as an internal Disney OSS ticket page and follow this sub-workflow **before** the main review:

1. Use the `mcp_confluence_get_confluence_page` tool to fetch the page — paass `pageId` if present in the URL query string, otherwise pass `title` + `spaceKey` extracted from the URL path.
2. Extract from the page body:
   - Package/library name and version (usually in the page title, e.g. `PhoneNumberKit 4.2.11 OSS`)
   - Any pre-filled fields (justification, use case, existing concerns, Marketplace link, etc.)
   - The `spaceKey` to use for any follow-up Confluence queries
3. Use the extracted package name + version as the subject of the main review workflow below.
4. Read any fields already filled in the ticket — do not repeat information the requester has already provided; complement and validate it instead.

> **⚠️ NEVER write back to Confluence.** Do NOT call `mcp_confluence_update_confluence_page`, `mcp_confluence_create_confluence_page`, or `mcp_confluence_comment_on_confluence_page` at any point.
> Your role is **read-only**: fetch the page, extract data, run the review, and present the results in chat so the user can paste them manually into the Confluence ticket.

> **URL patterns to recognise:**
> - `https://confluence.disney.com/pages/viewpage.action?pageId=<ID>&spaceKey=<KEY>&title=<TITLE>`
> - `https://confluence.disney.com/spaces/<SPACEKEY>/pages/<ID>/<TITLE>`
> - Any URL whose host is `confluence.disney.com`

## Workflow

1. **If the user provides a Confluence URL** — follow the "Confluence OSS URL Detection" sub-workflow above first, then continue with steps 2–4 using the extracted package info.
2. **If the user provides a direct package/registry URL** — fetch it directly to gather package metadata, then complement with registry and security data.
3. **If the user provides only a package name** — search GitHub, the relevant registry (npm/Maven/PyPI), and security sources.
4. **Always gather the following before answering:**
   - GitHub: stars, forks, contributors, last commit date, open issues, license
   - Registry listing: version history, latest release date, download trends
   - Known CVEs or security advisories (Snyk, NVD)
   - Maintenance status (active vs stale — consider "stale" if last commit > 12 months)
   - Direct and transitive dependencies with known risks
   - Ecosystem alternatives

5. **Answer ONLY the following questions** — respond in English, concise, ready to copy-paste directly into Confluence fields:

   - **Prerequisites** — Software dependencies required (Java/Node version, framework dependencies, etc.)
   - **OSS Type** — Classify the OSS into exactly one of the following categories based on its nature and how it is consumed:
     - **Code Library** — A reusable package/module imported directly into source code (e.g. a Swift pod, npm package, Java jar).
     - **Compiler / Interpreter** — A tool that compiles or interprets source code (e.g. Kotlin compiler, Babel, GraalVM).
     - **App Framework** — A foundational framework that dictates application structure and lifecycle (e.g. Spring Boot, Angular, Flutter).
     - **Service** — A standalone process or hosted service called at runtime (e.g. Redis, Elasticsearch, a third-party API).
     - **Utility** — A standalone CLI tool or build-time utility that is not linked into the application binary (e.g. SwiftLint, Fastlane, a code generator run as a build step).
     State the chosen type and a one-sentence rationale.
   - **Justification** — Details supporting approval or denial of this OSS
   - **Feedback on Use Case by Tech Reviewer** — Does the OSS satisfy the usage context?
   - **Concerns** — Any risks, warnings, or red flags identified
   - **Feedback on Concerns by Tech Reviewer** — Opinions on the concerns raised
   - **Previously Approved OSS Versions** — Are there previously approved versions? (check Marketplace link if provided)
   - **Usage and Demo** — Link to reference implementation or demo
   - **Assessment of Quality** — Overall quality assessment (stars, maintenance, docs, vulnerabilities)
   - **Impacted RA Blocks** — List of existing RA Blocks affected by this OSS
   - **Additional Comments** — Any extra observations
   - **Is the OSS used in Source Code or Binary form?**
   - **Will the OSS be maintained by us locally?**
   - **Are there Generative AI components?**
   - **Where and how do we plan to use the software now and in the future?**
   - **Would anyone outside of Disney know we are using this OSS?**
   - **What systems does this OSS access? Any critical systems implicated?**
   - **Does this OSS provide any critical functionality?**
   - **If an issue arises, can we stop using it?** — How would we replace it?
   - **Will Disney modify the source code? If so, how?**
   - **Will the Disney App, which includes the OSS, be published outside TWDC?**
   - **Will the OSS be publicly accessible or downloaded?**

6. **Recommend a Support Status** — After completing the review, recommend one of the following Marketplace support status values. Search Confluence (space: DPEPRA) for similar approved OSS tickets to validate the choice before recommending.

   | Status | When to use |
   |---|---|
   | **Approved - Supported** | RA team approves AND will incorporate the OSS into an official RA Block they actively maintain. Highest tier — reserved for OSS the RA team formally adopts. |
   | **Approved - No RA Support** | RA team approves for use, but will NOT maintain an RA Block for it. The requesting team owns maintenance. **Most common status** for well-established third-party libraries. |
   | **Approved - Not Preferred - No RA Support** | Approved but a better alternative already exists in the Marketplace. Use when a preferred equivalent is already approved. |
   | **Approved - RA Support Pending** | Approved and RA team intends to add it to an RA Block, but has not done so yet. Transitional state. |
   | **Approved - JEDAI Supported** | Approved and supported specifically through the JedAI AI platform program. Only for AI/ML tooling that went through the JedAI pipeline. |
   | **Rejected** | OSS does not meet legal, security, or technical requirements. |

   **Decision guide:** If the requesting team will own the dependency with no RA involvement → **Approved - No RA Support**. If RA will own a block for it → **Approved - Supported**. If a preferred alternative already exists → **Approved - Not Preferred - No RA Support**.

7. **Provide a final recommendation** — Approve, Approve with conditions, or Deny. Include a brief rationale (2-3 sentences max).

## Response format
- Each answer should be a short paragraph (1-4 sentences) — concise and direct.
- Use plain text, no markdown headers per answer (the user will paste into Confluence fields).
- Language: English only.
- Do NOT add extra commentary or explanations outside the answers.
- Do NOT ask clarifying questions unless critical information is missing (no package name and no URL provided).
- If a question cannot be answered without context only the user has (e.g. internal usage plans), state "To be confirmed by requester."
- **NEVER write to Confluence.** All MCP Confluence usage is read-only (`mcp_confluence_get_confluence_page` only). Present results in chat — the user pastes them manually.

## Key sources to check
- GitHub repository page (fetch if URL provided)
- Maven Central / npm registry / PyPI
- Snyk Security DB: https://security.snyk.io/
- NVD: https://nvd.nist.gov/
- OSS license compatibility
- Disney Marketplace (if link provided in ticket)
