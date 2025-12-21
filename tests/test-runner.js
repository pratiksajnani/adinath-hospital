// ============================================
// ADINATH HOSPITAL - AUTOMATED TEST RUNNER
// Run in browser console on the live site
// ============================================

const TestRunner = {
    results: [],
    passed: 0,
    failed: 0,

    log(test, passed, message = '') {
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${test}: ${message}`);
        this.results.push({ test, passed, message });
        passed ? this.passed++ : this.failed++;
    },

    async runAll() {
        console.log('🧪 ADINATH HOSPITAL - TEST SUITE');
        console.log('================================\n');
        
        this.testHMSInit();
        this.testUserAccounts();
        this.testPatientCRUD();
        this.testAppointmentCRUD();
        this.testAuthentication();
        this.testPrescriptions();
        this.testInventory();
        this.testSMSTemplates();
        this.testPatientLinks();
        
        console.log('\n================================');
        console.log(`📊 RESULTS: ${this.passed} passed, ${this.failed} failed`);
        console.log('================================\n');
        
        return this.results;
    },

    // Test 1: HMS Initialization
    testHMSInit() {
        console.log('\n📦 Testing HMS Initialization...');
        
        this.log('HMS object exists', typeof HMS !== 'undefined');
        this.log('HMS.patients exists', typeof HMS.patients === 'object');
        this.log('HMS.appointments exists', typeof HMS.appointments === 'object');
        this.log('HMS.auth exists', typeof HMS.auth === 'object');
        this.log('HMS.users exists', typeof HMS.users === 'object');
    },

    // Test 2: User Accounts
    testUserAccounts() {
        console.log('\n👥 Testing User Accounts...');
        
        const users = HMS.users.getAll();
        this.log('Users array exists', Array.isArray(users));
        this.log('Has admin account', users.some(u => u.role === 'admin'));
        this.log('Has doctor accounts', users.filter(u => u.role === 'doctor').length >= 2);
        this.log('Has Poonam (receptionist)', users.some(u => u.name === 'Poonam'));
        
        // Check for fake data (should NOT exist)
        this.log('No Priya Patel (fake)', !users.some(u => u.name === 'Priya Patel'));
        this.log('No Kavita Sharma (fake)', !users.some(u => u.name === 'Kavita Sharma'));
        this.log('No Rahul Mehta (fake)', !users.some(u => u.name === 'Rahul Mehta'));
        
        // Verify real users
        const admin = HMS.users.getByEmail('pratik.sajnani@gmail.com');
        this.log('Admin email correct', admin?.email === 'pratik.sajnani@gmail.com');
        
        const drAshok = HMS.users.getByEmail('drsajnani@gmail.com');
        this.log('Dr. Ashok email correct', drAshok?.email === 'drsajnani@gmail.com');
        
        const drSunita = HMS.users.getByEmail('sunita.sajnani9@gmail.com');
        this.log('Dr. Sunita email correct', drSunita?.email === 'sunita.sajnani9@gmail.com');
    },

    // Test 3: Patient CRUD
    testPatientCRUD() {
        console.log('\n🧑‍🤝‍🧑 Testing Patient CRUD...');
        
        // Create test patient
        const testPatient = HMS.patients.add({
            name: 'Test Patient',
            phone: '9999999999',
            age: 35,
            gender: 'male',
            address: 'Test Address, Ahmedabad'
        });
        this.log('Create patient', testPatient && testPatient.id);
        
        // Read patient
        const found = HMS.patients.get(testPatient.id);
        this.log('Read patient by ID', found?.name === 'Test Patient');
        
        // Search patient
        const searched = HMS.patients.search('Test Patient');
        this.log('Search patient by name', searched.length > 0);
        
        // Update patient
        HMS.patients.update(testPatient.id, { age: 36 });
        const updated = HMS.patients.get(testPatient.id);
        this.log('Update patient', updated?.age === 36);
        
        // Count patients
        const allPatients = HMS.patients.getAll();
        this.log('Get all patients', allPatients.length > 0);
    },

    // Test 4: Appointment CRUD
    testAppointmentCRUD() {
        console.log('\n📅 Testing Appointment CRUD...');
        
        const today = new Date().toISOString().split('T')[0];
        
        // Create test appointment
        const testAppt = HMS.appointments.add({
            patientId: 'P001',
            patientName: 'Test Appointment Patient',
            doctor: 'ashok',
            date: today,
            time: '11:30 AM',
            reason: 'Test appointment'
        });
        this.log('Create appointment', testAppt && testAppt.id);
        
        // Read appointment
        const found = HMS.appointments.get(testAppt.id);
        this.log('Read appointment by ID', found?.reason === 'Test appointment');
        
        // Get by date
        const todayAppts = HMS.appointments.getByDate(today);
        this.log('Get appointments by date', todayAppts.length > 0);
        
        // Get by doctor
        const drAppts = HMS.appointments.getByDoctor('ashok', today);
        this.log('Get appointments by doctor', drAppts.length >= 0);
        
        // Update status
        HMS.appointments.updateStatus(testAppt.id, 'confirmed');
        const confirmed = HMS.appointments.get(testAppt.id);
        this.log('Update appointment status', confirmed?.status === 'confirmed');
        
        // Get stats
        const stats = HMS.appointments.getTodayStats();
        this.log('Get today stats', typeof stats.total === 'number');
    },

    // Test 5: Authentication
    testAuthentication() {
        console.log('\n🔐 Testing Authentication...');
        
        // Login as admin
        const adminLogin = HMS.auth.login('pratik.sajnani@gmail.com', 'admin123');
        this.log('Admin login', adminLogin.success === true);
        
        // Check current user
        const currentUser = HMS.auth.getCurrentUser();
        this.log('Get current user', currentUser?.role === 'admin');
        
        // Check permissions
        this.log('Admin has all permissions', HMS.auth.hasPermission('all'));
        this.log('isAdmin() works', HMS.auth.isAdmin());
        
        // Logout
        HMS.auth.logout();
        this.log('Logout works', !HMS.auth.isLoggedIn());
        
        // Login as doctor
        const drLogin = HMS.auth.login('drsajnani@gmail.com', 'doctor123');
        this.log('Doctor login', drLogin.success === true);
        this.log('isDoctor() works', HMS.auth.isDoctor());
        
        // Wrong password
        HMS.auth.logout();
        const wrongLogin = HMS.auth.login('drsajnani@gmail.com', 'wrong123');
        this.log('Wrong password rejected', wrongLogin.error !== undefined);
        
        // Non-existent user
        const noUser = HMS.auth.login('nobody@test.com', 'test123');
        this.log('Non-existent user rejected', noUser.error !== undefined);
    },

    // Test 6: Prescriptions
    testPrescriptions() {
        console.log('\n💊 Testing Prescriptions...');
        
        // Create prescription
        const rx = HMS.prescriptions.add({
            patientId: 'P001',
            patientName: 'Test Patient',
            doctor: 'ashok',
            diagnosis: 'Test diagnosis',
            medicines: [
                { name: 'Test Medicine', dosage: '1-0-1', duration: '7 days' }
            ],
            advice: 'Take with food'
        });
        this.log('Create prescription', rx && rx.id);
        
        // Get by patient
        const patientRx = HMS.prescriptions.getByPatient('P001');
        this.log('Get prescriptions by patient', patientRx.length > 0);
    },

    // Test 7: Inventory
    testInventory() {
        console.log('\n📦 Testing Inventory...');
        
        const inventory = HMS.inventory.getAll();
        this.log('Get all inventory', inventory.length > 0);
        
        // Get low stock
        const lowStock = HMS.inventory.getLowStock();
        this.log('Get low stock items', Array.isArray(lowStock));
        
        // Add new item
        const newItem = HMS.inventory.add({
            name: 'Test Medicine 500mg',
            category: 'Test',
            stock: 100,
            unit: 'tablets',
            price: 10,
            reorderLevel: 20
        });
        this.log('Add inventory item', newItem && newItem.id);
        
        // Update stock
        HMS.inventory.updateStock(newItem.id, 10, 'subtract');
        const updated = HMS.inventory.get(newItem.id);
        this.log('Update stock (subtract)', updated?.stock === 90);
    },

    // Test 8: SMS Templates
    testSMSTemplates() {
        console.log('\n📱 Testing SMS Templates...');
        
        const sms = HMS.smsTemplates.generate('appointment_confirmation', {
            name: 'Test Patient',
            doctor: 'Dr. Ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        }, 'en');
        this.log('Generate English SMS', sms && sms.includes('Test Patient'));
        
        const smsHi = HMS.smsTemplates.generate('appointment_confirmation', {
            name: 'Test Patient',
            doctor: 'Dr. Ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        }, 'hi');
        this.log('Generate Hindi SMS', smsHi && smsHi.includes('आदिनाथ'));
        
        const smsGu = HMS.smsTemplates.generate('appointment_confirmation', {
            name: 'Test Patient',
            doctor: 'Dr. Ashok',
            date: '2025-12-25',
            time: '11:00 AM'
        }, 'gu');
        this.log('Generate Gujarati SMS', smsGu && smsGu.includes('આદિનાથ'));
    },

    // Test 9: Patient Links
    testPatientLinks() {
        console.log('\n🔗 Testing Patient Links...');
        
        // Generate link
        const link = HMS.patientLinks.generate({
            phone: '9876543210',
            name: 'New Patient'
        }, 'U005');
        this.log('Generate patient link', link && link.token);
        
        // Validate link
        const validation = HMS.patientLinks.validate(link.token);
        this.log('Validate link', validation.valid === true);
        
        // Mark as used
        HMS.patientLinks.markUsed(link.token);
        const usedValidation = HMS.patientLinks.validate(link.token);
        this.log('Used link rejected', usedValidation.valid === false);
    }
};

// Run tests
function runAllTests() {
    return TestRunner.runAll();
}

// Export for use
if (typeof window !== 'undefined') {
    window.TestRunner = TestRunner;
    window.runAllTests = runAllTests;
}

console.log('🧪 Test Runner loaded! Run: runAllTests()');

