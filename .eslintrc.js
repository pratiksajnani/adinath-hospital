/**
 * ESLint Configuration
 * Enforces code quality and security best practices
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended-legacy',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['security'],
  globals: {
    // Browser globals
    CONFIG: 'readonly',
    HMS: 'readonly',
    API: 'readonly',
    SMS: 'readonly',
    i18n: 'readonly',
    QRCode: 'readonly',
    Razorpay: 'readonly',
    // Supabase
    SupabaseAuth: 'readonly',
    SupabaseDB: 'readonly',
  },
  rules: {
    // ============================================
    // ERROR PREVENTION
    // ============================================
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // ============================================
    // BEST PRACTICES
    // ============================================
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],
    'default-case': 'warn',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-multi-spaces': 'error',
    'no-return-await': 'error',
    'require-await': 'warn',

    // ============================================
    // SECURITY (via plugin)
    // ============================================
    'security/detect-object-injection': 'off', // Too many false positives
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',

    // ============================================
    // CODE STYLE (handled by Prettier)
    // ============================================
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off',
  },
  overrides: [
    {
      // Test files
      files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
      rules: {
        'no-console': 'off',
        'security/detect-object-injection': 'off',
      },
    },
    {
      // Config files
      files: ['*.config.js', '.eslintrc.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

