# 🤖 ADINATH HOSPITAL - AI AGENT CONTEXT FILE

> This file helps AI agents understand the project, current state, and pending tasks.  
> **Last Updated:** December 20, 2025

---

## 📋 PROJECT OVERVIEW

**Adinath Hospital** is a comprehensive hospital management system for a mid-size hospital in Ahmedabad, India, owned by Dr. Ashok Sajnani (Orthopedic) and Dr. Sunita Sajnani (OB-GYN).

### Tech Stack
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript
- **Data:** localStorage-based HMS (Hospital Management System) - see `js/hms.js`
- **Hosting:** AWS Amplify (auto-deploys from GitHub)
- **Live URL:** https://adinathhealth.com/

### Key Files
| File | Purpose |
|------|---------|
| `js/hms.js` | Hospital Management System - localStorage "database" |
| `js/i18n.js` | Multilingual support (EN/HI/GU) |
| `js/config.js` | Base URL configuration |
| `js/main.js` | UI interactions, service worker |
| `tests/test-runner.js` | Automated test suite |
| `tests/TEST_STRATEGY.md` | Manual test cases |

---

## 👥 REAL PEOPLE IN SYSTEM

### ✅ CONFIRMED ACCOUNTS
| Role | Name | Email | Phone |
|------|------|-------|-------|
| **Site Admin** | Pratik Sajnani | pratik.sajnani@gmail.com | - |
| **Doctor** | Dr. Ashok Sajnani | drsajnani@gmail.com | 9925450425 |
| **Doctor** | Dr. Sunita Sajnani | sunita.sajnani9@gmail.com | 9925450425 |
| **Receptionist** | Poonam (male) | poonam@adinathhealth.com | ❓ Need |

### ❌ FAKE DATA REMOVED
- ~~Priya Patel (fake receptionist)~~
- ~~Kavita Sharma (fake nurse)~~
- ~~Rahul Mehta (fake pharmacist)~~

### ⏳ NEED REAL DATA FROM USER
- [ ] Poonam's phone number
- [ ] Any other staff members?
- [ ] Nurse details (if any)
- [ ] Pharmacist details (if any)

---

## 📝 TODO LIST

### 🔴 HIGH PRIORITY - Testing & Validation
- [ ] **P1:** Run full test suite on live site
- [ ] **P2:** Test Patient Flow: Book appointment → view portal → check status
- [ ] **P3:** Test Staff Flow: Login → send patient links → manage queue
- [ ] **P4:** Test Doctor Flow: View appointments → write prescriptions → SMS
- [ ] **P5:** Test Admin Flow: View stats → manage users → content
- [ ] **P6:** Test all printable forms (patient intake, consent, prescription)
- [ ] **P7:** Test CRUD operations (create/delete accounts, data persistence)

### 🟡 MEDIUM PRIORITY - Fixes Found
- [x] ~~Fix HMS data seeding - users weren't being saved to localStorage~~
- [x] ~~Fix service worker path~~
- [x] ~~Fix mobile hero section spacing~~
- [ ] Test language switching works on all pages
- [ ] Verify QR codes generate correctly for patient links
- [ ] Test SMS templates in all 3 languages

### 🟢 LOW PRIORITY - Future Enhancements
- [ ] Add real photos for staff (when provided)
- [ ] Add more inventory items to HMS
- [ ] Integrate real SMS service (MSG91 / Twilio)
- [ ] Add real payment gateway
- [ ] Mobile app (QR-accessible forms)
- [ ] Cloud database migration (Supabase/Firebase)

---

## 🧪 TEST COMMANDS

Run these in browser console at https://adinathhealth.com/

```javascript
// 1. Reset and reinitialize HMS data
HMS.reset();

// 2. View all accounts
console.table(HMS.users.getAll());

// 3. Test login
HMS.auth.login('drsajnani@gmail.com', 'doctor123');
console.log('Logged in as:', HMS.auth.getCurrentUser().name);

// 4. Create a test patient
const patient = HMS.patients.add({
    name: 'Test Kumar',
    phone: '9999999999',
    age: 40,
    gender: 'male'
});
console.log('Created patient:', patient);

// 5. Book an appointment
const appt = HMS.appointments.add({
    patientId: patient.id,
    patientName: patient.name,
    doctor: 'ashok',
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    reason: 'Knee pain'
});
console.log('Booked appointment:', appt);

// 6. Generate patient signup link
const link = HMS.patientLinks.generate({
    phone: '9876543210',
    name: 'New Patient'
}, 'U005');
console.log('Patient link:', link);
```

---

## 🔗 KEY PAGES TO TEST

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Public landing page |
| Book Appointment | `/book.html` | Patient booking |
| Login | `/login.html` | Staff/Doctor login |
| Portal Hub | `/portal/index.html` | Navigation to all portals |
| Patient Portal | `/portal/patient/index.html` | Patient dashboard |
| Doctor Dashboard | `/portal/doctor/simple.html` | Easy doctor interface |
| Staff Portal | `/portal/staff/index.html` | Staff queue management |
| Admin Portal | `/portal/admin/index.html` | System administration |
| Printable Forms | `/forms/index.html` | All printable forms |
| Medical Store | `/store.html` | Public pharmacy info |
| Store Dashboard | `/store/index.html` | Staff inventory/sales |

---

## 🔐 LOGIN CREDENTIALS (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | pratik.sajnani@gmail.com | admin123 |
| Doctor | drsajnani@gmail.com | doctor123 |
| Doctor | sunita.sajnani9@gmail.com | doctor123 |
| Staff | poonam@adinathhealth.com | staff123 |

---

## 📁 PROJECT STRUCTURE

```
adinath-hospital/
├── index.html          # Homepage
├── book.html           # Appointment booking
├── login.html          # Staff/Doctor login
├── store.html          # Public pharmacy page
├── 404.html            # Custom 404 page
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── config.js       # Base URL config
│   ├── hms.js          # Hospital Management System
│   ├── i18n.js         # Translations
│   └── main.js         # UI logic
├── portal/
│   ├── index.html      # Portal hub
│   ├── patient/        # Patient portal
│   ├── doctor/         # Doctor dashboards
│   ├── staff/          # Staff portal
│   └── admin/          # Admin dashboard
├── forms/
│   ├── index.html      # Forms hub
│   ├── patient-intake.html
│   ├── prescription.html
│   └── consent.html
├── services/
│   ├── orthopedic.html
│   ├── gynecology.html
│   └── yoga.html
├── store/
│   └── index.html      # Store dashboard (staff)
├── tests/
│   ├── TEST_STRATEGY.md
│   └── test-runner.js
├── images/             # All images
├── docs/               # Documentation
└── AGENT.md            # THIS FILE
```

---

## 🎯 CURRENT SESSION GOALS

1. **Test all flows** from each user perspective (patient, staff, doctor, admin)
2. **Identify and fix** any broken functionality
3. **Validate** HMS data persistence works correctly
4. **Demo-ready** state for showing to hospital owners (parents)

---

## 📞 HOSPITAL CONTACT INFO

- **Hospital:** Adinath Hospital
- **Address:** 2nd Floor, Shukan Mall, Shahibaug Rd, near Rajasthan Hospital, Ahmedabad 380004
- **Phone:** +91 99254 50425
- **Hours:** 11 AM - 7 PM (does NOT take emergencies)
- **Website:** https://adinathhealth.com/

---

## 🚀 NEXT AGENT ACTIONS

1. Navigate to live site
2. Run `HMS.reset()` in console to reinitialize data
3. Execute tests from `tests/test-runner.js`
4. Fix any failures
5. Test each user role flow manually
6. Push fixes and verify deployment

