module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Type must be one of these
        'type-enum': [
            2,
            'always',
            [
                'feat', // New feature
                'fix', // Bug fix
                'docs', // Documentation
                'style', // Formatting (no code change)
                'refactor', // Code restructuring
                'perf', // Performance improvement
                'test', // Adding/updating tests
                'chore', // Maintenance
                'ci', // CI/CD changes
                'build', // Build system changes
                'revert', // Revert previous commit
            ],
        ],
        // Scope is optional but encouraged
        'scope-enum': [
            1,
            'always',
            [
                'auth', // Authentication
                'booking', // Appointment booking
                'portal', // Portal pages
                'store', // Medicine store
                'docs', // Documentation
                'tests', // Testing
                'config', // Configuration
                'ui', // User interface
                'api', // API layer
                'i18n', // Internationalization
                'a11y', // Accessibility
                'security', // Security
                'deps', // Dependencies
            ],
        ],
        // Subject line max 72 characters
        'subject-max-length': [2, 'always', 72],
        // Body max line length 100 characters
        'body-max-line-length': [2, 'always', 100],
    },
};
