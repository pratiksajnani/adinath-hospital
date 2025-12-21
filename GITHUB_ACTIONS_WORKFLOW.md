# GitHub Actions Workflow Setup

To enable CI/CD badges and automated testing, add this workflow file via GitHub's web interface:

## Steps

1. Go to https://github.com/pratiksajnani/adinath-hospital/actions
2. Click "New workflow" → "set up a workflow yourself"
3. Name it `test.yml`
4. Paste the content below
5. Click "Commit changes"

---

## Workflow Content (Copy this)

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  # Unit Tests
  unit-tests:
    runs-on: ubuntu-latest
    name: 🧪 Unit Tests
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit

  # E2E Tests
  e2e-tests:
    runs-on: ubuntu-latest
    name: 🎭 E2E Tests
    needs: unit-tests
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npx playwright test --project=chromium
        env:
          TEST_URL: https://adinathhealth.com

  # Link Checker
  link-check:
    runs-on: ubuntu-latest
    name: 🔗 Link Check
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Check all links
        run: node tests/link-checker.js
        env:
          TEST_URL: https://adinathhealth.com

  # Summary
  test-summary:
    runs-on: ubuntu-latest
    name: 📊 Summary
    needs: [unit-tests, e2e-tests, link-check]
    if: always()
    
    steps:
      - name: Test Results Summary
        run: |
          echo "## 🧪 Test Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Test Suite | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|------------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| 🧪 Unit Tests | ${{ needs.unit-tests.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| 🎭 E2E Tests | ${{ needs.e2e-tests.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| 🔗 Link Check | ${{ needs.link-check.result == 'success' && '✅' || '❌' }} |" >> $GITHUB_STEP_SUMMARY
```

---

## After Adding

The badges in README.md will automatically show:

- [![Tests](https://github.com/pratiksajnani/adinath-hospital/actions/workflows/test.yml/badge.svg)](https://github.com/pratiksajnani/adinath-hospital/actions/workflows/test.yml)

Tests will run on every push and show results in the Actions tab.

