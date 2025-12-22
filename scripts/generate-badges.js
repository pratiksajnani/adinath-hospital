#!/usr/bin/env node

/**
 * Generate Quality Badges for README
 * Creates shields.io badge URLs based on quality metrics
 */

const fs = require('fs');
const path = require('path');

// Read quality report
const reportPath = 'test-results/quality-report.json';

if (!fs.existsSync(reportPath)) {
    console.log('No quality report found. Run npm run quality:report first.');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const summary = report.summary;

// Generate badge URLs
const badges = [];

// Overall score badge
const scoreColor =
    summary.overall.score >= 90
        ? 'brightgreen'
        : summary.overall.score >= 80
          ? 'green'
          : summary.overall.score >= 70
            ? 'yellow'
            : summary.overall.score >= 60
              ? 'orange'
              : 'red';

badges.push({
    name: 'Quality Score',
    url: `https://img.shields.io/badge/quality-${summary.overall.score}%25-${scoreColor}`,
    alt: `Quality Score: ${summary.overall.score}%`,
});

// Test coverage badge
if (summary.coverage.lines) {
    const covColor =
        summary.coverage.lines >= 80
            ? 'brightgreen'
            : summary.coverage.lines >= 60
              ? 'yellow'
              : 'red';
    badges.push({
        name: 'Coverage',
        url: `https://img.shields.io/badge/coverage-${summary.coverage.lines}%25-${covColor}`,
        alt: `Test Coverage: ${summary.coverage.lines}%`,
    });
}

// Tests badge
const testColor = summary.tests.failed === 0 ? 'brightgreen' : 'red';
badges.push({
    name: 'Tests',
    url: `https://img.shields.io/badge/tests-${summary.tests.passed}%20passed-${testColor}`,
    alt: `Tests: ${summary.tests.passed} passed`,
});

// ESLint badge
const lintColor = summary.eslint.errors === 0 ? 'brightgreen' : 'red';
badges.push({
    name: 'ESLint',
    url: `https://img.shields.io/badge/eslint-${summary.eslint.errors}%20errors-${lintColor}`,
    alt: `ESLint: ${summary.eslint.errors} errors`,
});

// Security badge
const secColor =
    summary.security.total === 0
        ? 'brightgreen'
        : summary.security.critical > 0
          ? 'red'
          : 'yellow';
badges.push({
    name: 'Security',
    url: `https://img.shields.io/badge/security-${summary.security.total}%20issues-${secColor}`,
    alt: `Security: ${summary.security.total} issues`,
});

// Duplication badge
if (summary.duplication.percentage !== undefined) {
    const dupColor =
        summary.duplication.percentage <= 5
            ? 'brightgreen'
            : summary.duplication.percentage <= 10
              ? 'yellow'
              : 'red';
    badges.push({
        name: 'Duplication',
        url: `https://img.shields.io/badge/duplication-${summary.duplication.percentage.toFixed(1)}%25-${dupColor}`,
        alt: `Duplication: ${summary.duplication.percentage.toFixed(1)}%`,
    });
}

// Generate markdown
const markdown = badges.map((b) => `![${b.alt}](${b.url})`).join(' ');

console.log('\n📊 Quality Badges for README.md:\n');
console.log(markdown);
console.log('\n');

// Save badges JSON
fs.writeFileSync(
    'test-results/badges.json',
    JSON.stringify({ badges, markdown }, null, 2)
);

console.log('Badges saved to test-results/badges.json');

