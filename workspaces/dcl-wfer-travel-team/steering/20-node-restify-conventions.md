---
inclusion: fileMatch
fileMatchPattern: ["**/*.js", "**/*.spec.js", "package.json", "Gruntfile.js"]
---

# Node.js conventions — DCL Travel WebAPI

## Architecture

This project uses **Restify** (NOT Express, NOT NestJS). Do not generate Express middleware patterns or NestJS decorators.

### Resource module pattern

Each domain has a resource folder with:

```text
src/api-server/resources/{domain}/
├── {domain}.routes.js      — route definitions
├── {domain}.action.js      — handler logic
├── {domain}.routes.spec.js — route tests
└── {domain}.actions.spec.js — action tests
```

### Route definition

```javascript
// {domain}.routes.js
module.exports = function(server, config) {
    server.get('/api/travel-requests', actions.getAll);
    server.get('/api/travel-requests/:id', actions.getById);
    server.post('/api/travel-requests', actions.create);
};
```

### Action handler

```javascript
// {domain}.action.js
const requester = require('../core/requester');

module.exports = {
    async getAll(req, res, next) {
        try {
            const result = await requester.get(`${config.apiBaseUrl}/travel-details`, {
                headers: req.headers
            });
            res.send(200, result);
            next();
        } catch (err) {
            next(err);
        }
    }
};
```

## Feature toggles

Use `wdpr-node-feature-decider`:

```javascript
const featureDecider = require('feature-decider');

if (featureDecider.isEnabled('FLOWABLE_PARALLEL_DISPATCH')) {
    // new behavior
}
```

Toggle config: `src/feature-toggles-config/wdpr-api-features.json`

## Authentication

- Keycloak OIDC via custom plugin (`src/keycloak-plugin/`)
- Auth interceptor middleware applied to all routes
- Never bypass auth — use stubs for local dev

## Testing

- **Mocha** + **Chai** + **Sinon** + **Mockery**
- Co-located `.spec.js` files next to source
- Setup: `test/setup.js`

```javascript
// Test pattern
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('TravelRequests Actions', () => {
    let sandbox;
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); });

    it('should return travel requests', async () => {
        // arrange
        sandbox.stub(requester, 'get').resolves(mockData);
        // act
        await actions.getAll(req, res, next);
        // assert
        expect(res.send.calledWith(200, mockData)).to.be.true;
    });
});
```

## Build

- **Grunt** for build tasks
- `npm test` — runs Mocha
- `npm run build` — clean + copy to dist
- `npm start` — `node src/api-server/server.js`

## Configuration

- Per-environment: `src/api-server/core/config/{env}.js`
- Properties: `src/api-server/core/properties/{env}.json`
- Stubs: `src/api-server/core/stubs/*.json` (55 mock files for local dev)

## Do not

- Do not use Express patterns (`app.use()`, `express.Router()`)
- Do not use NestJS decorators (`@Controller`, `@Injectable`)
- Do not use TypeScript in this repo (plain JavaScript, CommonJS)
- Do not add dependencies without checking `package.json` for existing alternatives
