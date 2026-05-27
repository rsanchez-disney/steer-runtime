# Repo Scanning Instructions

## Primary Source: step_catalog.json

The repo contains a pre-built step catalog at `{repo_path}/docs/ai/step_catalog.json` (pretty-printed, ~8000 lines).

**Do NOT read the entire file.** Read only the relevant domain.

### How to Read by Domain

1. `grep` for the domain name in the catalog to find its line range:
   ```
   grep -n "{domain}" {repo_path}/docs/ai/step_catalog.json
   ```
2. Read only that section using line offset + limit
3. Print: "📚 Step catalog found — reading domain: {domain}"

### Available Domains

account, annual_passes, ap_upgrades, authentication, cart, checkout, configuration, confirmation, dining, dlr, dvic, enchanting_extras, extras, link_id, lodging, mobile, navigation, plans, reservations, services, support, tickets, travel_agents, utilities, wdw

### Choosing the Right Domain

Match the candidate's area to a domain:
- Availability Calendar, Ticket Sales → `tickets`
- Park Reservations, Select Date → `reservations`
- Cart, Add to Cart → `cart`
- Express Checkout, Payment → `checkout`
- Annual Passes, Blockout Dates → `annual_passes`
- Hotels, Rooms → `lodging`
- Dining, Restaurants → `dining`

If unsure, search multiple relevant domains.

### Structure per Module

```json
{
  "file": "common/general_common_steps/example_steps.py",
  "steps": ["S|I access the page in \"{store}\" as \"{affiliation}\""],
  "domain": "tickets",
  "pages": ["example_page"]
}
```

### Step Prefix Legend

- `G|` = Given
- `W|` = When
- `S|` = Step (matches any keyword)
- `T|` = Then

## Fallback: grep (only if step_catalog.json is missing)

If the catalog doesn't exist, scan manually:

1. `grep` for `@given\|@when\|@then\|@step` in `*.py` files at repo path
2. Exclude: `__pycache__`, `.git`, `node_modules`, `datasources`
3. Extract the pattern string from each decorator

## Matching Rules

- Ignore keyword differences (G/W/S/T are interchangeable)
- Parameterized patterns (text in `"{}"`) match any value
- Match by intent: "I click on {element}" matches "I click on the add to cart button"
- Search related domains/pages for semantic matches
