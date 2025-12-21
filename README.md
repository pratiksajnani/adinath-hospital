# Adinath Hospital Website

Official website for Adinath Hospital, Ahmedabad.

## 🌐 Live Website

**Production:** https://main.d2a0i6erg1hmca.amplifyapp.com/

## 📋 Staff Demo Guide

**Quick Link:** https://tinyurl.com/25nh8yqj

Or view the full guide: [docs/staff-demo-guide.html](docs/staff-demo-guide.html)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Site Admin** | pratik.sajnani@gmail.com | admin123 |
| **Doctor (Dr. Ashok)** | drsajnani@gmail.com | doctor123 |
| **Doctor (Dr. Sunita)** | sunita.sajnani9@gmail.com | doctor123 |
| **Staff (Poonam)** | poonam@adinathhospital.com | staff123 |

### Quick Links

| Page | URL |
|------|-----|
| Homepage | `/` |
| Book Appointment | `/book.html` |
| Staff Login | `/login.html` |
| Doctor Dashboard (Simple) | `/portal/doctor/simple.html` |
| Staff Dashboard | `/portal/staff/index.html` |
| Admin Dashboard | `/portal/admin/index.html` |
| Medical Store | `/store.html` |
| Printable Forms | `/forms/index.html` |

## About

**Adinath Hospital** is a mid-size hospital located in Shahibaug, Ahmedabad, Gujarat, India.

### Doctors

- **Dr. Ashok Sajnani** - Consultant Orthopedic & Joint Surgeon (35+ years)
- **Dr. Sunita Sajnani** - MD Obstetrics & Gynecology (30+ years)

### Contact Information

- **Address:** 2nd Floor, Shukan Mall, Shahibaug Rd., Ahmedabad, Gujarat 380004
- **Phone:** +91 99254 50425
- **WhatsApp:** +91 99254 50425

## Development

```bash
# Start local server
python3 -m http.server 8080

# Or with Node.js
npx serve
```

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Database:** localStorage (client-side mock)
- **Hosting:** AWS Amplify (auto-deploys from main branch)
- **Languages:** English, Hindi, Gujarati

## Project Structure

```
├── index.html          # Homepage
├── book.html           # Appointment booking
├── login.html          # Staff/Doctor login
├── store.html          # Public pharmacy page
├── css/styles.css      # Main stylesheet
├── js/
│   ├── config.js       # Base URL config
│   ├── main.js         # General JS
│   ├── i18n.js         # Translations
│   └── hms.js          # Hospital Management System
├── portal/             # Internal dashboards
│   ├── patient/        # Patient portal
│   ├── doctor/         # Doctor dashboards
│   ├── staff/          # Staff dashboard
│   └── admin/          # Admin dashboard
├── services/           # Service detail pages
├── forms/              # Printable forms
└── docs/               # Documentation
```

## Deployment

This site is hosted on AWS Amplify with auto-deploy from the `main` branch.

Changes pushed to GitHub → Deployed in ~2 minutes.

---

© 2025 Adinath Hospital. All rights reserved.
