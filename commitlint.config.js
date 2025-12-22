/**
 * Commitlint Configuration
 * Enforces conventional commit messages
 * 
 * Format: type(scope): description
 * 
 * Types:
 *   feat     - New feature
 *   fix      - Bug fix
 *   docs     - Documentation
 *   style    - Formatting (no code change)
 *   refactor - Code refactoring
 *   test     - Adding tests
 *   chore    - Maintenance
 *   perf     - Performance improvement
 *   ci       - CI/CD changes
 *   security - Security fixes
 * 
 * Examples:
 *   feat(booking): add appointment reminder
 *   fix(login): resolve password validation
 *   docs: update README with setup instructions
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code refactoring
        'test',     // Tests
        'chore',    // Maintenance
        'perf',     // Performance
        'ci',       // CI/CD
        'security', // Security fix
        'deps',     // Dependency update
      ],
    ],
    'scope-enum': [
      1, // Warning only
      'always',
      [
        'booking',
        'portal',
        'auth',
        'hms',
        'i18n',
        'sms',
        'payment',
        'forms',
        'store',
        'api',
        'ui',
        'config',
        'deps',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
  },
};

