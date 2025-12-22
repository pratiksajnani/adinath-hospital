# Missing Configuration Checklist

This document lists all external configurations needed to fully enable the zero-touch maintenance system.

## Priority: High (Enable Core Monitoring)

### 1. Sentry - Error Tracking
**Time: ~5 minutes**

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create a new project (JavaScript)
3. Copy your DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)
4. Update `js/config.js`:
   ```javascript
   SENTRY_DSN: ENV === 'production' ? 'https://YOUR_DSN_HERE@sentry.io/xxx' : null,
   ```
5. Commit and push

**What you get:** Real-time error alerts, stack traces, user context

---

### 2. UptimeRobot - Uptime Monitoring
**Time: ~10 minutes**

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account
2. Add these monitors (HTTP/HTTPS, 5-min interval):

| Monitor Name | URL |
|--------------|-----|
| Homepage | `https://adinathhealth.com/` |
| Booking | `https://adinathhealth.com/book.html` |
| Login | `https://adinathhealth.com/login.html` |
| Doctor Portal | `https://adinathhealth.com/portal/doctor/simple.html` |
| Patient Portal | `https://adinathhealth.com/portal/patient/index.html` |

3. Set up alert contacts (your email)
4. Optional: Create a public status page

**What you get:** SMS/email alerts when site goes down, uptime reports

---

### 3. GitHub Actions - Enable Workflows
**Time: ~2 minutes**

1. Go to your repo: `github.com/pratiksajnani/adinath-hospital`
2. Click **Settings** → **Actions** → **General**
3. Ensure "Allow all actions" is selected
4. Under "Workflow permissions", select "Read and write permissions"
5. Click Save

**What you get:** Automated CI/CD, security scanning, weekly digests

---

## Priority: Medium (Enhanced Analytics)

### 4. LogRocket - Session Recording
**Time: ~5 minutes**

1. Go to [logrocket.com](https://logrocket.com) and create a free account
2. Create a new project
3. Copy your App ID (looks like: `your-app/your-project`)
4. Update `js/config.js`:
   ```javascript
   LOGROCKET_ID: ENV === 'production' ? 'your-app/your-project' : null,
   ```
5. Commit and push

**What you get:** Session replays, see user struggles, rage click detection

---

### 5. Snyk - Vulnerability Scanning (Optional)
**Time: ~5 minutes**

1. Go to [snyk.io](https://snyk.io) and sign in with GitHub
2. Get your API token from Account Settings
3. Go to GitHub repo → Settings → Secrets → Actions
4. Add new secret: `SNYK_TOKEN` = your token

**What you get:** Automated vulnerability scanning in CI

---

## Priority: Low (Advanced Features)

### 6. Google Analytics
**Time: ~5 minutes**

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a property for adinathhealth.com
3. Get your Measurement ID (G-XXXXXXXXXX)
4. Uncomment and update the GA script in `index.html` (lines 34-42)

**What you get:** Traffic analytics, user behavior, demographics

---

### 7. Supabase Backup Storage Bucket
**Time: ~3 minutes**

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `hospital-backups`
3. Set it to private
4. The backup function will automatically use it

**What you get:** Automated weekly data backups

---

## Quick Reference

| Service | Free Tier | Config Location | Secret Location |
|---------|-----------|-----------------|-----------------|
| Sentry | 5K events/mo | `js/config.js` | N/A (DSN is public) |
| LogRocket | 1K sessions/mo | `js/config.js` | N/A (ID is public) |
| UptimeRobot | 50 monitors | External | N/A |
| Snyk | 200 tests/mo | N/A | GitHub Secrets |
| Google Analytics | Unlimited | `index.html` | N/A |

---

## Verification Checklist

After configuration, verify each service:

- [ ] **Sentry:** Trigger a test error in browser console: `throw new Error('Test')`
- [ ] **UptimeRobot:** Check dashboard shows all monitors as UP
- [ ] **GitHub Actions:** Check Actions tab shows workflows running
- [ ] **LogRocket:** Check dashboard shows sessions being recorded
- [ ] **Snyk:** Check security workflow runs without errors

---

## Support

If you need help with any configuration:
- Sentry Docs: https://docs.sentry.io/platforms/javascript/
- UptimeRobot Docs: https://uptimerobot.com/docs/
- LogRocket Docs: https://docs.logrocket.com/docs/
- Snyk Docs: https://docs.snyk.io/

---

*Last updated: December 2024*

