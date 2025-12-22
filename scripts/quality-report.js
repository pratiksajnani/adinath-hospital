#!/usr/bin/env node

/**
 * Code Quality Report Generator
 * Generates a comprehensive quality report from various analysis tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

console.log(c('bright', '\n📊 ADINATH HOSPITAL - CODE QUALITY REPORT'));
console.log('='.repeat(50) + '\n');

const results = {
    timestamp: new Date().toISOString(),
    summary: {},
    details: {},
};

// Helper to run command and capture output
function runCommand(cmd, silent = false) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    } catch (error) {
        return error.stdout || error.message;
    }
}

// Helper to run command silently and return output
function runSilent(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
        return error.stdout || '';
    }
}

// 1. Lines of Code Analysis
console.log(c('cyan', '📝 1. LINES OF CODE ANALYSIS'));
console.log('-'.repeat(40));

const jsFiles = runSilent('find js -name "*.js" | wc -l').trim();
const cssFiles = runSilent('find css -name "*.css" | wc -l').trim();
const htmlFiles = runSilent('find . -name "*.html" -not -path "./node_modules/*" -not -path "./playwright-report/*" | wc -l').trim();

const jsLines = runSilent('find js -name "*.js" -exec cat {} + | wc -l').trim();
const cssLines = runSilent('find css -name "*.css" -exec cat {} + | wc -l').trim();
const testLines = runSilent('find tests -name "*.js" -exec cat {} + | wc -l').trim();

console.log(`  JavaScript files: ${c('green', jsFiles)} (${c('blue', jsLines)} lines)`);
console.log(`  CSS files:        ${c('green', cssFiles)} (${c('blue', cssLines)} lines)`);
console.log(`  HTML files:       ${c('green', htmlFiles)}`);
console.log(`  Test files:       ${c('blue', testLines)} lines`);

results.summary.linesOfCode = {
    javascript: { files: parseInt(jsFiles), lines: parseInt(jsLines) },
    css: { files: parseInt(cssFiles), lines: parseInt(cssLines) },
    html: { files: parseInt(htmlFiles) },
    tests: { lines: parseInt(testLines) },
};

// 2. ESLint Analysis
console.log(c('cyan', '\n🔍 2. ESLINT ANALYSIS'));
console.log('-'.repeat(40));

const eslintOutput = runSilent('npm run lint 2>&1');
const errorCount = (eslintOutput.match(/(\d+) errors?/i) || ['0', '0'])[1];
const warningCount = (eslintOutput.match(/(\d+) warnings?/i) || ['0', '0'])[1];

const errorColor = parseInt(errorCount) > 0 ? 'red' : 'green';
const warningColor = parseInt(warningCount) > 10 ? 'yellow' : 'green';

console.log(`  Errors:   ${c(errorColor, errorCount)}`);
console.log(`  Warnings: ${c(warningColor, warningCount)}`);

results.summary.eslint = {
    errors: parseInt(errorCount),
    warnings: parseInt(warningCount),
    status: parseInt(errorCount) === 0 ? 'pass' : 'fail',
};

// 3. Test Coverage
console.log(c('cyan', '\n🧪 3. TEST COVERAGE'));
console.log('-'.repeat(40));

runSilent('npm run coverage -- --silent 2>&1');
const coverageFile = 'coverage/coverage-summary.json';

if (fs.existsSync(coverageFile)) {
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    const total = coverage.total;

    const getColor = (pct) => (pct >= 80 ? 'green' : pct >= 60 ? 'yellow' : 'red');

    console.log(`  Statements: ${c(getColor(total.statements.pct), total.statements.pct + '%')}`);
    console.log(`  Branches:   ${c(getColor(total.branches.pct), total.branches.pct + '%')}`);
    console.log(`  Functions:  ${c(getColor(total.functions.pct), total.functions.pct + '%')}`);
    console.log(`  Lines:      ${c(getColor(total.lines.pct), total.lines.pct + '%')}`);

    results.summary.coverage = {
        statements: total.statements.pct,
        branches: total.branches.pct,
        functions: total.functions.pct,
        lines: total.lines.pct,
        status: total.lines.pct >= 80 ? 'excellent' : total.lines.pct >= 60 ? 'good' : 'needs-improvement',
    };
} else {
    console.log(c('yellow', '  Coverage report not available'));
    results.summary.coverage = { status: 'not-available' };
}

// 4. Code Duplication
console.log(c('cyan', '\n📋 4. CODE DUPLICATION'));
console.log('-'.repeat(40));

runSilent('npx jscpd js/ css/ --silent 2>&1');
const jscpdFile = 'test-results/jscpd/jscpd-report.json';

if (fs.existsSync(jscpdFile)) {
    const jscpd = JSON.parse(fs.readFileSync(jscpdFile, 'utf8'));
    const dupPercent = jscpd.statistics?.total?.percentage || 0;
    const dupColor = dupPercent > 10 ? 'red' : dupPercent > 5 ? 'yellow' : 'green';

    console.log(`  Duplication: ${c(dupColor, dupPercent.toFixed(2) + '%')}`);
    console.log(`  Clones found: ${jscpd.statistics?.total?.clones || 0}`);

    results.summary.duplication = {
        percentage: dupPercent,
        clones: jscpd.statistics?.total?.clones || 0,
        status: dupPercent <= 5 ? 'good' : dupPercent <= 10 ? 'acceptable' : 'high',
    };
} else {
    console.log(c('yellow', '  Duplication report not available'));
    results.summary.duplication = { status: 'not-available' };
}

// 5. Security Audit
console.log(c('cyan', '\n🔒 5. SECURITY AUDIT'));
console.log('-'.repeat(40));

const auditOutput = runSilent('npm audit --json 2>&1');
let auditData = { metadata: { vulnerabilities: {} } };
try {
    auditData = JSON.parse(auditOutput);
} catch (e) {
    // Parse error, use default
}

const vulns = auditData.metadata?.vulnerabilities || {};
const totalVulns = (vulns.low || 0) + (vulns.moderate || 0) + (vulns.high || 0) + (vulns.critical || 0);
const vulnColor = totalVulns === 0 ? 'green' : vulns.critical > 0 || vulns.high > 0 ? 'red' : 'yellow';

console.log(`  Total vulnerabilities: ${c(vulnColor, totalVulns)}`);
if (totalVulns > 0) {
    console.log(`    - Critical: ${vulns.critical || 0}`);
    console.log(`    - High:     ${vulns.high || 0}`);
    console.log(`    - Moderate: ${vulns.moderate || 0}`);
    console.log(`    - Low:      ${vulns.low || 0}`);
}

results.summary.security = {
    total: totalVulns,
    critical: vulns.critical || 0,
    high: vulns.high || 0,
    moderate: vulns.moderate || 0,
    low: vulns.low || 0,
    status: totalVulns === 0 ? 'secure' : vulns.critical > 0 ? 'critical' : 'attention-needed',
};

// 6. Formatting Check
console.log(c('cyan', '\n✨ 6. CODE FORMATTING'));
console.log('-'.repeat(40));

const formatOutput = runSilent('npm run format:check 2>&1');
const unformatted = (formatOutput.match(/\[warn\]/g) || []).length;
const formatColor = unformatted === 0 ? 'green' : 'yellow';

console.log(`  Unformatted files: ${c(formatColor, unformatted)}`);

results.summary.formatting = {
    unformattedFiles: unformatted,
    status: unformatted === 0 ? 'clean' : 'needs-formatting',
};

// 7. Test Results
console.log(c('cyan', '\n✅ 7. TEST RESULTS'));
console.log('-'.repeat(40));

const testOutput = runSilent('npm run test:unit -- --json 2>&1');
let testData = { numTotalTests: 0, numPassedTests: 0, numFailedTests: 0 };
try {
    // Extract JSON from output (Jest outputs multiple lines)
    const jsonMatch = testOutput.match(/\{[\s\S]*"numTotalTests"[\s\S]*\}/);
    if (jsonMatch) {
        testData = JSON.parse(jsonMatch[0]);
    }
} catch (e) {
    // Parse manually from output
    const passed = testOutput.match(/(\d+) passed/);
    const failed = testOutput.match(/(\d+) failed/);
    testData.numPassedTests = passed ? parseInt(passed[1]) : 0;
    testData.numFailedTests = failed ? parseInt(failed[1]) : 0;
    testData.numTotalTests = testData.numPassedTests + testData.numFailedTests;
}

const testColor = testData.numFailedTests === 0 ? 'green' : 'red';
console.log(`  Total tests:  ${c('blue', testData.numTotalTests)}`);
console.log(`  Passed:       ${c('green', testData.numPassedTests)}`);
console.log(`  Failed:       ${c(testColor, testData.numFailedTests)}`);

results.summary.tests = {
    total: testData.numTotalTests,
    passed: testData.numPassedTests,
    failed: testData.numFailedTests,
    status: testData.numFailedTests === 0 ? 'pass' : 'fail',
};

// Calculate Overall Score
console.log(c('bright', '\n' + '='.repeat(50)));
console.log(c('bright', '📈 OVERALL QUALITY SCORE'));
console.log('='.repeat(50) + '\n');

let score = 100;
const deductions = [];

// Deduct for ESLint errors
if (results.summary.eslint.errors > 0) {
    const deduction = Math.min(results.summary.eslint.errors * 5, 30);
    score -= deduction;
    deductions.push(`-${deduction} ESLint errors`);
}

// Deduct for low coverage
if (results.summary.coverage.lines) {
    if (results.summary.coverage.lines < 80) {
        const deduction = Math.min(Math.floor((80 - results.summary.coverage.lines) / 2), 20);
        score -= deduction;
        deductions.push(`-${deduction} Low test coverage`);
    }
}

// Deduct for high duplication
if (results.summary.duplication.percentage > 5) {
    const deduction = Math.min(Math.floor(results.summary.duplication.percentage - 5), 15);
    score -= deduction;
    deductions.push(`-${deduction} Code duplication`);
}

// Deduct for security issues
if (results.summary.security.critical > 0) {
    score -= 20;
    deductions.push('-20 Critical vulnerabilities');
} else if (results.summary.security.high > 0) {
    score -= 10;
    deductions.push('-10 High vulnerabilities');
}

// Deduct for failed tests
if (results.summary.tests.failed > 0) {
    const deduction = Math.min(results.summary.tests.failed * 5, 25);
    score -= deduction;
    deductions.push(`-${deduction} Failed tests`);
}

// Deduct for unformatted files
if (results.summary.formatting.unformattedFiles > 0) {
    const deduction = Math.min(results.summary.formatting.unformattedFiles, 5);
    score -= deduction;
    deductions.push(`-${deduction} Unformatted files`);
}

score = Math.max(0, Math.min(100, score));

const getGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'green' };
    if (score >= 80) return { grade: 'B', color: 'green' };
    if (score >= 70) return { grade: 'C', color: 'yellow' };
    if (score >= 60) return { grade: 'D', color: 'yellow' };
    return { grade: 'F', color: 'red' };
};

const { grade, color } = getGrade(score);

console.log(`  Score: ${c(color, score + '/100')} (Grade: ${c(color, grade)})`);
console.log('');

if (deductions.length > 0) {
    console.log('  Deductions:');
    deductions.forEach((d) => console.log(`    ${c('yellow', d)}`));
}

results.summary.overall = { score, grade };

// Save report
const reportDir = 'test-results';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

fs.writeFileSync(
    path.join(reportDir, 'quality-report.json'),
    JSON.stringify(results, null, 2)
);

console.log(c('cyan', `\n📁 Full report saved to: ${reportDir}/quality-report.json`));
console.log(c('bright', '\n' + '='.repeat(50) + '\n'));

// Exit with error if score is below threshold
process.exit(score >= 60 ? 0 : 1);

