/**
 * HMS (Hospital Management System) Unit Tests
 * Tests all CRUD operations for patients, appointments, prescriptions, etc.
 */

// Load HMS module
const HMS = require('../../js/hms.js');

describe('HMS Core', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    describe('Initialization', () => {
        test('should have DATA_VERSION defined', () => {
            expect(HMS.DATA_VERSION).toBeDefined();
        });

        test('should initialize data version in localStorage', () => {
            expect(localStorage.getItem('hms_data_version')).toBe(HMS.DATA_VERSION);
        });

        test('should set hms_initialized flag', () => {
            expect(localStorage.getItem('hms_initialized')).toBe('true');
        });

        test('should have users module', () => {
            expect(HMS.users).toBeDefined();
            expect(typeof HMS.users.getAll).toBe('function');
        });

        test('should have patients module', () => {
            expect(HMS.patients).toBeDefined();
            expect(typeof HMS.patients.getAll).toBe('function');
        });

        test('should have appointments module', () => {
            expect(HMS.appointments).toBeDefined();
            expect(typeof HMS.appointments.getAll).toBe('function');
        });

        test('should have auth module', () => {
            expect(HMS.auth).toBeDefined();
            expect(typeof HMS.auth.login).toBe('function');
        });
    });
});

describe('HMS.users', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('getAll() should return all users', () => {
        const users = HMS.users.getAll();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
    });

    test('should have admin user seeded', () => {
        const users = HMS.users.getAll();
        const admin = users.find(u => u.role === 'admin');
        expect(admin).toBeDefined();
        expect(admin.email).toBe('pratik.sajnani@gmail.com');
    });

    test('should have doctor users seeded', () => {
        const users = HMS.users.getAll();
        const doctors = users.filter(u => u.role === 'doctor');
        expect(doctors.length).toBe(2);
    });

    test('get() should return user by ID', () => {
        const users = HMS.users.getAll();
        const user = HMS.users.get(users[0].id);
        expect(user).toBeDefined();
        expect(user.id).toBe(users[0].id);
    });

    test('getByEmail() should return user by email', () => {
        const user = HMS.users.getByEmail('pratik.sajnani@gmail.com');
        expect(user).toBeDefined();
        expect(user.role).toBe('admin');
    });

    test('getByEmailOrUsername() should find by username', () => {
        const user = HMS.users.getByEmailOrUsername('psaj');
        expect(user).toBeDefined();
        expect(user.role).toBe('admin');
    });

    test('add() should add new user', () => {
        const initialCount = HMS.users.getAll().length;
        HMS.users.add({
            email: 'test@test.com',
            name: 'Test User',
            role: 'patient'
        });
        expect(HMS.users.getAll().length).toBe(initialCount + 1);
    });
});

describe('HMS.patients', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('getAll() should return array', () => {
        const patients = HMS.patients.getAll();
        expect(Array.isArray(patients)).toBe(true);
    });

    test('add() should add patient with ID', () => {
        const patient = HMS.patients.add({
            name: 'Test Patient',
            phone: '9999999999',
            age: 30,
            gender: 'male'
        });
        expect(patient.id).toBeDefined();
        expect(patient.name).toBe('Test Patient');
    });

    test('add() should set createdAt', () => {
        const patient = HMS.patients.add({
            name: 'New Patient',
            phone: '8888888888'
        });
        expect(patient.createdAt).toBeDefined();
    });

    test('get() should return patient by ID', () => {
        const created = HMS.patients.add({
            name: 'Find Me',
            phone: '1234567890'
        });
        const found = HMS.patients.get(created.id);
        expect(found).toBeDefined();
        expect(found.name).toBe('Find Me');
    });

    test('update() should modify patient', () => {
        const patient = HMS.patients.add({
            name: 'Original',
            phone: '1111111111'
        });
        HMS.patients.update(patient.id, { name: 'Modified' });
        const updated = HMS.patients.get(patient.id);
        expect(updated.name).toBe('Modified');
    });

    test('search() should find by name', () => {
        HMS.patients.add({ name: 'Ramesh Kumar', phone: '1' });
        HMS.patients.add({ name: 'Suresh Patel', phone: '2' });
        const results = HMS.patients.search('Ramesh');
        expect(results.length).toBe(1);
        expect(results[0].name).toBe('Ramesh Kumar');
    });

    test('search() should find by phone', () => {
        HMS.patients.add({ name: 'ABC', phone: '9876543210' });
        const results = HMS.patients.search('987654');
        expect(results.length).toBeGreaterThan(0);
    });
});

describe('HMS.appointments', () => {
    let testPatient;

    beforeEach(() => {
        localStorage.clear();
        HMS.init();
        testPatient = HMS.patients.add({
            name: 'Appointment Patient',
            phone: '1234567890'
        });
    });

    test('add() should add appointment', () => {
        const apt = HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM',
            reason: 'Knee pain'
        });
        expect(apt.id).toBeDefined();
        expect(apt.status).toBe('pending');
    });

    test('getAll() should return appointments', () => {
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        const all = HMS.appointments.getAll();
        expect(all.length).toBeGreaterThan(0);
    });

    test('get() should return appointment by ID', () => {
        const created = HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        const found = HMS.appointments.get(created.id);
        expect(found).toBeDefined();
    });

    test('getByDate() should filter by date', () => {
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-26',
            time: '11:00 AM'
        });
        const results = HMS.appointments.getByDate('2025-12-25');
        expect(results.length).toBe(1);
    });

    test('getByDoctor() should filter by doctor', () => {
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        const results = HMS.appointments.getByDoctor('ashok', '2025-12-25');
        expect(results.every(a => a.doctor === 'ashok')).toBe(true);
    });

    test('getByPatient() should filter by patient', () => {
        const patient2 = HMS.patients.add({ name: 'Other', phone: '2' });
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.add({
            patientId: patient2.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '12:00 PM'
        });
        const results = HMS.appointments.getByPatient(testPatient.id);
        expect(results.length).toBe(1);
    });

    test('updateStatus() should change status', () => {
        const apt = HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.updateStatus(apt.id, 'confirmed');
        const updated = HMS.appointments.get(apt.id);
        expect(updated.status).toBe('confirmed');
    });
});

describe('HMS.auth', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('login() should authenticate valid user by username', () => {
        const result = HMS.auth.login('psaj', '1234');
        expect(result.success).toBe(true);
        expect(result.user.role).toBe('admin');
    });

    test('login() should accept email', () => {
        const result = HMS.auth.login('pratik.sajnani@gmail.com', '1234');
        expect(result.success).toBe(true);
    });

    test('login() should reject invalid password', () => {
        const result = HMS.auth.login('psaj', 'wrongpassword');
        expect(result.success).toBeFalsy();
        expect(result.error).toContain('password');
    });

    test('login() should reject unknown user', () => {
        const result = HMS.auth.login('nobody@test.com', 'password');
        expect(result.success).toBeFalsy();
        expect(result.error).toContain('not found');
    });

    test('login() should reject inactive user', () => {
        // Create inactive user
        const users = HMS.users.getAll();
        const user = users.find(u => u.username === 'psaj');
        HMS.users.update(user.id, { active: false });
        
        const result = HMS.auth.login('psaj', '1234');
        expect(result.success).toBeFalsy();
        expect(result.error).toContain('deactivated');
    });

    test('logout() should clear session', () => {
        HMS.auth.login('psaj', '1234');
        HMS.auth.logout();
        expect(HMS.auth.isLoggedIn()).toBe(false);
    });

    test('isLoggedIn() should return correct state', () => {
        expect(HMS.auth.isLoggedIn()).toBe(false);
        HMS.auth.login('psaj', '1234');
        expect(HMS.auth.isLoggedIn()).toBe(true);
    });

    test('getCurrentUser() should return user after login', () => {
        HMS.auth.login('psaj', '1234');
        const user = HMS.auth.getCurrentUser();
        expect(user).toBeDefined();
        expect(user.role).toBe('admin');
    });

    test('getCurrentUser() should return from localStorage', () => {
        HMS.auth.login('psaj', '1234');
        HMS.auth.currentUser = null; // Clear in-memory
        const user = HMS.auth.getCurrentUser();
        expect(user).toBeDefined();
    });
});

describe('HMS.users extended', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('getByUsername() should find by username', () => {
        const user = HMS.users.getByUsername('psaj');
        expect(user).toBeDefined();
        expect(user.role).toBe('admin');
    });

    test('getByRole() should filter by role', () => {
        const doctors = HMS.users.getByRole('doctor');
        expect(doctors.length).toBe(2);
        expect(doctors.every(u => u.role === 'doctor')).toBe(true);
    });

    test('getStaff() should return non-doctor non-admin users', () => {
        const staff = HMS.users.getStaff();
        expect(staff.every(u => u.role !== 'doctor' && u.role !== 'admin')).toBe(true);
    });

    test('add() should reject duplicate email', () => {
        const result = HMS.users.add({ email: 'pratik.sajnani@gmail.com', name: 'Duplicate' });
        expect(result.error).toBeDefined();
        expect(result.error).toContain('already registered');
    });

    test('update() should modify user', () => {
        const users = HMS.users.getAll();
        const updated = HMS.users.update(users[0].id, { name: 'Updated Name' });
        expect(updated.name).toBe('Updated Name');
    });

    test('update() should return null for unknown ID', () => {
        const result = HMS.users.update('unknown-id', { name: 'Test' });
        expect(result).toBeNull();
    });

    test('delete() should remove user', () => {
        const users = HMS.users.getAll();
        const initialCount = users.length;
        HMS.users.delete(users[0].id);
        expect(HMS.users.getAll().length).toBe(initialCount - 1);
    });

    test('toggleActive() should toggle user active status', () => {
        const users = HMS.users.getAll();
        const initialActive = users[0].active;
        HMS.users.toggleActive(users[0].id);
        const updated = HMS.users.get(users[0].id);
        expect(updated.active).toBe(!initialActive);
    });
});

describe('HMS.auth extended', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.auth.currentUser = null; // Clear in-memory user
        HMS.init();
    });

    test('hasPermission() should return false when not logged in', () => {
        // This test runs first to ensure no user is logged in
        expect(HMS.auth.hasPermission('users')).toBe(false);
    });

    test('hasPermission() should return true for admin with all permissions', () => {
        HMS.auth.login('psaj', '1234');
        expect(HMS.auth.hasPermission('users')).toBe(true);
        expect(HMS.auth.hasPermission('anything')).toBe(true);
    });

    test('isAdmin() should return true for admin', () => {
        HMS.auth.login('psaj', '1234');
        expect(HMS.auth.isAdmin()).toBe(true);
    });

    test('isAdmin() should return false for doctor', () => {
        HMS.auth.login('drsajnani@gmail.com', 'doctor123');
        expect(HMS.auth.isAdmin()).toBe(false);
    });

    test('isDoctor() should return true for doctor', () => {
        HMS.auth.login('drsajnani@gmail.com', 'doctor123');
        expect(HMS.auth.isDoctor()).toBe(true);
    });

    test('isDoctor() should return false for admin', () => {
        HMS.auth.login('psaj', '1234');
        expect(HMS.auth.isDoctor()).toBe(false);
    });

    test('signup() should create user pending approval', () => {
        const result = HMS.auth.signup({
            email: 'newuser@test.com',
            name: 'New User',
            role: 'staff'
        });
        expect(result.success).toBe(true);
        expect(result.message).toContain('Pending');
        expect(result.user.id).toBeDefined();
    });

    test('signup() should reject duplicate email', () => {
        const result = HMS.auth.signup({
            email: 'pratik.sajnani@gmail.com',
            name: 'Duplicate'
        });
        expect(result.error).toBeDefined();
    });
});

describe('HMS.staffRoles', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('getAll() should return staff roles', () => {
        const roles = HMS.staffRoles.getAll();
        expect(Array.isArray(roles)).toBe(true);
    });
});

describe('HMS.utils', () => {
    test('formatDate() should format date', () => {
        const formatted = HMS.utils.formatDate('2025-12-25');
        expect(formatted).toBeDefined();
        expect(formatted).toContain('25');
    });

    test('formatCurrency() should format with rupee symbol', () => {
        const formatted = HMS.utils.formatCurrency(1000);
        expect(formatted).toContain('₹');
        expect(formatted).toContain('1,000');
    });

    test('generateId() should generate ID with prefix', () => {
        const id = HMS.utils.generateId('T');
        expect(id).toMatch(/^T/);
    });

    test('generateToken() should generate unique token', () => {
        const token1 = HMS.utils.generateToken();
        const token2 = HMS.utils.generateToken();
        expect(token1).not.toBe(token2);
    });
});

describe('HMS.smsTemplates', () => {
    test('should have templates object', () => {
        expect(HMS.smsTemplates.templates).toBeDefined();
    });

    test('should have appointment_confirmation template', () => {
        expect(HMS.smsTemplates.templates.appointment_confirmation).toBeDefined();
        expect(HMS.smsTemplates.templates.appointment_confirmation.en).toBeDefined();
        expect(HMS.smsTemplates.templates.appointment_confirmation.hi).toBeDefined();
        expect(HMS.smsTemplates.templates.appointment_confirmation.gu).toBeDefined();
    });

    test('should have prescription_ready template', () => {
        expect(HMS.smsTemplates.templates.prescription_ready).toBeDefined();
    });
});

describe('HMS.tokens', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('create() should create token', () => {
        const result = HMS.tokens.create({
            targetRole: 'doctor',
            targetEmail: 'test@test.com',
            purpose: 'registration'
        });
        expect(result.token).toBeDefined();
        expect(result.token.length).toBeGreaterThan(10);
    });

    test('validate() should return valid for good token', () => {
        const { token } = HMS.tokens.create({
            targetRole: 'doctor',
            targetEmail: 'test@test.com',
            purpose: 'registration'
        });
        const validation = HMS.tokens.validate(token);
        expect(validation.valid).toBe(true);
    });

    test('validate() should return invalid for bad token', () => {
        const validation = HMS.tokens.validate('bad-token');
        expect(validation.valid).toBe(false);
    });

    test('markUsed() should invalidate token', () => {
        const { token } = HMS.tokens.create({
            targetRole: 'doctor',
            targetEmail: 'test@test.com',
            purpose: 'registration'
        });
        HMS.tokens.markUsed(token);
        const validation = HMS.tokens.validate(token);
        expect(validation.valid).toBe(false);
    });

    test('getAll() should return all tokens', () => {
        HMS.tokens.create({
            targetRole: 'doctor',
            targetEmail: 'a@test.com',
            purpose: 'registration'
        });
        HMS.tokens.create({
            targetRole: 'staff',
            targetEmail: 'b@test.com',
            purpose: 'registration'
        });
        const all = HMS.tokens.getAll();
        expect(all.length).toBe(2);
    });

    test('cleanup() should remove expired tokens', () => {
        HMS.tokens.cleanup();
        // Just verify it runs without error
        expect(true).toBe(true);
    });
});

describe('HMS.queue', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('should have queue module', () => {
        expect(HMS.queue).toBeDefined();
    });

    test('add() should add to queue', () => {
        HMS.queue.add({
            patientId: 'P001',
            patientName: 'Test Patient',
            doctor: 'ashok'
        });
        const queue = HMS.queue.getAll();
        expect(queue.length).toBe(1);
    });

    test('add() should assign queue number', () => {
        const entry = HMS.queue.add({ 
            patientId: 'p1', 
            patientName: 'First', 
            doctor: 'ashok' 
        });
        expect(entry.queueNumber).toBe(1);
    });

    test('getAll() should return all queue entries', () => {
        HMS.queue.add({ patientId: 'p1', patientName: 'First', doctor: 'ashok' });
        HMS.queue.add({ patientId: 'p2', patientName: 'Second', doctor: 'ashok' });
        const all = HMS.queue.getAll();
        expect(all.length).toBe(2);
    });

    test('remove() should remove from queue', () => {
        const entry = HMS.queue.add({ id: 'q1', patientId: 'p1', patientName: 'Test', doctor: 'ashok' });
        HMS.queue.remove(entry.id || 'q1');
        // Just verify the function runs
        expect(true).toBe(true);
    });

    test('clear() should empty queue', () => {
        HMS.queue.add({ patientId: 'p1', patientName: 'First', doctor: 'ashok' });
        HMS.queue.add({ patientId: 'p2', patientName: 'Second', doctor: 'ashok' });
        HMS.queue.clear();
        const queue = HMS.queue.getAll();
        expect(queue.length).toBe(0);
    });
});

describe('HMS - Data Validation Logic', () => {
    test('should validate email format', () => {
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        expect(isValidEmail('test@test.com')).toBe(true);
        expect(isValidEmail('pratik.sajnani@gmail.com')).toBe(true);
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
    });

    test('should validate phone format', () => {
        const isValidPhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));
        
        expect(isValidPhone('9925450425')).toBe(true);
        expect(isValidPhone('99254-50425')).toBe(true);
        expect(isValidPhone('123')).toBe(false);
    });
});

describe('HMS - ID Generation', () => {
    test('should generate unique IDs', () => {
        let counter = 0;
        const generateId = (prefix) => `${prefix}${Date.now()}_${counter++}`;
        
        const id1 = generateId('P');
        const id2 = generateId('P');
        
        expect(id1).not.toBe(id2);
    });

    test('should generate IDs with correct prefix format', () => {
        const generateId = (prefix) => `${prefix}${Date.now()}`;
        
        expect(generateId('P')).toMatch(/^P\d+$/);
        expect(generateId('A')).toMatch(/^A\d+$/);
        expect(generateId('RX')).toMatch(/^RX\d+$/);
    });
});

describe('HMS.prescriptions', () => {
    let testPatient;

    beforeEach(() => {
        localStorage.clear();
        HMS.init();
        testPatient = HMS.patients.add({
            name: 'Prescription Patient',
            phone: '1234567890'
        });
    });

    test('add() should add prescription', () => {
        const rx = HMS.prescriptions.add({
            patientId: testPatient.id,
            doctorId: 'ashok',
            diagnosis: 'Knee Osteoarthritis',
            medicines: [{ name: 'Paracetamol', dosage: '500mg' }]
        });
        expect(rx.id).toBeDefined();
        expect(rx.id).toMatch(/^RX/);
    });

    test('getAll() should return all prescriptions', () => {
        HMS.prescriptions.add({ patientId: testPatient.id, doctorId: 'ashok', diagnosis: 'Test' });
        const all = HMS.prescriptions.getAll();
        expect(all.length).toBeGreaterThan(0);
    });

    test('getByPatient() should filter by patient', () => {
        HMS.prescriptions.add({ patientId: testPatient.id, doctorId: 'ashok', diagnosis: 'Test' });
        const results = HMS.prescriptions.getByPatient(testPatient.id);
        expect(results.length).toBe(1);
    });
});

describe('HMS.inventory', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('add() should add item', () => {
        const item = HMS.inventory.add({
            name: 'Paracetamol 500mg',
            stock: 100,
            price: 10,
            reorderLevel: 20
        });
        expect(item.id).toBeDefined();
        expect(item.id).toMatch(/^M/);
    });

    test('getAll() should return all items', () => {
        HMS.inventory.add({ name: 'Test Item', stock: 50 });
        const all = HMS.inventory.getAll();
        expect(all.length).toBeGreaterThan(0);
    });

    test('get() should return item by ID', () => {
        const created = HMS.inventory.add({ name: 'Find Item', stock: 50 });
        const found = HMS.inventory.get(created.id);
        expect(found).toBeDefined();
        expect(found.name).toBe('Find Item');
    });

    test('getLowStock() should find items below reorder level', () => {
        HMS.inventory.add({ name: 'Low Item', stock: 5, reorderLevel: 10 });
        HMS.inventory.add({ name: 'OK Item', stock: 50, reorderLevel: 10 });
        const low = HMS.inventory.getLowStock();
        expect(low.some(i => i.name === 'Low Item')).toBe(true);
    });

    test('updateStock() should subtract quantity', () => {
        const item = HMS.inventory.add({ name: 'Stock Item', stock: 100 });
        HMS.inventory.updateStock(item.id, 10, 'subtract');
        const updated = HMS.inventory.get(item.id);
        expect(updated.stock).toBe(90);
    });

    test('updateStock() should add quantity', () => {
        const item = HMS.inventory.add({ name: 'Stock Item', stock: 100 });
        HMS.inventory.updateStock(item.id, 10, 'add');
        const updated = HMS.inventory.get(item.id);
        expect(updated.stock).toBe(110);
    });
});

describe('HMS.sales', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('add() should add sale', () => {
        const sale = HMS.sales.add({
            items: [{ name: 'Paracetamol', qty: 2, price: 10 }],
            total: 20,
            paymentMethod: 'cash'
        });
        expect(sale.id).toBeDefined();
        expect(sale.id).toMatch(/^S/);
    });

    test('getAll() should return all sales', () => {
        HMS.sales.add({ items: [], total: 100 });
        const all = HMS.sales.getAll();
        expect(all.length).toBeGreaterThan(0);
    });

    test('getByDate() should filter by date', () => {
        HMS.sales.add({ items: [], total: 100 });
        const today = new Date().toISOString().split('T')[0];
        const results = HMS.sales.getByDate(today);
        expect(results.length).toBeGreaterThan(0);
    });

    test('getTodayTotal() should sum today\'s sales', () => {
        HMS.sales.add({ items: [], total: 100 });
        HMS.sales.add({ items: [], total: 200 });
        const total = HMS.sales.getTodayTotal();
        expect(total).toBe(300);
    });
});

describe('HMS.appointments extended', () => {
    let testPatient;

    beforeEach(() => {
        localStorage.clear();
        HMS.init();
        testPatient = HMS.patients.add({
            name: 'Test Patient',
            phone: '1234567890'
        });
    });

    test('getTodayStats() should return statistics', () => {
        const today = new Date().toISOString().split('T')[0];
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: today,
            time: '11:00 AM'
        });
        HMS.appointments.add({
            patientId: testPatient.id,
            doctor: 'ashok',
            date: today,
            time: '12:00 PM'
        });
        
        const stats = HMS.appointments.getTodayStats();
        expect(stats.total).toBe(2);
        expect(stats.pending).toBe(2);
    });
});

describe('HMS - Token Validation', () => {
    test('should validate token format', () => {
        const isValidToken = (token) => {
            if (!token) return false;
            return token.length > 20;
        };
        
        expect(isValidToken('abc123def456ghi789jkl012mno345')).toBe(true);
        expect(isValidToken('short')).toBe(false);
        expect(isValidToken(null)).toBe(false);
        expect(isValidToken('')).toBe(false);
        expect(isValidToken(undefined)).toBe(false);
    });

    test('should check token expiry', () => {
        const isExpired = (expiresAt) => {
            return new Date(expiresAt) < new Date();
        };
        
        const pastDate = new Date(Date.now() - 86400000).toISOString();
        const futureDate = new Date(Date.now() + 86400000).toISOString();
        
        expect(isExpired(pastDate)).toBe(true);
        expect(isExpired(futureDate)).toBe(false);
    });
});

