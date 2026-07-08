# Feature Context Files

This directory contains detailed context documents for active features. **Do NOT load all files** — only read the specific feature file relevant to your current task.

## Available Features

| File | Feature | Ticket |
|------|---------|--------|
| `POS-1936-gift-card-activate-reload.md` | Gift Card Activate & Reload | POS-1936 |
| `POS-2270-entitlement-receipted-refunds.md` | Entitlement Receipted Refunds | POS-2270 |
| `POS-1478-bundling-item-sets.md` | Bundling Item Sets | POS-1478 |
| `POS-6003-ej-taxable-catchall-open-price-item.md` | EJ Taxable Catchall Open Price Item | POS-6003 |
| `POS-1083-ddp-refund-receipt-amounts.md` | DDP Refund Receipt Amounts | POS-1083 |

## How to Use

1. Identify the feature related to your current ticket (match by ticket number prefix or feature description)
2. Read ONLY the matching feature file using `fs_read`
3. If no feature matches, proceed without feature context

## Path

```
context/features/{filename}.md
```
