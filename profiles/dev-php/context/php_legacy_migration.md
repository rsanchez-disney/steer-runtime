# PHP Legacy Migration Guide

## ZF1 → ZF3/Laminas Migration

### Key Mappings
- `Zend_Controller_Action` → `Laminas\Mvc\Controller\AbstractActionController`
- `Zend_Db_Table` → `Laminas\Db\TableGateway\TableGateway` or Doctrine
- `Zend_Form` → `Laminas\Form\Form` + `Laminas\InputFilter\InputFilter`
- `Zend_Registry` → Service Manager (proper DI)
- `Zend_View_Helper_*` → `Laminas\View\Helper\*`
- Action helpers → Controller plugins
- `application.ini` → `module.config.php` (PHP arrays)

### Strategy
- Migrate module by module, not big-bang
- Introduce service manager early — replace `Zend_Registry` usage first
- Add factories for all new services
- Keep legacy code working during transition via bridge adapters
- Add PHPUnit tests for migrated modules before removing legacy code

## ZF2 → ZF3/Laminas Migration
- Replace `Zend\` namespace with `Laminas\` (use laminas-migration tool)
- Update `ServiceLocatorAwareInterface` usage to constructor injection via factories
- Remove `getServiceLocator()` calls from controllers
- Update `composer.json` dependencies from `zendframework/*` to `laminas/*`
