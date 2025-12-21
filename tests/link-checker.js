/**
 * Link Checker Script
 * Verifies all internal links are valid
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'https://adinathhealth.com';

// Pages to check
const pagesToCheck = [
  '/',
  '/book.html',
  '/login.html',
  '/store.html',
  '/check-status.html',
  '/404.html',
  '/services/orthopedic.html',
  '/services/gynecology.html',
  '/services/yoga.html',
  '/services/pharmacy.html',
  '/onboard/index.html',
  '/onboard/patient.html',
  '/onboard/doctor.html',
  '/onboard/staff.html',
  '/onboard/admin.html',
  '/portal/index.html',
  '/portal/doctor/index.html',
  '/portal/staff/index.html',
  '/portal/admin/index.html',
  '/portal/patient/index.html',
  '/docs/index.html',
  '/docs/PATIENT_GUIDE.html',
  '/docs/DOCTOR_GUIDE.html',
  '/docs/STAFF_GUIDE.html',
  '/docs/SITEADMIN_DEMO.html',
  '/forms/patient-intake.html',
  '/forms/prescription.html',
  '/forms/consent-form.html',
  '/store/index.html',
];

// Check a single URL
function checkUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
    const client = fullUrl.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, { timeout: 10000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400,
        redirect: res.statusCode >= 300 && res.statusCode < 400,
        location: res.headers.location
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        ok: false,
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        ok: false,
        error: 'Timeout'
      });
    });
  });
}

// Run all checks
async function runChecks() {
  console.log('🔗 Link Checker for Adinath Hospital');
  console.log('=====================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Checking ${pagesToCheck.length} pages...\n`);
  
  const results = [];
  let passed = 0;
  let failed = 0;
  let redirected = 0;
  
  for (const page of pagesToCheck) {
    const result = await checkUrl(page);
    results.push(result);
    
    if (result.ok) {
      passed++;
      console.log(`✅ ${result.status} ${page}`);
    } else if (result.redirect) {
      redirected++;
      console.log(`🔄 ${result.status} ${page} → ${result.location}`);
    } else {
      failed++;
      console.log(`❌ ${result.status || 'ERR'} ${page} ${result.error || ''}`);
    }
  }
  
  console.log('\n=====================================');
  console.log('SUMMARY');
  console.log('=====================================');
  console.log(`✅ Passed:    ${passed}`);
  console.log(`🔄 Redirects: ${redirected}`);
  console.log(`❌ Failed:    ${failed}`);
  console.log(`📊 Total:     ${pagesToCheck.length}`);
  
  // Write results to file
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: { passed, redirected, failed, total: pagesToCheck.length },
    results
  };
  
  const reportPath = path.join(__dirname, '../test-results/link-check-results.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  // Exit with error if any links failed
  if (failed > 0) {
    console.log('\n⚠️  Some links failed! Check the results above.');
    process.exit(1);
  } else {
    console.log('\n✅ All links are working!');
    process.exit(0);
  }
}

runChecks().catch(err => {
  console.error('Error running link checker:', err);
  process.exit(1);
});

