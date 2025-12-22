#!/usr/bin/env node

/**
 * i18n Validation Script
 * Validates translation completeness across the codebase
 * 
 * Usage: node scripts/validate-i18n.js
 */

const fs = require('fs');
const path = require('path');

const SUPPORTED_LANGUAGES = ['en', 'hi', 'gu'];
const ROOT_DIR = path.join(__dirname, '..');

// ANSI colors for output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract translation keys from i18n.js
 */
function extractTranslationKeys() {
    const i18nPath = path.join(ROOT_DIR, 'js', 'i18n.js');
    const content = fs.readFileSync(i18nPath, 'utf-8');
    
    const keys = {};
    const errors = [];
    
    // Match translation entries like: key_name: { en: '...', hi: '...', gu: '...' }
    const keyRegex = /(\w+):\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = keyRegex.exec(content)) !== null) {
        const keyName = match[1];
        const valueBlock = match[2];
        
        // Skip non-translation objects
        if (keyName === 'translations' || keyName === 'I18N') continue;
        
        const languages = {};
        
        for (const lang of SUPPORTED_LANGUAGES) {
            const langRegex = new RegExp(`${lang}:\\s*['"\`]([^'"\`]*?)['"\`]|${lang}:\\s*['"\`]([^'"\`]*?)['"\`]`, 'g');
            const langMatch = langRegex.exec(valueBlock);
            if (langMatch) {
                languages[lang] = langMatch[1] || langMatch[2];
            }
        }
        
        if (Object.keys(languages).length > 0) {
            keys[keyName] = languages;
            
            // Check for missing languages
            for (const lang of SUPPORTED_LANGUAGES) {
                if (!languages[lang]) {
                    errors.push({
                        type: 'missing_language',
                        key: keyName,
                        language: lang
                    });
                }
            }
        }
    }
    
    return { keys, errors };
}

/**
 * Find all HTML files in the project
 */
function findHtmlFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, coverage, and other non-source directories
            if (['node_modules', 'coverage', 'test-results', '.git', 'playwright-report'].includes(item)) {
                continue;
            }
            findHtmlFiles(fullPath, files);
        } else if (item.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Extract data-i18n attributes from HTML files
 */
function extractDataI18nFromHtml(htmlFiles) {
    const usedKeys = new Set();
    const errors = [];
    
    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(ROOT_DIR, file);
        
        // Find data-i18n attributes
        const dataI18nRegex = /data-i18n="([^"]+)"/g;
        let match;
        
        while ((match = dataI18nRegex.exec(content)) !== null) {
            usedKeys.add(match[1]);
        }
        
        // Find data-i18n-placeholder attributes (for form inputs)
        const placeholderRegex = /data-i18n-placeholder="([^"]+)"/g;
        while ((match = placeholderRegex.exec(content)) !== null) {
            usedKeys.add(match[1]);
        }
        
        // Check for hardcoded placeholder attributes
        const hardcodedPlaceholderRegex = /placeholder="([A-Za-z][^"]*)"(?!.*data-i18n-placeholder)/g;
        while ((match = hardcodedPlaceholderRegex.exec(content)) !== null) {
            errors.push({
                type: 'hardcoded_placeholder',
                file: relativePath,
                value: match[1]
            });
        }
    }
    
    return { usedKeys, errors };
}

/**
 * Find JS files with alert/confirm calls
 */
function findHardcodedAlerts() {
    const errors = [];
    const jsFiles = [];
    const htmlFiles = findHtmlFiles(ROOT_DIR);
    
    // Find JS files
    function findJsFiles(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                if (!['node_modules', 'coverage', 'test-results', '.git', 'tests'].includes(item)) {
                    findJsFiles(fullPath);
                }
            } else if (item.endsWith('.js')) {
                jsFiles.push(fullPath);
            }
        }
    }
    findJsFiles(path.join(ROOT_DIR, 'js'));
    
    // Check JS files
    for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(ROOT_DIR, file);
        
        // Find alert() calls with string literals
        const alertRegex = /alert\(['"`]([^'"`]+)['"`]\)/g;
        let match;
        while ((match = alertRegex.exec(content)) !== null) {
            if (!match[1].includes('I18N.t')) {
                errors.push({
                    type: 'hardcoded_alert',
                    file: relativePath,
                    value: match[1].substring(0, 50) + (match[1].length > 50 ? '...' : '')
                });
            }
        }
        
        // Find confirm() calls with string literals
        const confirmRegex = /confirm\(['"`]([^'"`]+)['"`]\)/g;
        while ((match = confirmRegex.exec(content)) !== null) {
            errors.push({
                type: 'hardcoded_confirm',
                file: relativePath,
                value: match[1].substring(0, 50) + (match[1].length > 50 ? '...' : '')
            });
        }
    }
    
    // Also check HTML files for inline script alerts
    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(ROOT_DIR, file);
        
        const alertRegex = /alert\(['"`]([^'"`]+)['"`]\)/g;
        let match;
        while ((match = alertRegex.exec(content)) !== null) {
            if (!match[1].includes('I18N.t')) {
                errors.push({
                    type: 'hardcoded_alert_html',
                    file: relativePath,
                    value: match[1].substring(0, 50) + (match[1].length > 50 ? '...' : '')
                });
            }
        }
    }
    
    return errors;
}

/**
 * Main validation function
 */
function validate() {
    console.log('\n🌐 i18n Validation Report\n');
    console.log('='.repeat(60) + '\n');
    
    let hasErrors = false;
    
    // 1. Check translation keys
    log('blue', '📋 Checking translation keys in i18n.js...');
    const { keys, errors: keyErrors } = extractTranslationKeys();
    const totalKeys = Object.keys(keys).length;
    console.log(`   Found ${totalKeys} translation keys\n`);
    
    if (keyErrors.length > 0) {
        hasErrors = true;
        log('yellow', `   ⚠️  ${keyErrors.length} keys with missing language(s):`);
        for (const error of keyErrors.slice(0, 10)) {
            console.log(`      - ${error.key}: missing '${error.language}'`);
        }
        if (keyErrors.length > 10) {
            console.log(`      ... and ${keyErrors.length - 10} more`);
        }
        console.log();
    }
    
    // 2. Check HTML files
    log('blue', '📄 Scanning HTML files for data-i18n usage...');
    const htmlFiles = findHtmlFiles(ROOT_DIR);
    const { usedKeys, errors: htmlErrors } = extractDataI18nFromHtml(htmlFiles);
    console.log(`   Scanned ${htmlFiles.length} HTML files`);
    console.log(`   Found ${usedKeys.size} unique data-i18n keys in use\n`);
    
    // Check for undefined keys
    const undefinedKeys = [];
    for (const key of usedKeys) {
        if (!keys[key]) {
            undefinedKeys.push(key);
        }
    }
    
    if (undefinedKeys.length > 0) {
        hasErrors = true;
        log('red', `   ❌ ${undefinedKeys.length} data-i18n keys not defined in i18n.js:`);
        for (const key of undefinedKeys.slice(0, 10)) {
            console.log(`      - ${key}`);
        }
        if (undefinedKeys.length > 10) {
            console.log(`      ... and ${undefinedKeys.length - 10} more`);
        }
        console.log();
    }
    
    // Check for unused keys
    const unusedKeys = Object.keys(keys).filter(k => !usedKeys.has(k));
    if (unusedKeys.length > 0) {
        log('yellow', `   ⚠️  ${unusedKeys.length} translation keys defined but not used`);
        console.log();
    }
    
    // Hardcoded placeholders
    const placeholderErrors = htmlErrors.filter(e => e.type === 'hardcoded_placeholder');
    if (placeholderErrors.length > 0) {
        log('yellow', `   ⚠️  ${placeholderErrors.length} hardcoded placeholder attributes found`);
        for (const error of placeholderErrors.slice(0, 5)) {
            console.log(`      - ${error.file}: "${error.value}"`);
        }
        if (placeholderErrors.length > 5) {
            console.log(`      ... and ${placeholderErrors.length - 5} more`);
        }
        console.log();
    }
    
    // 3. Check for hardcoded alerts
    log('blue', '🔔 Checking for hardcoded alert/confirm messages...');
    const alertErrors = findHardcodedAlerts();
    if (alertErrors.length > 0) {
        log('yellow', `   ⚠️  ${alertErrors.length} hardcoded alert/confirm messages found`);
        for (const error of alertErrors.slice(0, 5)) {
            console.log(`      - ${error.file}: "${error.value}"`);
        }
        if (alertErrors.length > 5) {
            console.log(`      ... and ${alertErrors.length - 5} more`);
        }
        console.log();
    } else {
        log('green', '   ✓ No hardcoded alerts in JS files');
        console.log();
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   Translation keys: ${totalKeys}`);
    console.log(`   Keys in use: ${usedKeys.size}`);
    console.log(`   Missing translations: ${keyErrors.length}`);
    console.log(`   Undefined keys: ${undefinedKeys.length}`);
    console.log(`   Hardcoded placeholders: ${placeholderErrors.length}`);
    console.log(`   Hardcoded alerts: ${alertErrors.length}`);
    console.log();
    
    if (hasErrors) {
        log('red', '❌ Validation failed with errors\n');
        process.exit(1);
    } else if (keyErrors.length > 0 || placeholderErrors.length > 0 || alertErrors.length > 0) {
        log('yellow', '⚠️  Validation passed with warnings\n');
        process.exit(0);
    } else {
        log('green', '✅ All translations are complete!\n');
        process.exit(0);
    }
}

// Run validation
validate();

