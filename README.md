# 🏥 Adinath Hospital Website

[![Tests](https://github.com/pratiksajnani/adinath-hospital/actions/workflows/test.yml/badge.svg)](https://github.com/pratiksajnani/adinath-hospital/actions/workflows/test.yml)
[![E2E Tests](https://github.com/pratiksajnani/adinath-hospital/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/pratiksajnani/adinath-hospital/actions)
[![Links](https://img.shields.io/badge/links-verified-brightgreen)](https://adinathhealth.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fadinathhealth.com)](https://adinathhealth.com)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

Official website for Adinath Hospital, Ahmedabad - A comprehensive Hospital Management System.

## 🌐 Live Website

**🌐 Production:** https://adinathhealth.com/

**🧪 Staging:** https://main.d2a0i6erg1hmca.amplifyapp.com/

---

## 📱 SMS-READY LINKS (Copy & Send to Phone)

| Role | TinyURL | Send This Link |
|------|---------|----------------|
| 👨‍⚕️ **Doctor** | https://tinyurl.com/doctor-demo | `Send to Dr. Ashok / Dr. Sunita` |
| 👩‍💼 **Staff** | https://tinyurl.com/staff-demo | `Send to Poonam (Receptionist)` |
| 👨‍👩‍👧 **Patient** | https://tinyurl.com/2xj66x22 | `Send to any patient` |
| 🔧 **Admin** | https://tinyurl.com/siteadmin-demo | `Send to Pratik (Site Admin)` |

---

## 📋 DEMO GUIDES

### 🎬 Demo Video

| Resource | Link |
|----------|------|
| **Video Script** | [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md) |
| Record with | [Loom](https://loom.com) (free) or QuickTime |

> 📹 **To create the demo video:** Follow the script in VIDEO_SCRIPT.md, record your screen using Loom, then share the link here.

---

### 👨‍⚕️ Doctor Demo Guide

| Resource | Link |
|----------|------|
| **TinyURL** | https://tinyurl.com/doctor-demo |
| Full Guide | [docs/DOCTOR_GUIDE.html](docs/DOCTOR_GUIDE.html) |
| CRUD Operations | View appointments, Write prescriptions, Update status, Send messages |

### 👩‍💼 Staff Demo Guide

| Resource | Link |
|----------|------|
| **TinyURL** | https://tinyurl.com/staff-demo |
| Full Guide | [docs/STAFF_GUIDE.html](docs/STAFF_GUIDE.html) |
| CRUD Operations | Register patients, Book appointments, Send SMS/WhatsApp, Show QR |

### 👨‍👩‍👧 Patient Demo Guide

| Resource | Link |
|----------|------|
| **TinyURL** | https://tinyurl.com/2xj66x22 |
| Full Guide | [docs/PATIENT_DEMO.html](docs/PATIENT_DEMO.html) |
| CRUD Operations | Book appointment, View appointments, View prescriptions, Update profile |

### 🔧 Site Admin Demo Guide

| Resource | Link |
|----------|------|
| **TinyURL** | https://tinyurl.com/siteadmin-demo |
| Full Guide | [docs/SITEADMIN_DEMO.html](docs/SITEADMIN_DEMO.html) |
| CRUD Operations | Full access to all data, Manage appointments, Manage patients, Reset demo

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Site Admin** | pratik.sajnani@gmail.com | 1234 |
| **Doctor (Dr. Ashok)** | drsajnani@gmail.com | doctor123 |
| **Doctor (Dr. Sunita)** | sunita.sajnani9@gmail.com | doctor123 |
| **Receptionist (Poonam)** | reception@adinathhealth.com | staff123 |

---

## 📱 Quick Links

| Page | Path | Status |
|------|------|--------|
| Homepage | `/` | ✅ |
| Book Appointment | `/book.html` | ✅ |
| Portal Hub | `/portal/index.html` | ✅ |
| Doctor Dashboard (Simple) | `/portal/doctor/simple.html` | ✅ |
| Patient Portal | `/portal/patient/index.html` | ✅ |
| Staff Dashboard | `/portal/staff/index.html` | ⚠️ |
| Admin Dashboard | `/portal/admin/index.html` | ✅ |
| Forms Hub | `/forms/index.html` | ✅ |
| Medical Store | `/store.html` | ✅ |
| Staff Login | `/login.html` | ⚠️ |

---

## 🏥 About Adinath Hospital

**Adinath Hospital** is a mid-size hospital located in Shahibaug, Ahmedabad, Gujarat, India, providing specialized Orthopedic and Gynecology care since 1990.

### 👨‍⚕️ Doctors

| Doctor | Specialty | Experience |
|--------|-----------|------------|
| **Dr. Ashok Sajnani** | Orthopedic & Joint Surgeon | 35+ years |
| **Dr. Sunita Sajnani** | Obstetrics & Gynecology | 30+ years |

### 📍 Contact Information

- **Address:** 2nd Floor, Shukan Mall, Shahibaug Rd., Ahmedabad, Gujarat 380004
- **Phone:** +91 99254 50425
- **WhatsApp:** +91 99254 50425
- **Hours:** 11 AM - 7 PM (No emergencies)

---

## 🛠️ Development

### Local Development

```bash
# Start local server (Python)
cd /path/to/adinath-hospital
python3 -m http.server 8080

# Or with Node.js
npx serve

# Open in browser
open http://localhost:8080
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML5, CSS3, JavaScript |
| Database | localStorage (client-side mock HMS) |
| Hosting | AWS Amplify (auto-deploy from main) |
| Languages | English, Hindi (हिंदी), Gujarati (ગુજરાતી) |

---

## 📁 Project Structure

```
adinath-hospital/
├── index.html              # Homepage
├── book.html               # Appointment booking
├── login.html              # Staff/Doctor login
├── store.html              # Public pharmacy page
├── 404.html                # Custom 404 page
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── config.js           # Environment config
│   ├── main.js             # UI interactions
│   ├── i18n.js             # Translations (EN/HI/GU)
│   └── hms.js              # Hospital Management System
├── portal/
│   ├── index.html          # Portal hub
│   ├── patient/            # Patient dashboard
│   ├── doctor/             # Doctor dashboards
│   ├── staff/              # Staff dashboard
│   └── admin/              # Admin dashboard
├── services/               # Service detail pages
├── forms/                  # Printable forms
├── store/                  # Store staff dashboard
├── images/                 # All images
├── docs/                   # Documentation & Demo Guides
└── tests/                  # Test strategy & scripts
```

---

## 🚀 Deployment

This site is hosted on **AWS Amplify** with continuous deployment:

```bash
# Stage all changes
git add -A

# Commit with message
git commit -m "Your commit message"

# Push to trigger deployment
git push origin main
```

Changes deploy in ~2 minutes.

---

## 🧪 Testing

### Quick Test Commands

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run unit tests
npm run test:unit

# Run E2E tests (requires browsers)
npm run test:e2e

# Run all tests
npm run test:all

# Check all links
npm run test:links

# View test report
npm run test:report
```

### Test Coverage

| Test Suite | Description | Files |
|------------|-------------|-------|
| **Unit Tests** | HMS, i18n, API logic | `tests/unit/*.test.js` |
| **E2E Tests** | Full user flows | `tests/e2e/*.spec.js` |
| **Link Checker** | All pages accessible | `tests/link-checker.js` |
| **Accessibility** | WCAG compliance | `tests/e2e/accessibility.spec.js` |

### CI/CD Pipeline

Tests run automatically on every push via GitHub Actions:

1. ✅ **Unit Tests** - Jest tests for JS modules
2. ✅ **E2E Tests** - Playwright browser tests
3. ✅ **Link Check** - Verify all pages work
4. ✅ **Accessibility** - WCAG compliance

---

## ⚠️ Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Domain DNS propagation | 🟡 Pending | adinathhealth.com - up in 10-48 hours |
| Missing i18n translations | 🟡 Partial | Some keys need translation |
| Real SMS integration | ⚪ Future | Requires MSG91/Twilio setup |
| Cloud database | ⚪ Future | Currently using localStorage |

---

## 📝 To-Do

- [ ] Fix AWS Amplify redirect rules in console
- [ ] Complete Hindi/Gujarati translations
- [ ] Add Poonam's phone number
- [ ] Add more real hospital photos
- [ ] Integrate real SMS service (future)
- [ ] Cloud database migration (future)

---

## 📞 Support

For technical issues, contact:
- **Pratik Sajnani** - pratik.sajnani@gmail.com

---

© 2025 Adinath Hospital. All rights reserved.
