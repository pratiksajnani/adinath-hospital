/**
 * HMS (Hospital Management System) Unit Tests
 * Tests all CRUD operations for patients, appointments, prescriptions, etc.
 */

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i) => Object.keys(store)[i] || null
    };
})();

global.localStorage = localStorageMock;

// Load HMS module
const fs = require('fs');
const path = require('path');
const hmsCode = fs.readFileSync(path.join(__dirname, '../../js/hms.js'), 'utf8');
eval(hmsCode);

describe('HMS Core', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    describe('Initialization', () => {
        test('should initialize with default data', () => {
            expect(HMS.DATA_VERSION).toBeDefined();
            expect(localStorage.getItem('hms_data_version')).toBe(HMS.DATA_VERSION);
        });

        test('should seed default users', () => {
            const users = HMS.users.getAll();
            expect(users.length).toBeGreaterThan(0);
        });

        test('should have admin user', () => {
            const admin = HMS.users.getByRole('admin');
            expect(admin.length).toBe(1);
            expect(admin[0].email).toBe('pratik.sajnani@gmail.com');
        });

        test('should have doctor users', () => {
            const doctors = HMS.users.getDoctors();
            expect(doctors.length).toBe(2);
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

    test('getById() should return user by ID', () => {
        const users = HMS.users.getAll();
        const user = HMS.users.getById(users[0].id);
        expect(user).toBeDefined();
        expect(user.id).toBe(users[0].id);
    });

    test('getByEmail() should return user by email', () => {
        const user = HMS.users.getByEmail('pratik.sajnani@gmail.com');
        expect(user).toBeDefined();
        expect(user.role).toBe('admin');
    });

    test('getByEmailOrUsername() should find by email', () => {
        const user = HMS.users.getByEmailOrUsername('drsajnani@gmail.com');
        expect(user).toBeDefined();
        expect(user.role).toBe('doctor');
    });

    test('getByEmailOrUsername() should find by username', () => {
        const user = HMS.users.getByEmailOrUsername('psaj');
        expect(user).toBeDefined();
        expect(user.role).toBe('admin');
    });

    test('getByRole() should filter by role', () => {
        const doctors = HMS.users.getByRole('doctor');
        expect(doctors.every(u => u.role === 'doctor')).toBe(true);
    });

    test('getDoctors() should return only doctors', () => {
        const doctors = HMS.users.getDoctors();
        expect(doctors.length).toBe(2);
        expect(doctors.every(u => u.role === 'doctor')).toBe(true);
    });

    test('create() should add new user', () => {
        const initialCount = HMS.users.getAll().length;
        HMS.users.create({
            email: 'test@test.com',
            name: 'Test User',
            role: 'patient'
        });
        expect(HMS.users.getAll().length).toBe(initialCount + 1);
    });

    test('update() should modify user', () => {
        const users = HMS.users.getAll();
        HMS.users.update(users[0].id, { name: 'Updated Name' });
        const updated = HMS.users.getById(users[0].id);
        expect(updated.name).toBe('Updated Name');
    });

    test('delete() should remove user', () => {
        const users = HMS.users.getAll();
        const initialCount = users.length;
        HMS.users.delete(users[0].id);
        expect(HMS.users.getAll().length).toBe(initialCount - 1);
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

    test('create() should add patient with ID', () => {
        const patient = HMS.patients.create({
            name: 'Test Patient',
            phone: '9999999999',
            age: 30,
            gender: 'male'
        });
        expect(patient.id).toBeDefined();
        expect(patient.name).toBe('Test Patient');
    });

    test('getById() should return patient', () => {
        const created = HMS.patients.create({
            name: 'Find Me',
            phone: '1234567890'
        });
        const found = HMS.patients.getById(created.id);
        expect(found).toBeDefined();
        expect(found.name).toBe('Find Me');
    });

    test('getByPhone() should find by phone', () => {
        HMS.patients.create({
            name: 'Phone Patient',
            phone: '5555555555'
        });
        const found = HMS.patients.getByPhone('5555555555');
        expect(found).toBeDefined();
        expect(found.name).toBe('Phone Patient');
    });

    test('update() should modify patient', () => {
        const patient = HMS.patients.create({
            name: 'Original',
            phone: '1111111111'
        });
        HMS.patients.update(patient.id, { name: 'Modified' });
        const updated = HMS.patients.getById(patient.id);
        expect(updated.name).toBe('Modified');
    });

    test('search() should find by name', () => {
        HMS.patients.create({ name: 'Ramesh Kumar', phone: '1' });
        HMS.patients.create({ name: 'Suresh Patel', phone: '2' });
        const results = HMS.patients.search('Ramesh');
        expect(results.length).toBe(1);
        expect(results[0].name).toBe('Ramesh Kumar');
    });

    test('search() should find by phone', () => {
        HMS.patients.create({ name: 'ABC', phone: '9876543210' });
        const results = HMS.patients.search('987654');
        expect(results.length).toBeGreaterThan(0);
    });
});

describe('HMS.appointments', () => {
    let testPatient;

    beforeEach(() => {
        localStorage.clear();
        HMS.init();
        testPatient = HMS.patients.create({
            name: 'Appointment Patient',
            phone: '1234567890'
        });
    });

    test('create() should add appointment', () => {
        const apt = HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM',
            reason: 'Knee pain'
        });
        expect(apt.id).toBeDefined();
        expect(apt.status).toBe('pending');
    });

    test('getByDate() should filter by date', () => {
        HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-26',
            time: '11:00 AM'
        });
        const results = HMS.appointments.getByDate('2025-12-25');
        expect(results.length).toBe(1);
    });

    test('getByDoctor() should filter by doctor', () => {
        HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'sunita',
            date: '2025-12-25',
            time: '12:00 PM'
        });
        const results = HMS.appointments.getByDoctor('ashok');
        expect(results.every(a => a.doctorId === 'ashok')).toBe(true);
    });

    test('getByPatient() should filter by patient', () => {
        const patient2 = HMS.patients.create({ name: 'Other', phone: '2' });
        HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.create({
            patientId: patient2.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '12:00 PM'
        });
        const results = HMS.appointments.getByPatient(testPatient.id);
        expect(results.length).toBe(1);
    });

    test('updateStatus() should change status', () => {
        const apt = HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.updateStatus(apt.id, 'confirmed');
        const updated = HMS.appointments.getById(apt.id);
        expect(updated.status).toBe('confirmed');
    });

    test('cancel() should mark as cancelled', () => {
        const apt = HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        });
        HMS.appointments.cancel(apt.id);
        const updated = HMS.appointments.getById(apt.id);
        expect(updated.status).toBe('cancelled');
    });

    test('getToday() should return today\'s appointments', () => {
        const today = new Date().toISOString().split('T')[0];
        HMS.appointments.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            date: today,
            time: '11:00 AM'
        });
        const results = HMS.appointments.getToday();
        expect(results.length).toBeGreaterThan(0);
    });
});

describe('HMS.prescriptions', () => {
    let testPatient;

    beforeEach(() => {
        localStorage.clear();
        HMS.init();
        testPatient = HMS.patients.create({
            name: 'Prescription Patient',
            phone: '1234567890'
        });
    });

    test('create() should add prescription', () => {
        const rx = HMS.prescriptions.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            diagnosis: 'Knee Osteoarthritis',
            medicines: [
                { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily' }
            ],
            advice: 'Rest and physiotherapy'
        });
        expect(rx.id).toBeDefined();
        expect(rx.diagnosis).toBe('Knee Osteoarthritis');
    });

    test('getByPatient() should return patient prescriptions', () => {
        HMS.prescriptions.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            diagnosis: 'Test'
        });
        const results = HMS.prescriptions.getByPatient(testPatient.id);
        expect(results.length).toBe(1);
    });

    test('getByDoctor() should return doctor prescriptions', () => {
        HMS.prescriptions.create({
            patientId: testPatient.id,
            doctorId: 'ashok',
            diagnosis: 'Test'
        });
        const results = HMS.prescriptions.getByDoctor('ashok');
        expect(results.length).toBeGreaterThan(0);
    });
});

describe('HMS.inventory', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('create() should add item', () => {
        const item = HMS.inventory.create({
            name: 'Paracetamol 500mg',
            category: 'Tablet',
            quantity: 100,
            price: 10
        });
        expect(item.id).toBeDefined();
        expect(item.name).toBe('Paracetamol 500mg');
    });

    test('updateQuantity() should modify quantity', () => {
        const item = HMS.inventory.create({
            name: 'Test Item',
            quantity: 50
        });
        HMS.inventory.updateQuantity(item.id, 75);
        const updated = HMS.inventory.getById(item.id);
        expect(updated.quantity).toBe(75);
    });

    test('getByCategory() should filter', () => {
        HMS.inventory.create({ name: 'Tab A', category: 'Tablet' });
        HMS.inventory.create({ name: 'Syrup B', category: 'Syrup' });
        const tablets = HMS.inventory.getByCategory('Tablet');
        expect(tablets.every(i => i.category === 'Tablet')).toBe(true);
    });

    test('getLowStock() should find low items', () => {
        HMS.inventory.create({ name: 'Low Item', quantity: 5, reorderLevel: 10 });
        HMS.inventory.create({ name: 'OK Item', quantity: 50, reorderLevel: 10 });
        const low = HMS.inventory.getLowStock();
        expect(low.length).toBe(1);
        expect(low[0].name).toBe('Low Item');
    });
});

describe('HMS.sales', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('create() should record sale', () => {
        const sale = HMS.sales.create({
            items: [{ name: 'Paracetamol', qty: 2, price: 10 }],
            total: 20,
            paymentMethod: 'cash'
        });
        expect(sale.id).toBeDefined();
        expect(sale.total).toBe(20);
    });

    test('getToday() should return today\'s sales', () => {
        HMS.sales.create({
            items: [{ name: 'Test', qty: 1, price: 100 }],
            total: 100
        });
        const today = HMS.sales.getToday();
        expect(today.length).toBeGreaterThan(0);
    });

    test('getTodayTotal() should sum sales', () => {
        HMS.sales.create({ items: [], total: 100 });
        HMS.sales.create({ items: [], total: 200 });
        const total = HMS.sales.getTodayTotal();
        expect(total).toBe(300);
    });
});

describe('HMS.auth', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('login() should authenticate valid user', () => {
        const result = HMS.auth.login('psaj', '1234');
        expect(result.success).toBe(true);
        expect(result.user.role).toBe('admin');
    });

    test('login() should accept email', () => {
        const result = HMS.auth.login('pratik.sajnani@gmail.com', '1234');
        expect(result.success).toBe(true);
    });

    test('login() should reject invalid credentials', () => {
        const result = HMS.auth.login('psaj', 'wrongpassword');
        expect(result.error).toBeDefined();
    });

    test('login() should reject unknown user', () => {
        const result = HMS.auth.login('nobody@test.com', 'password');
        expect(result.error).toBeDefined();
    });

    test('logout() should clear session', () => {
        HMS.auth.login('psaj', '1234');
        HMS.auth.logout();
        expect(HMS.auth.getCurrentUser()).toBeNull();
    });

    test('isLoggedIn() should return correct state', () => {
        expect(HMS.auth.isLoggedIn()).toBe(false);
        HMS.auth.login('psaj', '1234');
        expect(HMS.auth.isLoggedIn()).toBe(true);
    });

    test('hasPermission() should check permissions', () => {
        HMS.auth.login('psaj', '1234');
        expect(HMS.auth.hasPermission('all')).toBe(true);
    });
});

describe('HMS.tokens', () => {
    beforeEach(() => {
        localStorage.clear();
        HMS.init();
    });

    test('generate() should create unique token', () => {
        const result = HMS.tokens.generate({
            type: 'doctor',
            email: 'test@test.com'
        });
        expect(result.token).toBeDefined();
        expect(result.token.length).toBeGreaterThan(30);
    });

    test('validate() should return token data', () => {
        const { token } = HMS.tokens.generate({
            type: 'doctor',
            email: 'test@test.com'
        });
        const validation = HMS.tokens.validate(token);
        expect(validation.valid).toBe(true);
        expect(validation.email).toBe('test@test.com');
    });

    test('validate() should reject invalid token', () => {
        const validation = HMS.tokens.validate('invalid-token-12345');
        expect(validation.valid).toBe(false);
    });

    test('markUsed() should invalidate token', () => {
        const { token } = HMS.tokens.generate({
            type: 'doctor',
            email: 'test@test.com'
        });
        HMS.tokens.markUsed(token);
        const validation = HMS.tokens.validate(token);
        expect(validation.valid).toBe(false);
    });

    test('cleanup() should remove expired tokens', () => {
        // Create expired token manually
        const invites = JSON.parse(localStorage.getItem('hms_invites') || '[]');
        invites.push({
            token: 'expired-token',
            expiresAt: new Date(Date.now() - 1000).toISOString()
        });
        localStorage.setItem('hms_invites', JSON.stringify(invites));
        
        HMS.tokens.cleanup();
        
        const afterCleanup = JSON.parse(localStorage.getItem('hms_invites') || '[]');
        expect(afterCleanup.find(t => t.token === 'expired-token')).toBeUndefined();
    });
});

describe('HMS.queue', () => {
    let testPatient;

    beforeEach(() => {
        localStorage.clear();
        HMS.init();
        testPatient = HMS.patients.create({
            name: 'Queue Patient',
            phone: '1234567890'
        });
    });

    test('add() should add to queue', () => {
        HMS.queue.add({
            patientId: testPatient.id,
            patientName: testPatient.name,
            doctor: 'ashok'
        });
        const queue = HMS.queue.getByDoctor('ashok');
        expect(queue.length).toBe(1);
    });

    test('getNext() should return first in queue', () => {
        HMS.queue.add({ patientId: 'p1', patientName: 'First', doctor: 'ashok' });
        HMS.queue.add({ patientId: 'p2', patientName: 'Second', doctor: 'ashok' });
        const next = HMS.queue.getNext('ashok');
        expect(next.patientName).toBe('First');
    });

    test('complete() should remove from queue', () => {
        HMS.queue.add({ patientId: 'p1', patientName: 'Test', doctor: 'ashok' });
        HMS.queue.complete('ashok');
        const queue = HMS.queue.getByDoctor('ashok');
        expect(queue.length).toBe(0);
    });
});

console.log('HMS Unit Tests loaded');

