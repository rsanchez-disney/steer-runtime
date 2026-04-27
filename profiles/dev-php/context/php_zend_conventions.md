# PHP Zend Framework Conventions

## Coding Standard
- PSR-12 strictly enforced
- Type declarations on all parameters, return types, and properties
- Strict types declaration in every file: `declare(strict_types=1);`

## Architecture
- MVC with thin controllers — business logic in services
- Service manager for all dependency injection
- Factories for service and controller instantiation (never `new` in controllers)
- Module system for feature boundaries
- Configuration-driven wiring via `module.config.php`

## Zend Framework 3 / Laminas
- `laminas/laminas-mvc` as the MVC layer
- `laminas/laminas-servicemanager` for DI
- `laminas/laminas-db` or Doctrine for persistence
- `laminas/laminas-form` + `laminas/laminas-inputfilter` for validation
- `laminas/laminas-hydrator` for object hydration

## Legacy ZF1/ZF2 Identification
- ZF1: `Zend_` prefix, `application.ini`, `Bootstrap.php`, `application/` layout
- ZF2: `Zend\` namespace, `Module.php` with `getConfig()`, `module/` layout
- ZF3/Laminas: `Laminas\` namespace, same module structure as ZF2

## Dependency Management
- Composer for all dependencies
- `composer.json` autoload PSR-4 mapping per module
- Lock file committed to repo
