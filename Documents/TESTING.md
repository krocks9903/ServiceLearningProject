# Testing Strategy Documentation

This document outlines the comprehensive testing strategy for the Service Learning Management System, covering all five levels of testing as taught in software engineering principles.

## Testing Levels Overview

Our testing strategy implements five distinct levels of testing:

1. **Unit Testing** - Component-level testing
2. **Integration Testing** - Component interaction testing
3. **Product Testing** - End-to-end application testing
4. **Acceptance Testing** - Business requirement validation
5. **Regression Testing** - Automated test suite execution

## 1. Unit Testing

**Definition**: Each component is tested as soon as implemented (usually by developers)

**Purpose**: Test individual functions, components, and utilities in isolation

**Location**: `src/**/*.test.{ts,tsx}`

**Tools**: Vitest, React Testing Library

**Examples**:

- `src/utils/formatDate.test.ts` - Tests date formatting utilities
- `src/utils/validations.test.ts` - Tests validation functions
- `src/components/shared/Navbar.test.tsx` - Tests Navbar component
- `src/components/shared/DatePicker.test.tsx` - Tests DatePicker component
- `src/hooks/useAuth.test.tsx` - Tests authentication hook

**Running Unit Tests**:

```bash
npm run test:unit
```

**Key Characteristics**:

- Fast execution (< 1 second per test)
- Isolated from external dependencies
- Uses mocks for external services
- Tests individual functions and components
- High code coverage target: 80%+

## 2. Integration Testing

**Definition**: At end of each iteration, completed components are combined & tested

**Purpose**: Test how multiple components work together, including API/service integration

**Location**: `src/**/*.integration.test.{ts,tsx}`

**Tools**: Vitest, React Testing Library

**Examples**:

- `src/pages/LoginPage.integration.test.tsx` - Tests login flow with auth integration
- `src/pages/DashboardPage.integration.test.tsx` - Tests dashboard data loading
- `src/components/scheduling/EventRegistrationModal.integration.test.tsx` - Tests modal with form submission

**Running Integration Tests**:

```bash
npm run test:integration
```

**Key Characteristics**:

- Tests component interactions
- Includes API/service integration
- Tests data flow between components
- Verifies state management
- Tests error handling across components

## 3. Product Testing (End-to-End)

**Definition**: When product appears to be complete, tested as a whole

**Purpose**: Test complete user workflows across the entire application

**Location**: `tests/e2e/*.spec.ts`

**Tools**: Playwright

**Examples**:

- `tests/e2e/user-journey.spec.ts` - Complete user registration → login → event signup flow
- `tests/e2e/admin-workflow.spec.ts` - Admin login → manage volunteers → create shifts
- `tests/e2e/kiosk-checkin.spec.ts` - Kiosk check-in workflow

**Running E2E Tests**:

```bash
npm run test:e2e
```

**Key Characteristics**:

- Tests complete user workflows
- Runs in real browser environment
- Tests across multiple pages
- Verifies navigation and routing
- Tests user interactions end-to-end
- Cross-browser testing capability

## 4. Acceptance Testing

**Definition**: Once completed product has been installed on client's computer, the client/end user or their rep tests it

**Purpose**: Test that the application meets business requirements and user stories

**Location**: `tests/acceptance/*.spec.ts`

**Tools**: Playwright

**Examples**:

- `tests/acceptance/volunteer-requirements.spec.ts` - Validates volunteer can sign up for events
- `tests/acceptance/admin-requirements.spec.ts` - Validates admin can manage shifts and volunteers
- `tests/acceptance/reporting-requirements.spec.ts` - Validates reports display correctly

**Running Acceptance Tests**:

```bash
npm run test:acceptance
```

**Key Characteristics**:

- Validates business requirements
- Tests user stories
- Verifies feature completeness
- Tests from user perspective
- Validates acceptance criteria

## 5. Regression Testing

**Definition**: When a previously validated system is modified: all previous tests have to be re-run to ensure that changes to the system have not introduced new errors

**Purpose**: Ensure that changes don't break existing functionality

**Location**: All test files, run via CI/CD

**Running Regression Tests**:

```bash
npm run test:regression
# or
npm run test:all
```

**Key Characteristics**:

- Runs all test suites
- Automated execution
- Integrated with CI/CD pipeline
- Runs on every code change
- Ensures no regressions

## Test Execution

### Running All Tests

```bash
# Run all test suites
npm run test:all

# Run regression suite (same as test:all)
npm run test:regression
```

### Running Individual Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Acceptance tests only
npm run test:acceptance
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory with HTML, JSON, and LCOV formats.

### Watch Mode

```bash
# Run tests in watch mode (unit and integration)
npm run test:watch

# Run with UI
npm run test:ui
```

## Test Structure

### Unit Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { functionToTest } from './module'

describe('Module Name', () => {
  describe('Function Name', () => {
    it('should do something', () => {
      const result = functionToTest(input)
      expect(result).toBe(expected)
    })
  })
})
```

### Integration Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import Component from './Component'

describe('Component Integration', () => {
  it('should integrate with services', async () => {
    render(<Component />)
    // Test component interactions
  })
})
```

### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should complete workflow', async ({ page }) => {
    await page.goto('/path')
    // Test complete user flow
  })
})
```

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline:

1. **Quality Checks** - Linting, type checking, formatting
2. **Unit Tests** - Fast feedback on component changes
3. **Integration Tests** - Verify component interactions
4. **E2E Tests** - Verify complete workflows
5. **Acceptance Tests** - Validate requirements

The pipeline runs on:

- Every push to `main` or `develop` branches
- Every pull request
- Before deployment

## Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All critical user flows
- **E2E Tests**: All major user journeys
- **Acceptance Tests**: All business requirements

## Best Practices

1. **Write tests as you develop** - Don't wait until the end
2. **Test behavior, not implementation** - Focus on what, not how
3. **Keep tests independent** - Each test should run in isolation
4. **Use descriptive test names** - Clear what is being tested
5. **Mock external dependencies** - Keep tests fast and reliable
6. **Test error cases** - Don't just test happy paths
7. **Maintain test code** - Keep tests clean and up-to-date

## Troubleshooting

### Tests failing locally

1. Ensure dependencies are installed: `npm ci`
2. Check Node.js version: `node --version` (should be >= 20.0.0)
3. Clear cache: `npm run test -- --clearCache`

### E2E tests failing

1. Install Playwright browsers: `npx playwright install`
2. Ensure dev server is running: `npm run dev`
3. Check browser compatibility

### Coverage not generating

1. Ensure `@vitest/coverage-v8` is installed
2. Run: `npm run test:coverage`
3. Check `coverage/` directory

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
