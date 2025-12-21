# 🏥 Adinath Hospital Website

Official website for Adinath Hospital, Ahmedabad - A comprehensive Hospital Management System.

## 🌐 Live Website

**Production:** https://adinathhealth.com/ *(Domain live in 10-48 hours)*

**Staging:** https://main.d2a0i6erg1hmca.amplifyapp.com/

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
| Full Guide | [docs/doctor-demo-guide.html](docs/doctor-demo-guide.html) |
| CRUD Operations | View appointments, Write prescriptions, Update status, Send messages |

### 👩‍💼 Staff Demo Guide

| Resource | Link |
|----------|------|
| **TinyURL** | https://tinyurl.com/staff-demo |
| Full Guide | [docs/staff-demo-guide.html](docs/staff-demo-guide.html) |
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
| Full Guide (HTML) | [docs/SITEADMIN_DEMO.html](docs/SITEADMIN_DEMO.html) |
| Full Guide (MD) | [docs/SITEADMIN_DEMO.md](docs/SITEADMIN_DEMO.md) |
| CRUD Operations | Full access to all data, Manage appointments, Manage patients, Reset demo

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Site Admin** | pratik.sajnani@gmail.com | admin123 |
| **Doctor (Dr. Ashok)** | drsajnani@gmail.com | doctor123 |
| **Doctor (Dr. Sunita)** | sunita.sajnani9@gmail.com | doctor123 |
| **Receptionist (Poonam)** | receptionist@adinathhospital.com | staff123 |

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

## ⚠️ Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| `/login.html` redirects to homepage | 🔴 Open | AWS Amplify rewrite config |
| `/portal/staff/` redirects | 🔴 Open | Same as above |
| Missing i18n translations | 🟡 Partial | ~40 keys need translation |

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
