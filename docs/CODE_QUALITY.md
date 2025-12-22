# Code Quality Standards & Metrics

## Quick Start

```bash
# Run full quality report
npm run full-report

# Just the quality score
npm run quality:report

# Generate badges for README
npm run badges
```

## Quality Metrics

### Current Scores

| Metric           | Value   | Status    |
| ---------------- | ------- | --------- |
| Overall Score    | 90/100  | Grade A   |
| Test Coverage    | 87%     | Excellent |
| Code Duplication | 0%      | Clean     |
| ESLint Errors    | 0       | Clean     |
| Tests Passing    | 429/429 | All Pass  |

## Available Tools

### 1. Linting (ESLint)

```bash
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
npm run lint:report    # Generate JSON report
```

**Rules Include:**

- Code style enforcement
- Security vulnerability detection
- Complexity metrics (max cyclomatic complexity: 15)
- Max function length (100 lines)
- Max file length (500 lines)
- Max nesting depth (4 levels)
- Max parameters (5)

### 2. Code Formatting (Prettier)

```bash
npm run format         # Format all files
npm run format:check   # Check without changing
```

**Settings:**

- 4-space indentation
- Single quotes
- Trailing commas (ES5)
- 100 character line width

### 3. Unit Testing (Jest)

```bash
npm run test:unit      # Run unit tests
npm run coverage       # Run with coverage
```

**Coverage Thresholds:**

- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

### 4. E2E Testing (Playwright)

```bash
npm run test:e2e       # Run E2E tests
npm run test:headed    # Run with browser visible
npm run test:ui        # Interactive UI mode
npm run test:a11y      # Accessibility tests only
```

### 5. Code Duplication (jscpd)

```bash
npm run duplicates        # Full report with HTML
npm run duplicates:check  # Quick check (10% threshold)
```

**Settings:**

- Minimum 5 lines for clone detection
- Minimum 50 tokens
- Reports: HTML, JSON, Console

### 6. Complexity Analysis

```bash
npm run complexity     # Show complexity issues
```

**Metrics Tracked:**

- Cyclomatic complexity (max: 15)
- Cognitive complexity
- Nesting depth (max: 4)
- Function length (max: 100 lines)
- File length (max: 500 lines)

### 7. Security Audit

```bash
npm run audit          # npm audit (moderate+)
npm run security:scan  # Check for hardcoded secrets
```

### 8. Quality Report

```bash
npm run quality:report  # Comprehensive report
npm run full-report     # Report + badges
npm run metrics         # Alias for quality:report
```

**Report Includes:**

- Lines of code analysis
- ESLint summary
- Test coverage
- Code duplication percentage
- Security vulnerabilities
- Formatting status
- Test results
- Overall score (0-100)

## Pre-commit Hooks

Husky runs these checks before each commit:

1. **lint-staged**: ESLint + Prettier on staged files
2. **Secret detection**: Scans for hardcoded passwords
3. **commitlint**: Validates commit message format

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:** feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert

**Scopes:** auth, booking, portal, store, docs, tests, config, ui, api, i18n, a11y, security, deps

## CI/CD Integration

```bash
npm run ci         # Run in CI: lint + format + tests
npm run validate   # Quick validation check
npm run predeploy  # Pre-deployment checks
```

## Quality Score Calculation

| Factor                   | Weight                      |
| ------------------------ | --------------------------- |
| ESLint errors            | -5 per error (max -30)      |
| Low test coverage        | -1 per % below 80 (max -20) |
| Code duplication         | -1 per % above 5 (max -15)  |
| Critical vulnerabilities | -20                         |
| High vulnerabilities     | -10                         |
| Failed tests             | -5 per failure (max -25)    |
| Unformatted files        | -1 per file (max -5)        |

**Grades:**

- A: 90-100
- B: 80-89
- C: 70-79
- D: 60-69
- F: Below 60

## File Structure

```
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── .editorconfig       # Editor settings
├── .jscpd.json         # Duplication detection config
├── commitlint.config.js # Commit message rules
├── jest.config.js      # Test configuration
├── playwright.config.js # E2E test configuration
├── .husky/
│   ├── pre-commit      # Pre-commit hook
│   └── commit-msg      # Commit message hook
├── scripts/
│   ├── quality-report.js # Quality report generator
│   └── generate-badges.js # Badge generator
└── test-results/
    ├── quality-report.json
    ├── eslint-report.json
    ├── coverage/
    └── jscpd/
```

## Improving Your Score

1. **Fix ESLint errors**: `npm run lint:fix`
2. **Add more tests**: Focus on uncovered functions
3. **Fix security issues**: `npm audit fix`
4. **Format code**: `npm run format`
5. **Reduce duplication**: Refactor repeated code

## Continuous Improvement

- Run `npm run quality:report` regularly
- Review the generated reports in `test-results/`
- Update coverage thresholds as coverage improves
- Add new tests for edge cases
