# 🏥 ADINATH HOSPITAL - SITE ADMIN DEMO GUIDE

> **Live Site:** https://adinathhealth.com/
> **Last Updated:** December 20, 2025

---

## 🔐 LOGIN CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| **Site Admin** | pratik.sajnani@gmail.com | 1234 |
| **Dr. Ashok** | drsajnani@gmail.com | doctor123 |
| **Dr. Sunita** | sunita.sajnani9@gmail.com | doctor123 |
| **Poonam (Receptionist)** | reception@adinathhealth.com | staff123 |

---

## 📋 DEMO WALKTHROUGH

### 1. HOMEPAGE TOUR (5 mins)
- [ ] Visit: https://adinathhealth.com/
- [ ] Click language toggle (EN → हिंदी → ગુજરાતી)
- [ ] Click "Services" dropdown → See all services
- [ ] Click "Doctors" dropdown → See doctor profiles
- [ ] Scroll to see: Services, Doctors, Yoga, Dr. Ashok's Corner
- [ ] Click WhatsApp floating button
- [ ] Click "Book Appointment" button

### 2. BOOK AN APPOINTMENT (3 mins)
- [ ] Visit: https://adinathhealth.com/book.html
- [ ] Select Dr. Ashok (Orthopedic)
- [ ] Pick a date and time slot
- [ ] Fill patient details:
  - Name: Test Patient
  - Phone: 9876543210
  - Age: 45
  - Reason: Knee pain
- [ ] Click "Book Appointment"
- [ ] See confirmation message

### 3. PORTAL HUB (2 mins)
- [ ] Visit: https://adinathhealth.com/portal/index.html
- [ ] See all portal options:
  - Patient Portal
  - Doctor Dashboard (Simple)
  - Staff Portal
  - Admin Portal
  - Medical Store
  - Printable Forms

### 4. DOCTOR DASHBOARD - SIMPLE VIEW (5 mins)
- [ ] Visit: https://adinathhealth.com/portal/doctor/simple.html
- [ ] Large buttons designed for seniors (60+ years)
- [ ] Click "Next Patient" → See patient info
- [ ] Click "Write Prescription" → Opens prescription form
- [ ] Click "Send SMS" → See SMS preview
- [ ] Click "Forms" → Access printable forms

### 5. PATIENT PORTAL (3 mins)
- [ ] Visit: https://adinathhealth.com/portal/patient/index.html
- [ ] Enter phone: 9876543210
- [ ] Enter name: Test Patient
- [ ] Click Login
- [ ] See: My Appointments, My Prescriptions, Profile

### 6. PRINTABLE FORMS (5 mins)
- [ ] Visit: https://adinathhealth.com/forms/index.html
- [ ] Click "Patient Registration" → Bilingual form (EN + ગુજરાતી)
- [ ] Click "Consent Form" → Medical consent
- [ ] Click "Prescription Pad" → Doctor's Rx form
- [ ] Try "Print Form" button on any form

### 7. MEDICAL STORE (3 mins)
- [ ] Visit: https://adinathhealth.com/store.html
- [ ] See store info: hours, contact, ordering
- [ ] Click "Order via WhatsApp"
- [ ] Visit store dashboard: https://adinathhealth.com/store/index.html
- [ ] See: Inventory, Sales, Patient Queue, Print Queue

### 8. SERVICE PAGES (5 mins)
- [ ] Orthopedic: https://adinathhealth.com/services/orthopedic.html
- [ ] Gynecology: https://adinathhealth.com/services/gynecology.html
- [ ] Yoga Classes: https://adinathhealth.com/services/yoga.html
  - See yoga gallery photos
  - Book yoga class button

### 9. ADMIN FEATURES (Console Commands)
Open browser console (F12) and run:

```javascript
// Initialize/Reset data
HMS.reset();

// View all users
console.table(HMS.users.getAll());

// View all patients
console.table(HMS.patients.getAll());

// Create test patient
HMS.patients.add({
    name: 'Demo Patient',
    phone: '9999888877',
    age: 35,
    gender: 'male'
});

// Create appointment
HMS.appointments.add({
    patientId: 'P001',
    patientName: 'Demo Patient',
    doctor: 'ashok',
    date: '2025-12-25',
    time: '11:30 AM',
    reason: 'Knee checkup'
});

// View inventory
console.table(HMS.inventory.getAll());

// Generate patient signup link
HMS.patientLinks.generate({
    phone: '9876500001',
    name: 'New Patient'
}, 'U005');
```

---

## 📱 MOBILE TESTING

1. Open site on phone or resize browser to 375px width
2. Test hamburger menu (☰)
3. Test all buttons are tap-friendly
4. Test form inputs work on mobile keyboard

---

## 🌐 MULTILINGUAL TESTING

| Page | Hindi | Gujarati |
|------|-------|----------|
| Homepage | ✅ | ✅ |
| Booking | ✅ | ✅ |
| Forms | ✅ | ✅ |
| Patient Portal | ✅ | ✅ |

---

## ⚠️ KNOWN ISSUES

1. **Login page redirect** - `/login.html` redirects to homepage (AWS Amplify config issue)
2. **Missing translations** - Some i18n keys not yet translated
3. **Staff portal redirect** - Same issue as login page

---

## 📞 HOSPITAL CONTACT

- **Phone:** +91 99254 50425
- **Address:** 2nd Floor, Shukan Mall, Shahibaug Rd, Ahmedabad
- **Hours:** 11 AM - 7 PM (No emergencies)
- **WhatsApp:** Same as phone

---

## 🔗 QUICK LINKS

| Page | URL |
|------|-----|
| Homepage | `/` |
| Book Appointment | `/book.html` |
| Portal Hub | `/portal/index.html` |
| Doctor Dashboard | `/portal/doctor/simple.html` |
| Patient Portal | `/portal/patient/index.html` |
| Forms | `/forms/index.html` |
| Medical Store | `/store.html` |
| Yoga Classes | `/services/yoga.html` |

---

*Created by Pratik Sajnani for Adinath Hospital*

