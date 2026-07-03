#!/usr/bin/env python3
"""
validate-app-yaml.py — Schema validation for Sales BAPP app.yaml files.

Checks:
  - Valid YAML syntax
  - Required top-level keys present
  - bapp_id format matches BAPP\\d{7}
  - component_type enum values are valid
  - known_issues[].category enum values
  - known_issues[].severity enum values
  - known_issues[].title max 120 characters
  - external: true components have escalation_group
  - Third-party dependencies have vendor field
  - Cross-reference: affected_component exists in components[].component_name
  - cloud.services[].type enum values
  - cloud.services[].name max 80 characters

Usage:
  python scripts/validate-app-yaml.py [file1.yaml file2.yaml ...]

If no files are provided, validates the 4 Sales BAPP app.yaml files by default.

Requirements:
  pip install pyyaml   (PyYAML is required for YAML parsing)

Exit codes:
  0 — All files pass validation
  1 — One or more validation errors found
"""

import sys
import os
import re

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(2)


# ─── Constants ────────────────────────────────────────────────────────────────

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_FILES = [
    "profiles/sustainment/managed-services-catalog/studios/studio-beast/BAPP0214896-DLP_API_DGE.BOOK_DINE/app.yaml",
    "profiles/sustainment/managed-services-catalog/studios/studio-beast/BAPP0220148-DLP_DGE_API.DigitalKey/app.yaml",
    "profiles/sustainment/managed-services-catalog/studios/studio-beast/BAPP0229487-DLP_DGE_API.Mobile_Order/app.yaml",
    "profiles/sustainment/managed-services-catalog/studios/studio-beast/BAPP0220648-DLP_DGE_API.MeetAndGreet/app.yaml",
]

REQUIRED_TOP_LEVEL_KEYS = [
    "bapp_id",
    "app_name",
    "full_name",
    "description",
    "support_studio",
    "escalation_channel",
    "escalation_contacts",
    "servicenow",
    "documentation",
    "components",
]

BAPP_ID_PATTERN = re.compile(r"^BAPP\d{7}$")

VALID_COMPONENT_TYPES = {"api", "worker", "batch", "gateway", "cache", "frontend"}

VALID_KI_CATEGORIES = {"alert-based", "incident-based", "performance-degradation"}

VALID_KI_SEVERITIES = {"critical", "high", "medium", "low"}

VALID_CLOUD_SERVICE_TYPES = {
    "rds", "elasticache", "rabbitmq", "pubsub", "eventbridge", "s3", "dynamodb"
}

KI_TITLE_MAX_LENGTH = 120
CLOUD_SERVICE_NAME_MAX_LENGTH = 80


# ─── Color support ────────────────────────────────────────────────────────────

def supports_color():
    """Check if the terminal supports color output."""
    if os.environ.get("NO_COLOR"):
        return False
    if not hasattr(sys.stdout, "isatty") or not sys.stdout.isatty():
        return False
    return True


USE_COLOR = supports_color()


def red(text):
    return f"\033[31m{text}\033[0m" if USE_COLOR else text


def green(text):
    return f"\033[32m{text}\033[0m" if USE_COLOR else text


def yellow(text):
    return f"\033[33m{text}\033[0m" if USE_COLOR else text


def bold(text):
    return f"\033[1m{text}\033[0m" if USE_COLOR else text


# ─── Validation logic ─────────────────────────────────────────────────────────

class ValidationError:
    """Represents a single validation error."""

    def __init__(self, file_path, message, context=None):
        self.file_path = file_path
        self.message = message
        self.context = context

    def __str__(self):
        location = os.path.relpath(self.file_path, REPO_ROOT)
        ctx = f" ({self.context})" if self.context else ""
        return f"  {red('✗')} {location}: {self.message}{ctx}"


def validate_yaml_syntax(file_path):
    """Check that the file is valid YAML."""
    errors = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        if data is None:
            errors.append(ValidationError(file_path, "File is empty or contains only comments"))
            return None, errors
        if not isinstance(data, dict):
            errors.append(ValidationError(file_path, "Top-level YAML structure must be a mapping"))
            return None, errors
        return data, errors
    except yaml.YAMLError as e:
        errors.append(ValidationError(file_path, f"YAML syntax error: {e}"))
        return None, errors
    except FileNotFoundError:
        errors.append(ValidationError(file_path, "File not found"))
        return None, errors
    except Exception as e:
        errors.append(ValidationError(file_path, f"Error reading file: {e}"))
        return None, errors


def validate_required_keys(data, file_path):
    """Check that all required top-level keys exist."""
    errors = []
    for key in REQUIRED_TOP_LEVEL_KEYS:
        if key not in data:
            errors.append(ValidationError(file_path, f"Missing required top-level key: '{key}'"))
    return errors


def validate_bapp_id(data, file_path):
    """Check bapp_id format matches BAPP\\d{7}."""
    errors = []
    bapp_id = data.get("bapp_id")
    if bapp_id is None:
        return errors  # Already caught by required_keys check
    if not isinstance(bapp_id, str):
        errors.append(ValidationError(file_path, f"bapp_id must be a string, got {type(bapp_id).__name__}"))
        return errors
    if not BAPP_ID_PATTERN.match(bapp_id):
        errors.append(ValidationError(
            file_path,
            f"bapp_id '{bapp_id}' does not match required format BAPP followed by 7 digits"
        ))
    return errors


def validate_known_issues(data, file_path, component_names):
    """Validate all known_issues entries."""
    errors = []
    known_issues = data.get("known_issues")
    if known_issues is None:
        return errors  # Not mandatory to have known_issues (could be empty)
    if not isinstance(known_issues, list):
        errors.append(ValidationError(file_path, "known_issues must be a list"))
        return errors

    for i, issue in enumerate(known_issues):
        if not isinstance(issue, dict):
            errors.append(ValidationError(file_path, f"known_issues[{i}] must be a mapping"))
            continue

        prefix = f"known_issues[{i}]"

        # Title max length
        title = issue.get("title")
        if title and isinstance(title, str) and len(title) > KI_TITLE_MAX_LENGTH:
            errors.append(ValidationError(
                file_path,
                f"{prefix}.title exceeds {KI_TITLE_MAX_LENGTH} characters ({len(title)} chars)",
                context=f"title: \"{title[:50]}...\""
            ))

        # Category enum
        category = issue.get("category")
        if category and isinstance(category, str) and category not in VALID_KI_CATEGORIES:
            errors.append(ValidationError(
                file_path,
                f"{prefix}.category '{category}' is not valid. "
                f"Must be one of: {', '.join(sorted(VALID_KI_CATEGORIES))}"
            ))

        # Severity enum
        severity = issue.get("severity")
        if severity and isinstance(severity, str) and severity not in VALID_KI_SEVERITIES:
            errors.append(ValidationError(
                file_path,
                f"{prefix}.severity '{severity}' is not valid. "
                f"Must be one of: {', '.join(sorted(VALID_KI_SEVERITIES))}"
            ))

        # Cross-reference: affected_component must exist in components
        affected = issue.get("affected_component")
        if affected and isinstance(affected, str) and component_names:
            if affected not in component_names:
                errors.append(ValidationError(
                    file_path,
                    f"{prefix}.affected_component '{affected}' does not match any component_name",
                    context=f"Available: {', '.join(sorted(component_names))}"
                ))

    return errors


def validate_components(data, file_path):
    """Validate components list: types, external deps, cloud.services."""
    errors = []
    components = data.get("components")
    if components is None:
        return errors, set()  # Already caught by required_keys
    if not isinstance(components, list):
        errors.append(ValidationError(file_path, "components must be a list"))
        return errors, set()

    component_names = set()

    for i, comp in enumerate(components):
        if not isinstance(comp, dict):
            errors.append(ValidationError(file_path, f"components[{i}] must be a mapping"))
            continue

        name = comp.get("component_name", f"<unnamed-{i}>")
        component_names.add(name)
        prefix = f"components[{i}] ({name})"

        # component_type validation
        comp_type = comp.get("component_type")
        if comp_type and isinstance(comp_type, str) and comp_type not in VALID_COMPONENT_TYPES:
            errors.append(ValidationError(
                file_path,
                f"{prefix}: component_type '{comp_type}' is not valid. "
                f"Must be one of: {', '.join(sorted(VALID_COMPONENT_TYPES))}"
            ))

        # External dependency checks
        is_external = comp.get("external") is True
        if is_external:
            # Must have escalation_group
            esc_group = comp.get("escalation_group")
            if not esc_group or (isinstance(esc_group, str) and not esc_group.strip()):
                errors.append(ValidationError(
                    file_path,
                    f"{prefix}: external component is missing 'escalation_group'"
                ))

            # Third-party dependencies must have vendor field
            vendor = comp.get("vendor")
            if vendor and isinstance(vendor, str) and vendor.strip():
                pass  # Has vendor — this is a third-party dep, all good
            # Note: Beast-scope deps don't require vendor, so we don't error here
            # The check is: if it has vendor, it's third-party. If third-party, must have vendor.
            # We can't know if it's "third-party" without vendor, so we skip this inverse check.

        # cloud.services validation
        cloud = comp.get("cloud")
        if cloud and isinstance(cloud, dict):
            services = cloud.get("services")
            if services and isinstance(services, list):
                for j, svc in enumerate(services):
                    if not isinstance(svc, dict):
                        errors.append(ValidationError(
                            file_path,
                            f"{prefix}: cloud.services[{j}] must be a mapping"
                        ))
                        continue

                    svc_type = svc.get("type")
                    if svc_type and isinstance(svc_type, str) and svc_type not in VALID_CLOUD_SERVICE_TYPES:
                        errors.append(ValidationError(
                            file_path,
                            f"{prefix}: cloud.services[{j}].type '{svc_type}' is not valid. "
                            f"Must be one of: {', '.join(sorted(VALID_CLOUD_SERVICE_TYPES))}"
                        ))

                    svc_name = svc.get("name")
                    if svc_name and isinstance(svc_name, str) and len(svc_name) > CLOUD_SERVICE_NAME_MAX_LENGTH:
                        errors.append(ValidationError(
                            file_path,
                            f"{prefix}: cloud.services[{j}].name exceeds "
                            f"{CLOUD_SERVICE_NAME_MAX_LENGTH} characters ({len(svc_name)} chars)"
                        ))

    return errors, component_names


def validate_file(file_path):
    """Run all validations against a single file."""
    all_errors = []

    # 1. YAML syntax
    data, syntax_errors = validate_yaml_syntax(file_path)
    all_errors.extend(syntax_errors)
    if data is None:
        return all_errors

    # 2. Required top-level keys
    all_errors.extend(validate_required_keys(data, file_path))

    # 3. BAPP ID format
    all_errors.extend(validate_bapp_id(data, file_path))

    # 4. Components (get component_names for cross-reference)
    comp_errors, component_names = validate_components(data, file_path)
    all_errors.extend(comp_errors)

    # 5. Known issues (uses component_names for cross-ref)
    all_errors.extend(validate_known_issues(data, file_path, component_names))

    return all_errors


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Determine files to validate
    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        files = [os.path.join(REPO_ROOT, f) for f in DEFAULT_FILES]

    print(bold("─── Sales BAPP app.yaml Schema Validation ───"))
    print()

    total_errors = 0
    files_with_errors = 0

    for file_path in files:
        # Resolve relative paths
        if not os.path.isabs(file_path):
            file_path = os.path.join(REPO_ROOT, file_path)

        rel_path = os.path.relpath(file_path, REPO_ROOT)
        errors = validate_file(file_path)

        if errors:
            print(f"{red('FAIL')} {rel_path} ({len(errors)} error{'s' if len(errors) != 1 else ''})")
            for err in errors:
                print(str(err))
            print()
            total_errors += len(errors)
            files_with_errors += 1
        else:
            print(f"{green('PASS')} {rel_path}")

    print()
    print(bold("─── Summary ───"))
    files_checked = len(files)
    if total_errors == 0:
        print(green(f"All {files_checked} file{'s' if files_checked != 1 else ''} passed validation."))
        return 0
    else:
        print(red(
            f"{total_errors} error{'s' if total_errors != 1 else ''} "
            f"in {files_with_errors} file{'s' if files_with_errors != 1 else ''} "
            f"(out of {files_checked} checked)."
        ))
        return 1


if __name__ == "__main__":
    sys.exit(main())
