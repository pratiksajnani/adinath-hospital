# 🧪 ADINATH HOSPITAL - COMPREHENSIVE TEST STRATEGY

## Test Accounts

### Admin
- **Email:** pratik.sajnani@gmail.com
- **Password:** admin123
- **Role:** Site Administrator

### Doctors
- **Dr. Ashok Sajnani:** drsajnani@gmail.com / doctor123
- **Dr. Sunita Sajnani:** sunita.sajnani9@gmail.com / doctor123

### Staff
- **Poonam (Receptionist):** poonam@adinathhealth.com / staff123

### Test Patients (Created during testing)
- **Test Patient 1:** 9876500001 / Ramesh Kumar
- **Test Patient 2:** 9876500002 / Priya Sharma

---

## Test Flows by Role

### 1. PATIENT FLOW 🧑‍🤝‍🧑

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| P1 | Book Appointment | Visit /book.html → Select Dr. Ashok → Pick time → Fill details → Submit | Success message, data saved to HMS |
| P2 | WhatsApp Booking | Click "Book via WhatsApp" | Opens WhatsApp with pre-filled message |
| P3 | Patient Portal Login | Visit /portal/patient/ → Enter phone + name → Login | Shows patient dashboard |
| P4 | View Appointments | Login as patient → Check "My Appointments" | Shows booked appointments |
| P5 | View Prescriptions | Login as patient → Check "My Prescriptions" | Shows any prescriptions |
| P6 | Order Medicines | Click "Order Medicines" → WhatsApp opens | WhatsApp link works |

### 2. STAFF FLOW 💁

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| S1 | Staff Login | Visit /login.html → Enter receptionist email/password → Login | Redirects to staff portal |
| S2 | Send Patient Link | Enter patient name/phone → Click "Send SMS" or "Show QR" | QR code displays, SMS template shown |
| S3 | View Patient Queue | Check "Today's Patient Queue" section | Shows waiting patients |
| S4 | Add to Queue | Enter patient details → Add to queue | Patient appears in queue |
| S5 | Language Toggle | Switch to Gujarati → Check labels | Labels show in Gujarati |

### 3. DOCTOR FLOW 👨‍⚕️

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| D1 | Doctor Login | Visit /login.html → Enter doctor email/password → Login | Redirects to doctor portal |
| D2 | View Appointments | Check "Today's Appointments" | Shows scheduled patients |
| D3 | Simple Dashboard | Visit /portal/doctor/simple.html | Large buttons, easy navigation |
| D4 | Write Prescription | Click "Write Prescription" → Fill form | Prescription saved |
| D5 | Mark Complete | Select patient → Click "Complete" | Status updates |
| D6 | Send SMS | Click "Send SMS" button | SMS preview shown |

### 4. ADMIN FLOW 🔐

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| A1 | Admin Login | Visit /login.html → Enter admin email/password → Login | Redirects to admin portal |
| A2 | View Stats | Check dashboard stats | Shows patient/appointment counts |
| A3 | Manage Users | View user list | Shows all system users |
| A4 | View Alerts | Check alerts section | Shows low stock, pending items |

### 5. FORMS FLOW 📋

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| F1 | Patient Intake | Visit /forms/patient-intake.html → Fill → Print | Printable form |
| F2 | Consent Form | Visit /forms/consent.html → Fill → Print | Printable form |
| F3 | Prescription | Visit /forms/prescription.html → Fill → Print | Printable form |
| F4 | Forms Hub | Visit /forms/index.html | All forms listed |

### 6. CRUD OPERATIONS 🔧

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| C1 | Create Patient | Book appointment with new patient | Patient added to HMS |
| C2 | Create Appointment | Submit booking form | Appointment created |
| C3 | Delete Appointment | Admin cancels appointment | Appointment marked cancelled |
| C4 | Update Patient | Edit patient details | Changes persist |
| C5 | Reset Data | Call HMS.reset() in console | All data reset to defaults |

---

## Browser Console Test Commands

```javascript
// View all users
console.table(HMS.users.getAll());

// View all patients
console.table(HMS.patients.getAll());

// View today's appointments
console.table(HMS.appointments.getByDate(new Date().toISOString().split('T')[0]));

// View all prescriptions
console.table(HMS.prescriptions.getAll());

// View inventory
console.table(HMS.inventory.getAll());

// View sales
console.table(HMS.sales.getAll());

// Test login
HMS.auth.login('drsajnani@gmail.com', 'doctor123');
console.log('Current user:', HMS.auth.getCurrentUser());

// Reset all data (CAUTION!)
// HMS.reset();
```

---

## Automated Test Execution

Run these in browser console on the live site:

```javascript
// Run all tests
runAllTests();
```

