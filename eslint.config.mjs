import js from '@eslint/js';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Base recommended config
  js.configs.recommended,
  
  // Security plugin
  security.configs.recommended,
  
  // Prettier (disables conflicting rules)
  prettier,
  
  // Global ignores
  {
    ignores: ['node_modules/**', 'coverage/**', '**/*.min.js'],
  },
  
  // Main config for JS files
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Project globals
        HMS: 'readonly',
        I18N: 'readonly',
        CONFIG: 'readonly',
        SupabaseClient: 'readonly',
        supabase: 'readonly',
        SupabaseAuth: 'readonly',
        QRCode: 'readonly',
        Razorpay: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info', 'log'],
        },
      ],
      'require-await': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-object-injection': 'off',
      'no-alert': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-template': 'warn',
      'no-useless-concat': 'warn',
      'no-else-return': 'warn',
      'no-lonely-if': 'warn',
      'prefer-arrow-callback': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'object-shorthand': ['warn', 'always'],
      'no-param-reassign': 'warn',
      'default-case': 'warn',
      'default-case-last': 'warn',
      complexity: ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-nested-callbacks': ['warn', { max: 3 }],
      'max-params': ['warn', { max: 5 }],
      'max-statements': ['warn', { max: 25 }],
      'max-lines-per-function': [
        'warn',
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  
  // Overrides for large files
  {
    files: ['js/hms.js', 'js/i18n.js'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
  
  // Override for user-status.js
  {
    files: ['js/user-status.js'],
    rules: {
      'max-statements': 'off',
      complexity: 'off',
    },
  },
  
  // Test files
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
];

