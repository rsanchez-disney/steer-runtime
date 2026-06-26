# Postman to Bruno - Conversion Reference

This document is the deterministic mapping table for converting Postman collections (v2.0/v2.1) into Bruno collections. The agent MUST follow these rules exactly - no invention.

---

## Structure Mapping

| Postman | Bruno |
|---------|-------|
| collection.json | Root folder + bruno.json |
| info.name | bruno.json name field |
| Nested item[] (folders) | Filesystem subdirectories |
| item with request | .bru file |
| variable[] (collection-level) | Set via bru.setVar() or document for user |
| Separate environment JSON | environments/<name>.bru |

### bruno.json Template

`json
{
  "version": "1",
  "name": "<collection_name>",
  "type": "collection",
  "ignore": ["node_modules", ".git"]
}
`


---

## HTTP Methods

| Postman method | Bruno block |
|----------------|-------------|
| GET | get { } |
| POST | post { } |
| PUT | put { } |
| DELETE | delete { } |
| PATCH | patch { } |
| OPTIONS | options { } |
| HEAD | head { } |
| TRACE | trace { } |

### Method Block Structure

`ru
<method> {
  url: <url>
  body: <body_type>
  auth: <auth_type>
}
`

Body type values: json, text, xml, formUrlEncoded, multipartForm, graphql, binary, none
Auth type values: bearer, basic, apikey, oauth2, awsv4, digest, none

---

## Auth Types

### Bearer Token
`ru
auth:bearer {
  token: {{t}}
}
`

### Basic Auth
`ru
auth:basic {
  username: u
  password: p
}
`

### API Key
`ru
auth:apikey {
  key: X-API-Key
  value: {{k}}
  placement: header
}
`
Note: Postman "in": "query" -> Bruno placement: queryparams

### OAuth2 Key Mapping
| Postman | Bruno |
|---------|-------|
| grant_type | grant_type |
| accessTokenUrl | access_token_url |
| authUrl | authorization_url |
| clientId | client_id |
| clientSecret | client_secret |
| callbackUrl | callback_url |
| scope | scope |

### AWS Signature V4
`ru
auth:awsv4 {
  accessKeyId: {{aws_key}}
  secretAccessKey: {{aws_secret}}
  region: us-east-1
  service: execute-api
  sessionToken: {{session}}
}
`

### Digest Auth
`ru
auth:digest {
  username: {{user}}
  password: {{pass}}
}
`

### No Auth
Postman noauth -> Bruno: auth: none in method block (no auth block needed)

### Unsupported Auth Types
oauth1, ntlm, hawk, edgegrid -> Comment with // UNSUPPORTED: <type> auth.

---

## Body Types

### Body type detection from raw mode:
| options.raw.language | Bruno type |
|----------------------|------------|
| json | json |
| xml | xml |
| text/javascript/html/missing | text |

### Form URL-Encoded
`ru
body:form-urlencoded {
  grant_type: password
  ~disabled_field: value
}
`

### Multipart Form
`ru
body:multipart-form {
  name: John
  avatar: @file(/path/to/file.png)
  ~disabled_field: x
}
`
Rules: type file -> key: @file(src), disabled: true -> prefix ~

### GraphQL
`ru
body:graphql {
  query { users { id name } }
}

body:graphql:vars {
  {
    "limit": 10
  }
}
`

### Binary
Bruno: body: binary + body:binary { file: @file(path) }

### No Body
Absent/null -> body: none in method block, no body block.

---

## Script Translation (pm.* -> bru.*)

### Variables
| Postman | Bruno |
|---------|-------|
| pm.environment.get(k) | bru.getEnvVar(k) |
| pm.environment.set(k, v) | bru.setEnvVar(k, v) |
| pm.variables.get(k) | bru.getVar(k) |
| pm.variables.set(k, v) | bru.setVar(k, v) |
| pm.collectionVariables.get(k) | bru.getVar(k) |
| pm.collectionVariables.set(k, v) | bru.setVar(k, v) |
| pm.globals.get(k) | bru.getVar(k) |
| pm.globals.set(k, v) | bru.setVar(k, v) |

### Response
| Postman | Bruno |
|---------|-------|
| pm.response.json() | res.body |
| pm.response.code | res.status |
| pm.response.responseTime | res.responseTime |
| pm.response.headers.get(k) | res.headers['k'] (lowercase key) |
| pm.response.to.have.status(200) | expect(res.status).to.equal(200) |
| pm.response.to.have.header('X-Key') | expect(res.headers['x-key']).to.not.be.undefined |
| pm.response.text() | JSON.stringify(res.body) |

### Testing
| Postman | Bruno |
|---------|-------|
| pm.test('name', fn) | test('name', fn) |
| pm.expect(val) | expect(val) |

### Unsupported APIs
| API | Action |
|-----|--------|
| pm.sendRequest() | Comment out + add fix guidance |
| pm.execution.setNextRequest() | Comment out + suggest seq ordering |
| pm.cookies.get/set() | Comment out + note auto-handling |
| pm.visualizer.set() | Remove |
| pm.iterationData.get() | Comment out |

### Script Location
| Postman | Bruno |
|---------|-------|
| event[listen=prerequest] | script:pre-request { } |
| event[listen=test] | script:post-response { } |

---

## Bruno Runtime Notes

- res.body is ALWAYS a parsed JSON object. Never call JSON.parse(res.body). Already parsed.
- res.status is a number (200, 404).
- res.headers is an object with lowercase keys. Use: expect(res.headers['x-conversation-id']).to.not.be.undefined
- Do NOT use res.getHeader(). Use res.headers['header-name-lowercase'] instead.
- bru.setVar()/bru.getVar() pass data between requests via {{variable_name}} interpolation.
- Scripts run in QuickJS sandbox. No require(), no Node.js APIs.

---

## Edge Cases

### Auth Inheritance
Bruno has NO auth inheritance. Resolve per-request:
1. Request has own auth -> use it
2. Else parent folder auth -> apply to request
3. Else collection auth -> apply to request
4. If noauth -> auth: none

### Collection/Folder-Level Scripts
Bruno has NO collection-level scripts. Prepend collection scripts to every request. For pm.sendRequest(), decompose into separate .bru files with seq ordering.

### Disabled Items
Headers, params, form fields with disabled: true -> prefix key with ~

### Query Params
`ru
params:query {
  page: 1
  limit: 20
  ~debug: true
}
`

### Request Description
request.description -> docs { } block.

### Filename Sanitization
- Replace special chars with -
- Replace spaces with -
- Append .bru
- Duplicates: append sequence number

---

## Unsupported Feature Guidance

### pm.sendRequest()
MANUAL FIX NEEDED: pm.sendRequest() is not supported in Bruno.
FIX: Create a separate .bru request file with the HTTP call, set seq ordering so it runs before this request, and use bru.setVar() to pass data between them.

### pm.execution.setNextRequest()
MANUAL FIX NEEDED: Not supported. Use seq field in meta {} to control execution order.

### pm.cookies
NOTE: pm.cookies API is not available in Bruno scripts. Bruno handles cookies automatically. Extract from res.headers['set-cookie'] if needed.

---

## Curl to Bruno Mapping

| curl flag | Bruno equivalent |
|-----------|-----------------|
| -X POST (or --request) | post { } |
| -H "Content-Type: application/json" | headers { Content-Type: application/json } |
| -H "Authorization: Bearer tok" | auth:bearer { token: tok } |
| -u user:pass (or --user) | auth:basic { username: user password: pass } |
| -d '{"key":"val"}' (with json content-type) | body: json + body:json { content } |
| -d "key=val&k2=v2" (with form content-type) | body: formUrlEncoded + body:form-urlencoded { key: val } |
| --data-raw same as -d | Same as above |
| -k or --insecure | No equivalent (Bruno ignores SSL by default in dev) |
| URL (positional arg) | url: field in method block |

### Example

curl input:
`
curl -X POST https://api.example.com/login -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"123"}'
`

Bruno output:
`ru
meta {
  name: login
  type: http
  seq: 1
}

post {
  url: https://api.example.com/login
  body: json
  auth: none
}

body:json {
  {
    "email": "a@b.com",
    "password": "123"
  }
}
`
