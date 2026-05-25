# Cart Service — Runbook

Source: [Cart Runbook](https://confluence.disney.com/spaces/WDPROS/pages/484023191/Cart)

## Purge Scripts

- Execution Time: 1:30 AM PST (daily)
- Script: https://github.disney.com/wdprd-development/cart-service-java8/blob/de42f6167b4f56ad2a06105a056b061bc12c3520/sql/omnichannel/Pre-Steps_OminiChannel_CartDB/STEP-3_PRO-253420_pep_cart_mysql_cleanup.sql

### Purge Actions

- Deletes expired anonymous carts (older than 30 days)
- Deletes expired guest carts (older than 1 year)
- Deletes expired anonymous BOOKED/REJECTED carts and items (older than 30 days)
