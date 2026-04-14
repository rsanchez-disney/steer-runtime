# Test Automation Patterns

## Page Object Model (POM)

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = '#email';
    this.passwordInput = '#password';
    this.loginButton = '#login-btn';
    this.errorMessage = '.error-message';
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessage() {
    return await this.page.textContent(this.errorMessage);
  }
}
```

## Data-Driven Testing

```javascript
const testData = [
  { email: 'valid@test.com', password: 'Pass123!', expected: 'success' },
  { email: 'invalid', password: 'Pass123!', expected: 'error' },
  { email: 'valid@test.com', password: 'short', expected: 'error' }
];

testData.forEach(data => {
  test(`Login with ${data.email}`, async () => {
    await loginPage.login(data.email, data.password);
    // Assert based on data.expected
  });
});
```

## Test Fixtures

```javascript
// fixtures/testData.js
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  },
  user: {
    email: 'user@test.com',
    password: 'User123!',
    role: 'user'
  }
};

// Usage
import { testUsers } from './fixtures/testData';
await loginPage.login(testUsers.admin.email, testUsers.admin.password);
```

## API Test Pattern

```javascript
describe('User API', () => {
  let userId;

  beforeAll(async () => {
    // Setup: Create test user
    const response = await api.post('/users', testUser);
    userId = response.body.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test user
    await api.delete(`/users/${userId}`);
  });

  test('should get user by id', async () => {
    const response = await api.get(`/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });
});
```

## Retry Pattern for Flaky Tests

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```
