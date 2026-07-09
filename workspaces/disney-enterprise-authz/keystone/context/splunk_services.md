# Splunk services — Keystone

## Index

| Index        | Scope        |
|--------------|:------------:|
| gis_keystone | All services |

## Splunk URLs

| Environment | URL                                                          |
|-------------|--------------------------------------------------------------|
| dev, perf   | https://search.qa.splunk.disney.com/en-US/app/wp-iam/search  |
| stg, prod   | https://search.splunk.disney.com/en-US/app/wp-iam/search     |

## Usage

When querying Splunk for Keystone services:

- Use `index=gis_keystone` as the base filter
- Use the QA Splunk URL for dev and perf environments
- Use the production Splunk URL for stg and prod environments
