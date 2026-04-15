# Dev PHP Profile

**PHP specialist for Zend Framework 3 (Laminas), legacy ZF1/ZF2, and modern PHP development**

Requires `dev-core` as a base.

---

## Agents (1)

### php_agent
PHP/Zend Framework specialist — MVC architecture, service managers, factory pattern, PSR-12, PHPUnit.

**Use when:**
- Building or modifying Zend Framework 3 / Laminas MVC applications
- Working with legacy ZF1 or ZF2 codebases
- Migrating from ZF1/ZF2 to ZF3/Laminas
- Writing PHPUnit tests for services and controllers
- Module creation and service manager wiring

---

## Capabilities

- ✅ **Code Tools** — Read/write PHP source code
- ✅ **Execution** — Run composer, phpunit, phpcs
- ✅ **File Operations** — Manage module files

---

## Quick Start

```bash
koda install dev-core dev-php

kiro-cli chat --agent php_agent
> "Create a new Laminas MVC module for user management with service, factory, and PHPUnit tests"
```

---

## Structure

```
profiles/dev-php/
├── agents/
│   └── php_agent.json
├── prompts/
│   └── php_agent.md
├── context/
│   ├── php_zend_conventions.md
│   ├── php_testing_strategy.md
│   └── php_legacy_migration.md
├── steering-map.json
└── README.md
```

---

## Kiro IDE Support

Context files are the single source of truth. Steering files generated via `steering-map.json`.

```bash
koda kiro-ide install
```

---

## Install

```bash
koda install dev-core dev-php       # PHP developer (17 agents)
koda install dev                    # All dev (includes php)
```

---

**Profile Version:** 1.0
**Agents:** 1
**Last Updated:** April 14, 2026
