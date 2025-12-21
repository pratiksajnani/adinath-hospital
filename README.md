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

## 📱 Patient Demo Guide

**Quick Link:** https://tinyurl.com/2xj66x22

Or view: [docs/PATIENT_DEMO.html](docs/PATIENT_DEMO.html)

### What Patients Can Try

1. **📅 Book Appointment** → Select doctor → Pick date → Submit
2. **👨‍⚕️ View Doctors** → See Dr. Ashok & Dr. Sunita profiles
3. **🧘 Yoga Classes** → View schedule and photos
4. **💊 Medical Store** → Check pharmacy info
5. **📍 Get Directions** → Opens Google Maps
6. **🌐 Switch Language** → Try EN/हि/ગુ buttons
7. **💬 WhatsApp** → Green button opens chat
8. **📞 Call** → Tap phone number to call

### Patient Demo Checklist

- [ ] Phone numbers work (calls +91 99254 50425)
- [ ] WhatsApp opens chat correctly
- [ ] Google Maps shows right location
- [ ] Booking form submits with confirmation
- [ ] Doctor photos display properly
- [ ] Language switching works
- [ ] Mobile view looks good

---

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
│   └── styles.css          # Main stylesheet (900+ lines)
├── js/
│   ├── config.js           # Environment config
│   ├── main.js             # UI interactions
│   ├── i18n.js             # Translations (EN/HI/GU)
│   └── hms.js              # Hospital Management System
├── portal/
│   ├── index.html          # Portal hub
│   ├── patient/index.html  # Patient dashboard
│   ├── doctor/
│   │   ├── index.html      # Full doctor dashboard
│   │   └── simple.html     # Senior-friendly dashboard
│   ├── staff/index.html    # Staff dashboard
│   └── admin/index.html    # Admin dashboard
├── services/
│   ├── orthopedic.html
│   ├── gynecology.html
│   └── yoga.html
├── forms/
│   ├── index.html          # Forms hub
│   ├── patient-intake.html # Bilingual registration
│   ├── prescription.html   # Rx pad
│   └── consent.html        # Medical consent
├── store/
│   └── index.html          # Store staff dashboard
├── images/                 # All images
├── docs/                   # Documentation
│   ├── SITEADMIN_DEMO.md   # Demo guide (Markdown)
│   └── SITEADMIN_DEMO.html # Demo guide (Printable)
└── tests/
    ├── TEST_STRATEGY.md    # Test cases
    └── test-runner.js      # Automated tests
```

---

## 🚀 Deployment

This site is hosted on **AWS Amplify** with continuous deployment:

1. Push changes to `main` branch
2. AWS Amplify auto-builds (~2 mins)
3. Live at production URL

### Deploy Commands

```bash
# Stage all changes
git add -A

# Commit with message
git commit -m "Your commit message"

# Push to trigger deployment
git push origin main
```

---

## ⚠️ Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| `/login.html` redirects to homepage | 🔴 Open | AWS Amplify rewrite config |
| `/portal/staff/` redirects | 🔴 Open | Same as above |
| Missing i18n translations | 🟡 Partial | ~40 keys need translation |

---

## 📝 To-Do

- [ ] Fix AWS Amplify redirect rules
- [ ] Complete Hindi/Gujarati translations
- [ ] Add Poonam's phone number
- [ ] Add real hospital photos
- [ ] Integrate real SMS service
- [ ] Cloud database migration

---

## 📞 Support

For technical issues, contact:
- **Pratik Sajnani** - pratik.sajnani@gmail.com

---

© 2025 Adinath Hospital. All rights reserved.
