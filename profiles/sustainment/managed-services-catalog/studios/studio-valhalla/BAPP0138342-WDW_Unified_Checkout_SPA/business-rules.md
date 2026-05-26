# Business Rules — WDW UC SPA

## Overview

Guest-facing frontend for the UC (Unified Commerce) checkout path at WDW. Handles consumer ticket purchases, modifications, Genie+/LL, and AP upgrades.

## Key Rules

- Generates ConvoIDs that trace through the entire UC flow
- Captures payment session for downstream processing
- Products: Consumer tickets, Genie+/LL, AP upgrades, schedule activities, VO/Packages consumer
- Downstream path: UC SPA → Order VAS → Order Service → PEOS
