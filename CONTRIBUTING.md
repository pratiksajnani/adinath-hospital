# Contributing to Adinath Hospital

## Code Quality Standards

This project uses automated tools to maintain consistent code quality and styling.

### Quick Start

```bash
# Install dependencies
npm install

# Run quality checks
npm run quality

# Fix auto-fixable issues
npm run quality:fix
```

## Tools Used

| Tool             | Purpose            | Config File            |
| ---------------- | ------------------ | ---------------------- |
| **ESLint**       | JavaScript linting | `.eslintrc.json`       |
| **Prettier**     | Code formatting    | `.prettierrc`          |
| **EditorConfig** | Editor settings    | `.editorconfig`        |
| **Husky**        | Git hooks          | `.husky/`              |
| **lint-staged**  | Pre-commit linting | `package.json`         |
| **Jest**         | Unit testing       | `jest.config.js`       |
| **Playwright**   | E2E testing        | `playwright.config.js` |

## Coding Standards

### JavaScript

1. **Use `const` and `let`** - Never use `var`
2. **Use arrow functions** for callbacks
3. **Use template literals** instead of string concatenation
4. **Use strict equality** (`===` and `!==`)
5. **Always use curly braces** for control statements
6. **Prefer async/await** over raw Promises

### Naming Conventions

| Type        | Convention       | Example            |
| ----------- | ---------------- | ------------------ |
| Variables   | camelCase        | `patientName`      |
| Functions   | camelCase        | `getPatientById()` |
| Constants   | UPPER_SNAKE_CASE | `API_BASE_URL`     |
| Classes     | PascalCase       | `PatientManager`   |
| Files       | kebab-case       | `patient-utils.js` |
| CSS Classes | kebab-case       | `.patient-card`    |

### File Organization

```
js/
├── access-control.js  # Role-based access control
├── api.js             # API service layer
├── config.js          # Environment configuration
├── hms.js             # Hospital Management System core
├── i18n.js            # Internationalization
├── main.js            # Main entry point
├── sms.js             # SMS/WhatsApp messaging
├── supabase-client.js # Supabase client setup
└── user-status.js     # User status widget
```

### Comments & Documentation

```javascript
/**
 * Get patient by ID from the HMS database
 * @param {string} id - The patient's unique identifier
 * @returns {Object|null} The patient object or null if not found
 * @example
 * const patient = HMS.patients.get('P001');
 */
function getPatientById(id) {
    // Implementation
}
```

### CSS Standards

1. Use CSS custom properties (variables) for colors
2. Use BEM-like naming: `.block__element--modifier`
3. Mobile-first responsive design
4. Group related properties together

```css
/* ✅ Good */
.card {
    /* Layout */
    display: flex;
    flex-direction: column;

    /* Spacing */
    padding: 1rem;
    margin-bottom: 1rem;

    /* Visual */
    background: var(--white);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
}
```

## Pre-commit Hooks

When you commit, the following checks run automatically:

1. **ESLint** - Fixes and checks JavaScript
2. **Prettier** - Formats all staged files
3. **Unit Tests** - Runs affected tests

If any check fails, the commit is blocked until issues are fixed.

## Running Tests

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests with coverage
npm run coverage

# Specific test file
npm test -- --testPathPattern="hms.test.js"
```

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows the style guide
- [ ] All tests pass (`npm run quality`)
- [ ] New features have tests
- [ ] No console.log statements (use console.warn/error if needed)
- [ ] JSDoc comments for public functions
- [ ] No hardcoded values (use config.js)
- [ ] Accessibility considerations for UI changes
- [ ] Responsive design for new components

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```
feat(booking): add appointment reminder SMS

fix(auth): handle expired session gracefully

docs(readme): update installation instructions

test(hms): add coverage for patient management
```

## Getting Help

- Check existing issues on GitHub
- Review the `docs/` folder for guides
- Ask in team chat for quick questions
