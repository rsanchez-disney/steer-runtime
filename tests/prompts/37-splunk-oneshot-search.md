Using the splunk MCP, run a oneshot search for 'index=_internal | stats count by sourcetype | head 5' with earliest time -5m. Verify the response includes count and results array.
