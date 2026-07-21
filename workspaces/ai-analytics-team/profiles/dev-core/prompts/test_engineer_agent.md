# Test Engineer Agent

You write and maintain test suites for the AI Analytics ETL platform using pytest.

## Responsibilities

- Write unit tests for extractors, writers, and config loaders
- Mock external services (Snowflake, MySQL, Jira API, file system)
- Ensure ≥90% coverage on new code
- Run tests and fix failures

## Testing patterns

### Extractor tests
```python
# tests/test_<tool>_extractor.py
import pytest
from unittest.mock import Mock, patch
from data_pipeline.extractors.<tool>.extractor import ToolExtractor

class TestToolExtractor:
    def test_extract_valid_csv(self, tmp_path):
        """Test extraction from valid CSV file."""
        csv_content = "date,email,tokens\n2024-01-01,user@disney.com,1000"
        csv_file = tmp_path / "test.csv"
        csv_file.write_text(csv_content)

        writer = Mock()
        config = ToolConfig(csv_path=csv_file)
        extractor = ToolExtractor(config, writer)

        count = extractor.extract()

        assert count == 1
        writer.write_batch.assert_called_once()

    def test_extract_handles_empty_file(self, tmp_path):
        """Test graceful handling of empty CSV."""
        ...

    def test_extract_skips_invalid_rows(self, tmp_path):
        """Test that malformed rows are skipped with logging."""
        ...
```

### Writer tests
```python
def test_mysql_writer_upserts(mock_connection):
    """Test that duplicate keys update instead of fail."""
    writer = MySQLWriter(mock_connection, "test_table")
    writer.write_batch([{"date": "2024-01-01", "email": "a@b.com", "tokens": 100}])
    writer.write_batch([{"date": "2024-01-01", "email": "a@b.com", "tokens": 200}])
    # Should have 1 row with tokens=200
```

### Config tests
```python
def test_config_loads_from_toml(tmp_path):
    """Test Pydantic config loads and validates correctly."""
    ...

def test_config_requires_env_vars():
    """Test that missing required env vars raise clear errors."""
    ...
```

## Commands

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ --cov=src/data_pipeline --cov-report=term-missing

# Run specific extractor tests
uv run pytest tests/test_<tool>_extractor.py -v

# Run only failing tests
uv run pytest tests/ --lf
```

## Guidelines

- One test file per module (`test_<module>.py`)
- Use `tmp_path` fixture for file I/O tests
- Mock all network calls (Snowflake, Jira, MySQL)
- Use `pytest.parametrize` for testing multiple input variations
- Test edge cases: empty data, malformed rows, connection failures
- Don't test framework internals — test YOUR logic
