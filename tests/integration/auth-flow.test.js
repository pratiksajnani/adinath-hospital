/**
 * Authentication Flow Integration Tests
 * Tests the complete auth flow across HMS modules
 */

// Setup mocks
global.window = { location: { hostname: 'localhost', pathname: '/' } };
global.document = { addEventListener: jest.fn() };
global.alert = jest.fn();

const HMS = require('../../js/hms.js');

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    HMS.init();
  });

  describe('User Registration to Login Flow', () => {
    test('should register new patient and allow login', () => {
      // Register (signup takes an object, not positional args)
      const signupResult = HMS.auth.signup({
        email: 'newpatient@test.com',
        password: 'password123',
        role: 'patient',
        name: 'New Patient',
      });
      expect(signupResult.success).toBe(true);

      // Logout
      HMS.auth.logout();
      expect(HMS.auth.isLoggedIn()).toBe(false);

      // Login with new credentials
      const loginResult = HMS.auth.login('newpatient@test.com', 'password123');
      expect(loginResult.success).toBe(true);
      expect(HMS.auth.getCurrentUser().email).toBe('newpatient@test.com');
    });

    test('should prevent duplicate email registration', () => {
      // First registration
      HMS.auth.signup({
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'patient',
        name: 'First',
      });

      // Second registration with same email
      const result = HMS.auth.signup({
        email: 'duplicate@test.com',
        password: 'password456',
        role: 'patient',
        name: 'Second',
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain('already');
    });
  });

  describe('Role-Based Access', () => {
    test('admin should have admin role', () => {
      const result = HMS.auth.login('pratik.sajnani@gmail.com', '1234');

      expect(result.success).toBe(true);
      expect(HMS.auth.isAdmin()).toBe(true);
      expect(HMS.auth.isDoctor()).toBe(false);
    });

    test('doctor should have doctor role', () => {
      const result = HMS.auth.login('drsajnani@gmail.com', 'doctor123');

      expect(result.success).toBe(true);
      expect(HMS.auth.isDoctor()).toBe(true);
      expect(HMS.auth.isAdmin()).toBe(false);
    });

    test('staff should have staff role', () => {
      const result = HMS.auth.login('reception@adinathhealth.com', 'staff123');

      expect(result.success).toBe(true);
      expect(HMS.auth.getCurrentUser().role).toBe('receptionist');
    });

    test('username login should work for admin', () => {
      const result = HMS.auth.login('psaj', '1234');

      expect(result.success).toBe(true);
      expect(HMS.auth.isAdmin()).toBe(true);
    });
  });

  describe('Session Persistence', () => {
    test('should persist session across page loads', () => {
      // Login
      HMS.auth.login('drsajnani@gmail.com', 'doctor123');

      // Simulate page reload by checking localStorage
      expect(localStorage.getItem('hms_logged_in')).toBe('true');
      const storedUser = JSON.parse(localStorage.getItem('hms_current_user'));
      expect(storedUser.role).toBe('doctor');
      expect(storedUser.email).toBe('drsajnani@gmail.com');
    });

    test('should restore session from localStorage', () => {
      // Set up session manually with a valid user JSON object
      const mockUser = {
        id: 'U002',
        email: 'drsajnani@gmail.com',
        name: 'Dr. Ashok',
        role: 'doctor',
      };
      localStorage.setItem('hms_logged_in', 'true');
      localStorage.setItem('hms_current_user', JSON.stringify(mockUser));

      // Reset in-memory cache so it reads from localStorage
      HMS.auth.currentUser = null;

      // Check if auth recognizes session
      expect(HMS.auth.isLoggedIn()).toBe(true);
      expect(HMS.auth.getCurrentUser().email).toBe('drsajnani@gmail.com');
    });
  });

  describe('Logout Flow', () => {
    test('should clear all session data on logout', () => {
      // Login first
      HMS.auth.login('drsajnani@gmail.com', 'doctor123');
      expect(HMS.auth.isLoggedIn()).toBe(true);

      // Logout
      HMS.auth.logout();

      // Verify all cleared
      expect(HMS.auth.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('hms_logged_in')).toBeNull();
      expect(localStorage.getItem('hms_current_user')).toBeNull();
    });
  });
});

describe('Patient Data Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    HMS.init();
    HMS.auth.login('reception@adinathhealth.com', 'staff123');
  });

  describe('Patient Registration and Appointment Booking', () => {
    test('should create patient and book appointment', () => {
      // Create patient
      const patient = HMS.patients.add({
        name: 'Test Patient',
        phone: '+919999999999',
        email: 'patient@test.com',
      });

      expect(patient).toBeDefined();
      expect(patient.id).toBeDefined();

      // Book appointment
      const appointment = HMS.appointments.add({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: 'U002',
        doctorName: 'Dr. Ashok Sajnani',
        date: '2025-01-15',
        time: '10:00',
        type: 'consultation',
      });

      expect(appointment).toBeDefined();
      expect(appointment.patientId).toBe(patient.id);
      // appointments.add() sets status to 'pending'
      expect(appointment.status).toBe('pending');
    });

    test('should link prescription to patient and appointment', () => {
      // Create patient
      const patient = HMS.patients.add({
        name: 'Prescription Test Patient',
      });

      // Book appointment
      const appointment = HMS.appointments.add({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: 'U002',
        date: '2025-01-15',
        time: '10:00',
      });

      // Doctor logs in
      HMS.auth.login('drsajnani@gmail.com', 'doctor123');

      // Write prescription
      const prescription = HMS.prescriptions.add({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: 'U002',
        doctorName: 'Dr. Ashok Sajnani',
        appointmentId: appointment.id,
        medications: [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'twice daily' },
        ],
        notes: 'Take after meals',
      });

      expect(prescription).toBeDefined();
      expect(prescription.patientId).toBe(patient.id);
      expect(prescription.appointmentId).toBe(appointment.id);

      // Verify prescription is linked to patient
      const patientPrescriptions = HMS.prescriptions.getByPatient(patient.id);
      expect(patientPrescriptions.length).toBe(1);
    });
  });

  describe('Queue Management Flow', () => {
    test('should add patient to queue and process', () => {
      // Create patient
      const patient = HMS.patients.add({ name: 'Queue Test Patient' });

      // Add to queue
      const queueEntry = HMS.queue.add({
        patientId: patient.id,
        patientName: patient.name,
        type: 'consultation',
      });

      expect(queueEntry).toBeDefined();
      expect(HMS.queue.getAll().length).toBeGreaterThan(0);

      // Get first in queue (no getNext method — use getAll()[0])
      const next = HMS.queue.getAll()[0];
      expect(next).toBeDefined();
      expect(next.patientName).toBe('Queue Test Patient');

      // Process and remove from queue
      HMS.queue.remove(queueEntry.id);

      const remaining = HMS.queue
        .getAll()
        .filter((q) => q.id === queueEntry.id);
      expect(remaining.length).toBe(0);
    });
  });
});

describe('Inventory and Sales Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    HMS.init();
    HMS.auth.login('reception@adinathhealth.com', 'staff123');
  });

  describe('Medicine Stock to Sale Flow', () => {
    test('should track inventory through sale', () => {
      // Add medicine to inventory (use 'stock' field, matching HMS convention)
      const medicine = HMS.inventory.add({
        name: 'Test Medicine',
        stock: 100,
        price: 50,
        batchNo: 'BATCH001',
      });

      expect(medicine).toBeDefined();
      expect(medicine.stock).toBe(100);

      // Make a sale
      const sale = HMS.sales.add({
        items: [
          {
            medicineId: medicine.id,
            name: medicine.name,
            quantity: 5,
            price: 50,
          },
        ],
        total: 250,
        patientId: 'P001',
      });

      expect(sale).toBeDefined();
      expect(sale.total).toBe(250);

      // Update inventory using updateStock (not update)
      HMS.inventory.updateStock(medicine.id, 5, 'subtract');

      const updatedMedicine = HMS.inventory.get(medicine.id);
      expect(updatedMedicine.stock).toBe(95);
    });
  });
});

describe('Feedback System Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    HMS.init();
  });

  describe('Feedback Collection and Analysis', () => {
    test('should collect feedback from different roles', () => {
      // Guest feedback
      HMS.feedback.add({
        type: 'question',
        description: 'How do I book?',
        role: 'guest',
      });

      // Patient feedback
      HMS.feedback.add({
        type: 'bug',
        description: 'Page not loading',
        role: 'patient',
      });

      // Doctor feedback
      HMS.auth.login('drsajnani@gmail.com', 'doctor123');
      HMS.feedback.add({
        type: 'feature',
        description: 'Need faster search',
        role: 'doctor',
      });

      // Admin should see all feedback
      HMS.auth.login('pratik.sajnani@gmail.com', '1234');
      const allFeedback = HMS.feedback.getAll();

      expect(allFeedback.length).toBe(3);

      // Stats should aggregate correctly
      const stats = HMS.feedback.stats();
      expect(stats.byType.bug).toBe(1);
      expect(stats.byType.feature).toBe(1);
      expect(stats.byType.question).toBe(1);
    });
  });
});
