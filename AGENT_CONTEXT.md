# Adinath Hospital - Agent Context Document

## Project Overview
Mid-size hospital website in Ahmedabad, India. Hospital Management System (HMS) with public website, patient portal, doctor/staff dashboards.

## Repository
- GitHub: https://github.com/pratiksajnani/adinath-hospital
- Live URL: https://main.d2a0i6erg1hmca.amplifyapp.com/
- Hosting: AWS Amplify (auto-deploys from main branch)

## Tech Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript (NO frameworks)
- **Database:** localStorage (client-side, via js/hms.js)
- **Styling:** CSS variables in css/styles.css
- **i18n:** English, Hindi, Gujarati (js/i18n.js)

## Key People
| Role | Name | Email | Notes |
|------|------|-------|-------|
| Site Admin | Pratik Sajnani | pratik.sajnani@gmail.com | Son, manages website |
| Doctor | Dr. Ashok Sajnani | drsajnani@gmail.com | Orthopedic, 35+ years, 60s |
| Doctor | Dr. Sunita Sajnani | sunita.sajnani9@gmail.com | OB-GYN, 30+ years, 60s |
| Receptionist | Poonam | - | Male, front desk |

## Contact Numbers
- Hospital: +91 99254 50425
- WhatsApp: Same number

## Hospital Details
- **Name:** Adinath Hospital
- **Address:** 2nd Floor, Shukan Mall, Shahibaug Road, Ahmedabad 380004
- **Hours:** 11 AM - 7 PM (Mon-Sat)
- **Specialties:** Orthopedic, Gynecology, Yoga Classes

## File Structure
```
/
├── index.html          # Homepage
├── book.html           # Appointment booking
├── login.html          # Staff/Doctor login
├── store.html          # Public pharmacy page
├── 404.html            # Error page
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   ├── config.js       # Base URL config
│   ├── main.js         # General JS
│   ├── i18n.js         # Translations
│   └── hms.js          # Hospital Management System (localStorage DB)
├── images/             # All images
├── forms/              # Printable forms
│   ├── index.html      # Forms hub
│   ├── patient-intake.html
│   ├── prescription.html
│   └── consent.html
├── portal/             # Internal dashboards
│   ├── index.html      # Portal hub
│   ├── patient/        # Patient portal
│   ├── doctor/         # Doctor dashboards
│   ├── staff/          # Staff dashboard
│   └── admin/          # Admin dashboard
├── services/           # Service detail pages
│   ├── orthopedic.html
│   ├── gynecology.html
│   └── yoga.html
└── store/              # Medical store dashboard
    └── index.html
```

## CSS Variables (use these!)
```css
:root {
    --primary: #0f766e;
    --primary-dark: #0d6960;
    --primary-50: #f0fdfa;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-600: #475569;
    --gray-800: #1e293b;
    --white: #ffffff;
    --radius: 8px;
    --radius-lg: 16px;
    --shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

## HMS API (js/hms.js)
```javascript
// Patients
HMS.patients.getAll()
HMS.patients.getById(id)
HMS.patients.add({ name, phone, age, gender })

// Appointments
HMS.appointments.getAll()
HMS.appointments.getByDate(date)
HMS.appointments.add({ patientId, doctor, date, time, reason })

// Prescriptions
HMS.prescriptions.getAll()
HMS.prescriptions.getByPatient(patientId)
HMS.prescriptions.add({ patientId, doctor, medicines, diagnosis })

// Inventory (Medical Store)
HMS.inventory.getAll()
HMS.inventory.update(id, { stock })

// Queue
HMS.queue.getAll()
HMS.queue.add({ patientId, doctor, status })
```

## i18n Usage
```html
<!-- In HTML -->
<h1 data-i18n="hero_title">Your Health, Our Priority</h1>

<!-- In JS -->
I18N.t('nav_home')  // Returns translated string
I18N.setLanguage('hi')  // Switch to Hindi
```

## Coding Conventions
1. Use semantic HTML5 elements
2. Mobile-first responsive design
3. No external dependencies (except Google Fonts)
4. Inline styles OK for one-off cases
5. Comments in English
6. Use emojis for visual icons where appropriate

## Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Commit: `git commit -m "Feature: description"`
4. Push: `git push origin feature/your-feature`
5. Notify coordinator to merge

## Testing
- Local: `python3 -m http.server 8080`
- Live: Changes auto-deploy in ~2 minutes after push to main

---

# WORK STREAMS

## Stream 1: Public Website (index.html, css/, new pages)
- Google Reviews widget
- FAQ accordion
- Floating Book Now button
- Trust badges
- Accessibility toggle
- Blog page

## Stream 2: Patient Portal (portal/patient/*)
- Enhanced patient dashboard
- Prescription downloads
- Health tracker
- Symptom checker
- Feedback form

## Stream 3: Doctor & Staff Dashboards (portal/doctor/*, portal/staff/*, portal/admin/*)
- Senior-friendly doctor UI
- Queue management
- Video content upload
- Statistics dashboard

## Stream 4: Forms & Medical Store (forms/*, store/*)
- Enhanced printable forms
- Discharge summary
- Referral letters
- Billing system
- UPI payments

---

## DO NOT
- Add npm/node dependencies
- Use React/Vue/Angular
- Modify other agents' assigned files
- Use fake patient/staff names
- Add paid services without approval
