# Jest Configuration for CI/CD Pipeline

This guide explains how to optimize your Jest configuration for the GitHub Actions CI/CD pipeline to generate better test and coverage reports.

## Current Setup

Your project uses `react-scripts` which includes Jest by default. The workflow runs:

```bash
CI=true yarn test --coverage --watchAll=false --json --jsonOutputFile=test-reports/test-results.json
```

## Recommended Jest Configuration

### Option 1: Use Default react-scripts Setup (Current)

`react-scripts` provides a good default Jest configuration that works well with the workflow. The current setup is sufficient for most projects.

### Option 2: Create Custom Jest Configuration (Advanced)

For more control over coverage reports and test output, create a `jest.config.js` file:

```javascript
// jest.config.js
module.exports = {
  // Set up test environment (default is jsdom for React)
  testEnvironment: 'jsdom',

  // Coverage collection settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.{js,jsx,ts,tsx}',
    '!src/reportWebVitals.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],

  // Coverage thresholds (enforced by CI)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/components/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Summary in console
    'json',           // JSON format for parsing
    'lcov',           // LCOV format for coverage tools
    'html',           // HTML report for browsing
    'json-summary',   // Summary JSON
  ],

  // Test reporters
  reporters: [
    'default',                           // Default reporter
    ['jest-junit', {                     // JUnit XML for CI integration
      outputDirectory: './test-reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname} - {title}',
      titleTemplate: '{classname} - {title}',
      ancestorSeparator: ' › ',
      usePathAsClassName: 'true',
    }],
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Module paths for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/build/'],

  // Verbose output
  verbose: true,

  // Max workers for parallel testing
  maxWorkers: '50%',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};
```

### Option 3: Update package.json Scripts

If using custom Jest configuration, update `package.json`:

```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:ci": "CI=true react-scripts test --coverage --watchAll=false --json --jsonOutputFile=test-reports/test-results.json",
    "test:coverage": "react-scripts test --coverage --watchAll=false"
  }
}
```

Then update workflow to use:

```yaml
- name: 🧪 Run tests with coverage
  run: yarn test:ci
```

## Coverage Report Interpretation

### HTML Coverage Report

The generated `coverage/index.html` shows:

- **Statements**: % of statements executed by tests
- **Branches**: % of conditional branches covered
- **Functions**: % of functions called by tests
- **Lines**: % of lines executed by tests

### LCOV Report

The `coverage/lcov.info` file can be used with:

- Code coverage tools (Codecov, Coveralls)
- IDE coverage highlighting
- Coverage badges in README

### Coverage Badges

Add to your README:

```markdown
![Coverage](https://img.shields.io/badge/coverage-80%25-green)

Or use a coverage service:
[![codecov](https://codecov.io/gh/jhderojasUVa/randomfuckwork/branch/main/graph/badge.svg)](https://codecov.io/gh/jhderojasUVa/randomfuckwork)
```

## Setting Coverage Thresholds

The workflow should fail if coverage drops below thresholds. Add to `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,    // 70% of branches must be covered
    functions: 70,   // 70% of functions must be covered
    lines: 70,       // 70% of lines must be covered
    statements: 70,  // 70% of statements must be covered
  },
},
```

The workflow will fail if thresholds aren't met, preventing merging of PRs with insufficient coverage.

## Test Organization

Organize tests in one of these patterns:

### Pattern 1: Colocated Tests

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
```

### Pattern 2: Separate __tests__ Directory

```
src/
├── components/
│   ├── __tests__/
│   │   └── Button.test.tsx
│   └── Button.tsx
├── utils/
│   ├── __tests__/
│   │   └── helpers.test.ts
│   └── helpers.ts
```

## CI-Specific Configuration

For CI environments, add to `jest.config.js`:

```javascript
const isCI = process.env.CI === 'true';

module.exports = {
  // ... other config

  // Disable coverage for faster CI in some cases (optional)
  collect_coverage: isCI,

  // Run tests serially in CI for consistency
  maxWorkers: isCI ? 1 : '50%',

  // Verbose output in CI
  verbose: isCI,

  // Bail on first failure in CI (optional)
  bail: isCI ? 1 : 0,

  // Timeout for tests (increase for slow CI environments)
  testTimeout: isCI ? 30000 : 5000,
};
```

## Debugging Failed Tests

### View Full Test Output

The workflow logs show test failures, but for more details:

1. Download the `test-results` artifact from GitHub Actions
2. View `test-results.json` for detailed failure information
3. View `junit.xml` for structured failure data

### Run Tests Locally

```bash
# Run tests in watch mode
yarn test

# Run specific test file
yarn test Button.test.tsx

# Run with coverage
yarn test --coverage

# Debug with Node Inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance Optimization

### Speed Up Tests in CI

```javascript
module.exports = {
  // Use single worker for consistent CI results
  maxWorkers: 1,

  // Cache transformation results
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.jest-cache',

  // Exclude large directories
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],

  // Use faster transformers
  testMatch: [
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
};
```

### Parallel Execution

```javascript
module.exports = {
  // Use all available cores (default)
  maxWorkers: '50%',

  // Or specify exact number
  maxWorkers: 4,
};
```

## Integration with GitHub Actions

The workflow automatically:

1. ✅ Runs tests in headless mode (`CI=true`)
2. ✅ Generates JSON reports for machine parsing
3. ✅ Generates LCOV reports for coverage tools
4. ✅ Generates HTML reports for browsing
5. ✅ Uploads artifacts to GitHub
6. ✅ Publishes to GCP buckets

No additional configuration needed unless you want to customize behavior.

## Recommended Test Structure

### Example Component Test

```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Troubleshooting

### Tests Pass Locally but Fail in CI

**Causes:**
- Environment differences (Node version, OS)
- Timing issues (async operations)
- Missing environment variables
- File path differences (Windows vs Linux)

**Solutions:**
- Use `CI=true` locally: `CI=true yarn test`
- Set same Node version locally and in workflow
- Add appropriate timeouts for async operations
- Use path-join utilities for file paths

### Coverage Report Not Generated

**Cause:** Tests may have failed

**Solution:**
```bash
# Check test output
yarn test --coverage 2>&1 | tail -50

# Verify coverage directory exists
ls -la coverage/
```

### Slow Tests in CI

**Solution:**
```javascript
// jest.config.js
module.exports = {
  maxWorkers: 1,  // Use single worker
  testTimeout: 30000,  // Increase timeout
};
```

## Best Practices

1. ✅ **Write Testable Code**: Separate concerns, use dependency injection
2. ✅ **Test Behavior**: Focus on what component does, not implementation
3. ✅ **Use Testing Library**: Preferred over enzyme for React testing
4. ✅ **Mock External Dependencies**: APIs, timers, browser APIs
5. ✅ **Maintain Coverage**: Aim for 80%+ coverage
6. ✅ **Run Tests Before Pushing**: Use git hooks (husky in your project)
7. ✅ **Keep Tests Fast**: Optimize slow tests, use mocks wisely
8. ✅ **Review Failures**: All workflow failures should be investigated

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-junit Reporter](https://github.com/jest-community/jest-junit)
- [react-scripts Testing](https://create-react-app.dev/docs/running-tests/)
