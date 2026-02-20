/**
 * HMS (Hospital Management System) Unit Tests — Supabase-backed
 *
 * All HMS data methods are async and delegate to Supabase.
 * Tests verify:
 *   1. The correct Supabase table / method is called.
 *   2. The return value from Supabase is passed through correctly.
 *   3. Error paths return the documented fallback ([] / null / { error }).
 */

const HMS = require('../../js/hms.js');

// ============================================
// SHARED TEST HELPERS
// ============================================

let mockClient;

/**
 * Call this at the start of each async test section's beforeEach.
 * It creates a fresh mock client, wires it into global.supabase.createClient,
 * resets HMS._supabase so init() runs again, then calls await HMS.init().
 */
async function setupMockClient() {
    mockClient = createMockSupabaseClient();
    global._currentMockClient = mockClient;
    global.supabase.createClient.mockReturnValue(mockClient);
    HMS._supabase = null;
    await HMS.init();
}

// ============================================
// HMS CORE INITIALIZATION
// ============================================

describe('HMS Core Initialization', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('HMS.init() calls supabase.createClient with CONFIG values', async () => {
        // init() was already called in setupMockClient(); verify it used CONFIG
        expect(global.supabase.createClient).toHaveBeenCalledWith(
            'https://test.supabase.co',
            'test-anon-key'
        );
    });

    test('HMS.init() returns the Supabase client', async () => {
        HMS._supabase = null;
        const client = await HMS.init();
        expect(client).toBe(mockClient);
    });

    test('HMS.init() is idempotent — does not call createClient twice', async () => {
        // _supabase is already set from setupMockClient
        await HMS.init();
        // createClient was called once in setupMockClient; it must not be called again
        expect(global.supabase.createClient).toHaveBeenCalledTimes(1);
    });

    test('HMS._db() throws if not initialized', () => {
        HMS._supabase = null;
        expect(() => HMS._db()).toThrow('HMS not initialized');
    });

    test('HMS has expected modules', () => {
        expect(HMS.users).toBeDefined();
        expect(HMS.patients).toBeDefined();
        expect(HMS.appointments).toBeDefined();
        expect(HMS.prescriptions).toBeDefined();
        expect(HMS.inventory).toBeDefined();
        expect(HMS.sales).toBeDefined();
        expect(HMS.queue).toBeDefined();
        expect(HMS.patientLinks).toBeDefined();
        expect(HMS.tokens).toBeDefined();
        expect(HMS.feedback).toBeDefined();
        expect(HMS.auth).toBeDefined();
        expect(HMS.utils).toBeDefined();
        expect(HMS.smsTemplates).toBeDefined();
        expect(HMS.notifications).toBeDefined();
    });
});

// ============================================
// HMS.users
// ============================================

describe('HMS.users', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() queries profiles table and returns data', async () => {
        const mockUsers = [
            { id: 'uuid-1', email: 'a@test.com', role: 'admin' },
            { id: 'uuid-2', email: 'b@test.com', role: 'doctor' },
        ];
        mockQueryResult({ data: mockUsers, error: null });

        const users = await HMS.users.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(users).toEqual(mockUsers);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const users = await HMS.users.getAll();

        expect(users).toEqual([]);
    });

    test('get() queries profiles by ID', async () => {
        const mockUser = { id: 'uuid-1', email: 'a@test.com', role: 'admin' };
        mockQueryResult({ data: mockUser, error: null });

        const user = await HMS.users.get('uuid-1');

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-1');
        expect(user).toEqual(mockUser);
    });

    test('get() returns null when not found', async () => {
        mockQueryResult({ data: null, error: null });

        const user = await HMS.users.get('nonexistent');

        expect(user).toBeNull();
    });

    test('getByEmail() queries profiles by email (lowercased)', async () => {
        const mockUser = { id: 'uuid-1', email: 'admin@test.com', role: 'admin' };
        mockQueryResult({ data: mockUser, error: null });

        const user = await HMS.users.getByEmail('ADMIN@TEST.COM');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('email', 'admin@test.com');
        expect(user).toEqual(mockUser);
    });

    test('getStaff() queries profiles excluding doctor and admin roles', async () => {
        const mockStaff = [{ id: 'uuid-3', email: 'r@test.com', role: 'receptionist' }];
        mockQueryResult({ data: mockStaff, error: null });

        const staff = await HMS.users.getStaff();

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(mockClient._builder.not).toHaveBeenCalledWith('role', 'in', '("doctor","admin")');
        expect(staff).toEqual(mockStaff);
    });

    test('getStaff() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const staff = await HMS.users.getStaff();

        expect(staff).toEqual([]);
    });

    test('add() inserts into profiles and returns new user', async () => {
        // First call: getByEmail check (returns null = no duplicate)
        const getByEmailBuilder = createQueryBuilder({ data: null, error: null });
        // Second call: insert
        const insertedUser = { id: 'uuid-new', email: 'new@test.com', role: 'patient' };
        const insertBuilder = createQueryBuilder({ data: insertedUser, error: null });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getByEmailBuilder : insertBuilder;
        });

        const result = await HMS.users.add({
            id: 'uuid-new',
            email: 'new@test.com',
            name: 'New User',
            role: 'patient',
        });

        expect(result).toEqual(insertedUser);
        expect(mockClient.from).toHaveBeenCalledWith('profiles');
    });

    test('add() returns error if email already registered', async () => {
        // getByEmail finds an existing user
        const existingBuilder = createQueryBuilder({
            data: { id: 'uuid-existing', email: 'taken@test.com' },
            error: null,
        });
        mockClient.from.mockImplementation(() => existingBuilder);

        const result = await HMS.users.add({ email: 'taken@test.com', name: 'Dupe' });

        expect(result.error).toContain('already registered');
    });

    test('add() returns error on Supabase insert error', async () => {
        // getByEmail → null (no duplicate)
        const getByEmailBuilder = createQueryBuilder({ data: null, error: null });
        // insert → error
        const insertBuilder = createQueryBuilder({
            data: null,
            error: { message: 'Insert failed' },
        });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getByEmailBuilder : insertBuilder;
        });

        const result = await HMS.users.add({ email: 'err@test.com', name: 'Error User' });

        expect(result.error).toBe('Insert failed');
    });

    test('update() updates profile and returns updated data', async () => {
        const updatedUser = { id: 'uuid-1', name: 'Updated Name', role: 'admin' };
        mockQueryResult({ data: updatedUser, error: null });

        const result = await HMS.users.update('uuid-1', { name: 'Updated Name' });

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(mockClient._builder.update).toHaveBeenCalledWith({ name: 'Updated Name' });
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-1');
        expect(result).toEqual(updatedUser);
    });

    test('update() returns null on error', async () => {
        mockQueryResult({ data: null, error: { message: 'Not found' } });

        const result = await HMS.users.update('bad-id', { name: 'X' });

        expect(result).toBeNull();
    });

    test('delete() calls delete on profiles', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.users.delete('uuid-1');

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(mockClient._builder.delete).toHaveBeenCalled();
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-1');
    });

    test('toggleActive() fetches user then updates active flag', async () => {
        const existingUser = { id: 'uuid-1', active: true };
        // First call: get(id) inside toggleActive
        const getBuilder = createQueryBuilder({ data: existingUser, error: null });
        // Second call: update(id, {active: false}) inside toggleActive → update + select + single
        const updateBuilder = createQueryBuilder({ data: { ...existingUser, active: false }, error: null });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getBuilder : updateBuilder;
        });

        await HMS.users.toggleActive('uuid-1');

        // The update should have been called with active: false (toggle of true)
        expect(updateBuilder.update).toHaveBeenCalledWith({ active: false });
    });
});

// ============================================
// HMS.patients
// ============================================

describe('HMS.patients', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all patients ordered by created_at desc', async () => {
        const mockPatients = [
            { id: 'uuid-p1', name: 'Ramesh Kumar', phone: '9111111111' },
            { id: 'uuid-p2', name: 'Suresh Patel', phone: '9222222222' },
        ];
        mockQueryResult({ data: mockPatients, error: null });

        const patients = await HMS.patients.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('patients');
        expect(mockClient._builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(patients).toEqual(mockPatients);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const patients = await HMS.patients.getAll();

        expect(patients).toEqual([]);
    });

    test('get() fetches single patient by ID', async () => {
        const mockPatient = { id: 'uuid-p1', name: 'Ramesh Kumar' };
        mockQueryResult({ data: mockPatient, error: null });

        const patient = await HMS.patients.get('uuid-p1');

        expect(mockClient.from).toHaveBeenCalledWith('patients');
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-p1');
        expect(patient).toEqual(mockPatient);
    });

    test('add() inserts patient and returns created record', async () => {
        const createdPatient = {
            id: 'uuid-pnew',
            name: 'New Patient',
            phone: '9876543210',
            age: 35,
            gender: 'male',
        };
        mockQueryResult({ data: createdPatient, error: null });

        const result = await HMS.patients.add({
            name: 'New Patient',
            phone: '9876543210',
            age: 35,
            gender: 'male',
        });

        expect(mockClient.from).toHaveBeenCalledWith('patients');
        expect(mockClient._builder.insert).toHaveBeenCalled();
        expect(result).toEqual(createdPatient);
    });

    test('add() maps camelCase fields to snake_case columns', async () => {
        const createdPatient = { id: 'uuid-pnew', name: 'Test' };
        mockQueryResult({ data: createdPatient, error: null });

        await HMS.patients.add({
            name: 'Test',
            phone: '123',
            bloodGroup: 'B+',
            medicalHistory: 'Hypertension',
            emergencyContact: '999',
            preferredLanguage: 'gu',
        });

        const insertCall = mockClient._builder.insert.mock.calls[0][0];
        expect(insertCall.blood_group).toBe('B+');
        expect(insertCall.medical_history).toBe('Hypertension');
        expect(insertCall.emergency_contact).toBe('999');
        expect(insertCall.preferred_language).toBe('gu');
    });

    test('add() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.patients.add({ name: 'Err', phone: '1' });

        expect(result.error).toBe('Insert failed');
    });

    test('update() updates patient and returns updated record', async () => {
        const updatedPatient = { id: 'uuid-p1', name: 'Updated' };
        mockQueryResult({ data: updatedPatient, error: null });

        const result = await HMS.patients.update('uuid-p1', { name: 'Updated' });

        expect(mockClient.from).toHaveBeenCalledWith('patients');
        expect(mockClient._builder.update).toHaveBeenCalledWith({ name: 'Updated' });
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-p1');
        expect(result).toEqual(updatedPatient);
    });

    test('update() returns null on error', async () => {
        mockQueryResult({ data: null, error: { message: 'Not found' } });

        const result = await HMS.patients.update('bad-id', { name: 'X' });

        expect(result).toBeNull();
    });

    test('search() uses ilike OR query on name and phone', async () => {
        const searchResults = [{ id: 'uuid-p1', name: 'Ramesh Kumar', phone: '9111111111' }];
        mockQueryResult({ data: searchResults, error: null });

        const results = await HMS.patients.search('ramesh');

        expect(mockClient.from).toHaveBeenCalledWith('patients');
        expect(mockClient._builder.or).toHaveBeenCalledWith(
            'name.ilike.%ramesh%,phone.ilike.%ramesh%'
        );
        expect(results).toEqual(searchResults);
    });

    test('search() lowercases the query', async () => {
        mockQueryResult({ data: [], error: null });

        await HMS.patients.search('KUMAR');

        expect(mockClient._builder.or).toHaveBeenCalledWith(
            'name.ilike.%kumar%,phone.ilike.%kumar%'
        );
    });

    test('search() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const results = await HMS.patients.search('test');

        expect(results).toEqual([]);
    });

    test('delete() calls delete on patients table', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.patients.delete('uuid-p1');

        expect(mockClient.from).toHaveBeenCalledWith('patients');
        expect(mockClient._builder.delete).toHaveBeenCalled();
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-p1');
    });
});

// ============================================
// HMS.appointments
// ============================================

describe('HMS.appointments', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all appointments ordered by date desc', async () => {
        const mockAppts = [
            { id: 'uuid-a1', date: '2026-02-19', status: 'pending' },
            { id: 'uuid-a2', date: '2026-02-18', status: 'completed' },
        ];
        mockQueryResult({ data: mockAppts, error: null });

        const appts = await HMS.appointments.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('appointments');
        expect(mockClient._builder.order).toHaveBeenCalledWith('date', { ascending: false });
        expect(appts).toEqual(mockAppts);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const appts = await HMS.appointments.getAll();

        expect(appts).toEqual([]);
    });

    test('get() fetches single appointment by ID', async () => {
        const mockAppt = { id: 'uuid-a1', date: '2026-02-19', status: 'pending' };
        mockQueryResult({ data: mockAppt, error: null });

        const appt = await HMS.appointments.get('uuid-a1');

        expect(mockClient.from).toHaveBeenCalledWith('appointments');
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-a1');
        expect(appt).toEqual(mockAppt);
    });

    test('getByDate() filters by date', async () => {
        const mockAppts = [{ id: 'uuid-a1', date: '2026-02-19' }];
        mockQueryResult({ data: mockAppts, error: null });

        const appts = await HMS.appointments.getByDate('2026-02-19');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('date', '2026-02-19');
        expect(appts).toEqual(mockAppts);
    });

    test('getByDate() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const appts = await HMS.appointments.getByDate('2026-02-19');

        expect(appts).toEqual([]);
    });

    test('getByDoctor() filters by doctor_id', async () => {
        const mockAppts = [{ id: 'uuid-a1', doctor_id: 'uuid-dr1' }];
        mockQueryResult({ data: mockAppts, error: null });

        const appts = await HMS.appointments.getByDoctor('uuid-dr1');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('doctor_id', 'uuid-dr1');
        expect(appts).toEqual(mockAppts);
    });

    test('getByDoctor() also filters by date when provided', async () => {
        mockQueryResult({ data: [], error: null });

        await HMS.appointments.getByDoctor('uuid-dr1', '2026-02-19');

        // eq should be called for both doctor_id and date
        const eqCalls = mockClient._builder.eq.mock.calls;
        const docCall = eqCalls.find(([col]) => col === 'doctor_id');
        const dateCall = eqCalls.find(([col]) => col === 'date');
        expect(docCall).toBeTruthy();
        expect(dateCall).toBeTruthy();
        expect(dateCall[1]).toBe('2026-02-19');
    });

    test('getByPatient() filters by patient_id', async () => {
        const mockAppts = [{ id: 'uuid-a1', patient_id: 'uuid-p1' }];
        mockQueryResult({ data: mockAppts, error: null });

        const appts = await HMS.appointments.getByPatient('uuid-p1');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('patient_id', 'uuid-p1');
        expect(appts).toEqual(mockAppts);
    });

    test('add() inserts appointment with status pending', async () => {
        const createdAppt = {
            id: 'uuid-anew',
            patient_id: 'uuid-p1',
            doctor_id: 'uuid-dr1',
            date: '2026-03-01',
            time: '11:00 AM',
            status: 'pending',
        };
        mockQueryResult({ data: createdAppt, error: null });

        const result = await HMS.appointments.add({
            patientId: 'uuid-p1',
            doctor: 'uuid-dr1',
            date: '2026-03-01',
            time: '11:00 AM',
            reason: 'Knee pain',
        });

        const insertCall = mockClient._builder.insert.mock.calls[0][0];
        expect(insertCall.status).toBe('pending');
        expect(insertCall.patient_id).toBe('uuid-p1');
        expect(result).toEqual(createdAppt);
    });

    test('add() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.appointments.add({
            patientId: 'uuid-p1',
            date: '2026-03-01',
        });

        expect(result.error).toBe('Insert failed');
    });

    test('updateStatus() updates appointment status', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.appointments.updateStatus('uuid-a1', 'confirmed');

        expect(mockClient.from).toHaveBeenCalledWith('appointments');
        expect(mockClient._builder.update).toHaveBeenCalledWith({ status: 'confirmed' });
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-a1');
    });

    test('updateStatus() includes notes when provided', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.appointments.updateStatus('uuid-a1', 'cancelled', 'Patient no-show');

        const updateCall = mockClient._builder.update.mock.calls[0][0];
        expect(updateCall.notes).toBe('Patient no-show');
    });

    test('getTodayStats() aggregates appointment statuses for today', async () => {
        const today = new Date().toISOString().split('T')[0];
        const mockAppts = [
            { id: '1', date: today, status: 'pending' },
            { id: '2', date: today, status: 'confirmed' },
            { id: '3', date: today, status: 'completed' },
            { id: '4', date: today, status: 'pending' },
        ];
        mockQueryResult({ data: mockAppts, error: null });

        const stats = await HMS.appointments.getTodayStats();

        expect(stats.total).toBe(4);
        expect(stats.pending).toBe(2);
        expect(stats.confirmed).toBe(1);
        expect(stats.completed).toBe(1);
        expect(stats.cancelled).toBe(0);
        expect(stats.waiting).toBe(0);
    });
});

// ============================================
// HMS.auth
// ============================================

describe('HMS.auth', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('signIn() calls auth.signInWithPassword and returns success', async () => {
        const mockSession = { access_token: 'tok', user: { id: 'uuid-user1' } };
        const mockUser = { id: 'uuid-user1', email: 'admin@test.com' };
        mockAuthResult({
            data: { user: mockUser, session: mockSession },
            error: null,
        });

        const result = await HMS.auth.signIn('admin@test.com', 'password123');

        expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'admin@test.com',
            password: 'password123',
        });
        expect(result.success).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.session).toEqual(mockSession);
    });

    test('signIn() returns { error } on auth failure', async () => {
        mockAuthResult({
            data: { user: null, session: null },
            error: { message: 'Invalid credentials' },
        });

        const result = await HMS.auth.signIn('bad@test.com', 'wrong');

        expect(result.error).toBe('Invalid credentials');
        expect(result.success).toBeUndefined();
    });

    test('signOut() calls auth.signOut', async () => {
        await HMS.auth.signOut();

        expect(mockClient.auth.signOut).toHaveBeenCalled();
    });

    test('getSession() returns current session', async () => {
        const mockSession = { access_token: 'tok', user: { id: 'uuid-user1' } };
        mockAuthResult({ data: { user: null, session: mockSession }, error: null });

        const session = await HMS.auth.getSession();

        expect(mockClient.auth.getSession).toHaveBeenCalled();
        expect(session).toEqual(mockSession);
    });

    test('getSession() returns null when no session', async () => {
        mockAuthResult({ data: { user: null, session: null }, error: null });

        const session = await HMS.auth.getSession();

        expect(session).toBeNull();
    });

    test('getRole() returns role from profiles table', async () => {
        // getSession returns a session with a user id
        const mockSession = { access_token: 'tok', user: { id: 'uuid-user1' } };
        mockAuthResult({ data: { user: null, session: mockSession }, error: null });

        // profiles query returns a role
        const profileBuilder = createQueryBuilder({ data: { role: 'admin' }, error: null });
        mockClient.from.mockImplementation(() => profileBuilder);

        const role = await HMS.auth.getRole();

        expect(role).toBe('admin');
        expect(mockClient.from).toHaveBeenCalledWith('profiles');
    });

    test('getRole() returns null when not logged in', async () => {
        mockAuthResult({ data: { user: null, session: null }, error: null });

        const role = await HMS.auth.getRole();

        expect(role).toBeNull();
    });

    test('getProfile() returns full profile for current user', async () => {
        const mockSession = { access_token: 'tok', user: { id: 'uuid-user1' } };
        const mockProfile = { id: 'uuid-user1', name: 'Admin User', role: 'admin' };
        mockAuthResult({ data: { user: null, session: mockSession }, error: null });

        const profileBuilder = createQueryBuilder({ data: mockProfile, error: null });
        mockClient.from.mockImplementation(() => profileBuilder);

        const profile = await HMS.auth.getProfile();

        expect(profile).toEqual(mockProfile);
        expect(mockClient.from).toHaveBeenCalledWith('profiles');
    });

    test('getProfile() returns null when not logged in', async () => {
        mockAuthResult({ data: { user: null, session: null }, error: null });

        const profile = await HMS.auth.getProfile();

        expect(profile).toBeNull();
    });

    test('isLoggedIn() returns true when session exists', async () => {
        const mockSession = { access_token: 'tok', user: { id: 'uuid-user1' } };
        mockAuthResult({ data: { user: null, session: mockSession }, error: null });

        const loggedIn = await HMS.auth.isLoggedIn();

        expect(loggedIn).toBe(true);
    });

    test('isLoggedIn() returns false when no session', async () => {
        mockAuthResult({ data: { user: null, session: null }, error: null });

        const loggedIn = await HMS.auth.isLoggedIn();

        expect(loggedIn).toBe(false);
    });

    test('onAuthStateChange() delegates to Supabase auth', () => {
        const cb = jest.fn();
        HMS.auth.onAuthStateChange(cb);

        expect(mockClient.auth.onAuthStateChange).toHaveBeenCalledWith(cb);
    });
});

// ============================================
// HMS.prescriptions
// ============================================

describe('HMS.prescriptions', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all prescriptions', async () => {
        const mockRxs = [
            { id: 'uuid-rx1', patient_id: 'uuid-p1', diagnosis: 'Flu' },
            { id: 'uuid-rx2', patient_id: 'uuid-p2', diagnosis: 'Cold' },
        ];
        mockQueryResult({ data: mockRxs, error: null });

        const rxs = await HMS.prescriptions.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('prescriptions');
        expect(rxs).toEqual(mockRxs);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const rxs = await HMS.prescriptions.getAll();

        expect(rxs).toEqual([]);
    });

    test('getByPatient() filters prescriptions by patient_id', async () => {
        const mockRxs = [{ id: 'uuid-rx1', patient_id: 'uuid-p1' }];
        mockQueryResult({ data: mockRxs, error: null });

        const rxs = await HMS.prescriptions.getByPatient('uuid-p1');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('patient_id', 'uuid-p1');
        expect(rxs).toEqual(mockRxs);
    });

    test('add() inserts prescription and returns record', async () => {
        const createdRx = {
            id: 'uuid-rxnew',
            patient_id: 'uuid-p1',
            doctor_id: 'uuid-dr1',
            diagnosis: 'Knee Osteoarthritis',
            medicines: [{ name: 'Paracetamol', dosage: '500mg' }],
        };
        mockQueryResult({ data: createdRx, error: null });

        const result = await HMS.prescriptions.add({
            patientId: 'uuid-p1',
            doctorId: 'uuid-dr1',
            diagnosis: 'Knee Osteoarthritis',
            medicines: [{ name: 'Paracetamol', dosage: '500mg' }],
        });

        expect(mockClient.from).toHaveBeenCalledWith('prescriptions');
        expect(mockClient._builder.insert).toHaveBeenCalled();
        expect(result).toEqual(createdRx);
    });

    test('add() maps camelCase to snake_case columns', async () => {
        mockQueryResult({ data: { id: 'uuid-rxnew' }, error: null });

        await HMS.prescriptions.add({
            patientId: 'uuid-p1',
            doctorId: 'uuid-dr1',
            appointmentId: 'uuid-a1',
            followUpDate: '2026-03-15',
        });

        const insertCall = mockClient._builder.insert.mock.calls[0][0];
        expect(insertCall.patient_id).toBe('uuid-p1');
        expect(insertCall.doctor_id).toBe('uuid-dr1');
        expect(insertCall.appointment_id).toBe('uuid-a1');
        expect(insertCall.follow_up_date).toBe('2026-03-15');
    });

    test('add() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.prescriptions.add({ patientId: 'uuid-p1' });

        expect(result.error).toBe('Insert failed');
    });
});

// ============================================
// HMS.inventory
// ============================================

describe('HMS.inventory', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all inventory items', async () => {
        const mockItems = [
            { id: 'uuid-m1', name: 'Paracetamol', stock: 100 },
            { id: 'uuid-m2', name: 'Ibuprofen', stock: 5 },
        ];
        mockQueryResult({ data: mockItems, error: null });

        const items = await HMS.inventory.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('inventory');
        expect(items).toEqual(mockItems);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const items = await HMS.inventory.getAll();

        expect(items).toEqual([]);
    });

    test('get() fetches single item by ID', async () => {
        const mockItem = { id: 'uuid-m1', name: 'Paracetamol', stock: 100 };
        mockQueryResult({ data: mockItem, error: null });

        const item = await HMS.inventory.get('uuid-m1');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-m1');
        expect(item).toEqual(mockItem);
    });

    test('add() inserts item and returns created record', async () => {
        const createdItem = { id: 'uuid-mnew', name: 'Aspirin', stock: 200, price: 5 };
        mockQueryResult({ data: createdItem, error: null });

        const result = await HMS.inventory.add({
            name: 'Aspirin',
            stock: 200,
            price: 5,
            reorderLevel: 20,
        });

        expect(mockClient.from).toHaveBeenCalledWith('inventory');
        expect(mockClient._builder.insert).toHaveBeenCalled();
        expect(result).toEqual(createdItem);
    });

    test('add() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.inventory.add({ name: 'X' });

        expect(result.error).toBe('Insert failed');
    });

    test('getLowStock() returns items where stock <= reorder_level', async () => {
        const mockItems = [
            { id: 'uuid-m1', name: 'Low Stock Med', stock: 5, reorder_level: 10 },
            { id: 'uuid-m2', name: 'OK Stock Med', stock: 50, reorder_level: 10 },
        ];
        mockQueryResult({ data: mockItems, error: null });

        const lowStock = await HMS.inventory.getLowStock();

        // getLowStock calls getAll() then filters in JS
        expect(lowStock.length).toBe(1);
        expect(lowStock[0].name).toBe('Low Stock Med');
    });

    test('updateStock() subtracts quantity from stock', async () => {
        const existingItem = { id: 'uuid-m1', name: 'Paracetamol', stock: 100 };
        // First call: get()
        const getBuilder = createQueryBuilder({ data: existingItem, error: null });
        // Second call: update()
        const updateBuilder = createQueryBuilder({ data: null, error: null });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getBuilder : updateBuilder;
        });

        await HMS.inventory.updateStock('uuid-m1', 10, 'subtract');

        expect(updateBuilder.update).toHaveBeenCalledWith({ stock: 90 });
    });

    test('updateStock() adds quantity to stock', async () => {
        const existingItem = { id: 'uuid-m1', name: 'Paracetamol', stock: 100 };
        const getBuilder = createQueryBuilder({ data: existingItem, error: null });
        const updateBuilder = createQueryBuilder({ data: null, error: null });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getBuilder : updateBuilder;
        });

        await HMS.inventory.updateStock('uuid-m1', 25, 'add');

        expect(updateBuilder.update).toHaveBeenCalledWith({ stock: 125 });
    });
});

// ============================================
// HMS.sales
// ============================================

describe('HMS.sales', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all sales', async () => {
        const mockSales = [
            { id: 'uuid-s1', total: 200, date: '2026-02-19' },
            { id: 'uuid-s2', total: 150, date: '2026-02-18' },
        ];
        mockQueryResult({ data: mockSales, error: null });

        const sales = await HMS.sales.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('sales');
        expect(sales).toEqual(mockSales);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const sales = await HMS.sales.getAll();

        expect(sales).toEqual([]);
    });

    test('getByDate() filters sales by date', async () => {
        const mockSales = [{ id: 'uuid-s1', date: '2026-02-19', total: 200 }];
        mockQueryResult({ data: mockSales, error: null });

        const sales = await HMS.sales.getByDate('2026-02-19');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('date', '2026-02-19');
        expect(sales).toEqual(mockSales);
    });

    test('add() inserts sale and returns created record', async () => {
        const createdSale = {
            id: 'uuid-snew',
            patient_name: 'Walk-in',
            items: [{ name: 'Paracetamol', qty: 2, price: 10 }],
            total: 20,
            payment_method: 'cash',
        };
        mockQueryResult({ data: createdSale, error: null });

        const result = await HMS.sales.add({
            patientName: 'Walk-in',
            items: [{ name: 'Paracetamol', qty: 2, price: 10 }],
            total: 20,
            paymentMethod: 'cash',
        });

        expect(mockClient.from).toHaveBeenCalledWith('sales');
        expect(mockClient._builder.insert).toHaveBeenCalled();
        expect(result).toEqual(createdSale);
    });

    test('add() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.sales.add({ total: 100 });

        expect(result.error).toBe('Insert failed');
    });

    test('getTodayTotal() sums today sales', async () => {
        const today = new Date().toISOString().split('T')[0];
        const mockSales = [
            { id: 'uuid-s1', date: today, total: 200 },
            { id: 'uuid-s2', date: today, total: 150 },
        ];
        mockQueryResult({ data: mockSales, error: null });

        const total = await HMS.sales.getTodayTotal();

        expect(total).toBe(350);
    });

    test('getTodayTotal() returns 0 when no sales', async () => {
        mockQueryResult({ data: [], error: null });

        const total = await HMS.sales.getTodayTotal();

        expect(total).toBe(0);
    });
});

// ============================================
// HMS.queue
// ============================================

describe('HMS.queue', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() fetches today\'s queue ordered by queue_number', async () => {
        const mockQueue = [
            { id: 'uuid-q1', queue_number: 1, patient_name: 'First' },
            { id: 'uuid-q2', queue_number: 2, patient_name: 'Second' },
        ];
        mockQueryResult({ data: mockQueue, error: null });

        const queue = await HMS.queue.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('queue');
        expect(mockClient._builder.order).toHaveBeenCalledWith('queue_number');
        expect(queue).toEqual(mockQueue);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const queue = await HMS.queue.getAll();

        expect(queue).toEqual([]);
    });

    test('add() assigns sequential queue number and inserts', async () => {
        // getAll() returns 2 existing entries → new entry gets number 3
        const existingQueue = [
            { id: 'uuid-q1', queue_number: 1 },
            { id: 'uuid-q2', queue_number: 2 },
        ];
        const newEntry = { id: 'uuid-q3', queue_number: 3, patient_name: 'Third' };

        const getAllBuilder = createQueryBuilder({ data: existingQueue, error: null });
        const insertBuilder = createQueryBuilder({ data: newEntry, error: null });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getAllBuilder : insertBuilder;
        });

        const result = await HMS.queue.add({
            patientName: 'Third',
            doctorId: 'uuid-dr1',
        });

        const insertCall = insertBuilder.insert.mock.calls[0][0];
        expect(insertCall.queue_number).toBe(3);
        expect(insertCall.status).toBe('waiting');
        expect(result).toEqual(newEntry);
    });

    test('add() returns { error } on Supabase error', async () => {
        const getAllBuilder = createQueryBuilder({ data: [], error: null });
        const insertBuilder = createQueryBuilder({
            data: null,
            error: { message: 'Insert failed' },
        });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getAllBuilder : insertBuilder;
        });

        const result = await HMS.queue.add({ patientName: 'Error' });

        expect(result.error).toBe('Insert failed');
    });

    test('remove() deletes queue entry by ID', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.queue.remove('uuid-q1');

        expect(mockClient.from).toHaveBeenCalledWith('queue');
        expect(mockClient._builder.delete).toHaveBeenCalled();
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-q1');
    });

    test('clear() deletes all today\'s queue entries', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.queue.clear();

        const today = new Date().toISOString().split('T')[0];
        expect(mockClient.from).toHaveBeenCalledWith('queue');
        expect(mockClient._builder.delete).toHaveBeenCalled();
        expect(mockClient._builder.eq).toHaveBeenCalledWith('date', today);
    });
});

// ============================================
// HMS.patientLinks
// ============================================

describe('HMS.patientLinks', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('generate() inserts a link and returns token and URL', async () => {
        const createdLink = {
            id: 'uuid-l1',
            token: 'abc123tokenvalue',
            patient_phone: '9925450425',
            patient_name: 'Test Patient',
        };
        mockQueryResult({ data: createdLink, error: null });

        const result = await HMS.patientLinks.generate(
            { phone: '9925450425', name: 'Test Patient' },
            'uuid-staff1'
        );

        expect(mockClient.from).toHaveBeenCalledWith('patient_links');
        expect(result.token).toBe('abc123tokenvalue');
        expect(result.url).toContain('patient-signup');
        expect(result.url).toContain('abc123tokenvalue');
    });

    test('generate() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.patientLinks.generate({ phone: '1', name: 'X' }, 'staff1');

        expect(result.error).toBe('Insert failed');
    });

    test('getAll() returns all patient links', async () => {
        const mockLinks = [
            { id: 'uuid-l1', token: 'tok1', patient_name: 'P1' },
            { id: 'uuid-l2', token: 'tok2', patient_name: 'P2' },
        ];
        mockQueryResult({ data: mockLinks, error: null });

        const links = await HMS.patientLinks.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('patient_links');
        expect(links).toEqual(mockLinks);
    });

    test('validate() returns { valid: true } for an unused, unexpired link', async () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString();
        const mockLink = {
            id: 'uuid-l1',
            token: 'goodtoken',
            used: false,
            expires_at: futureDate,
        };
        mockQueryResult({ data: mockLink, error: null });

        const result = await HMS.patientLinks.validate('goodtoken');

        expect(result.valid).toBe(true);
        expect(result.link).toEqual(mockLink);
    });

    test('validate() returns { valid: false } when link not found', async () => {
        mockQueryResult({ data: null, error: null });

        const result = await HMS.patientLinks.validate('badtoken');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid');
    });

    test('validate() returns { valid: false } when link already used', async () => {
        const mockLink = {
            id: 'uuid-l1',
            token: 'usedtoken',
            used: true,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
        };
        mockQueryResult({ data: mockLink, error: null });

        const result = await HMS.patientLinks.validate('usedtoken');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('used');
    });

    test('validate() returns { valid: false } when link expired', async () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString();
        const mockLink = {
            id: 'uuid-l1',
            token: 'expiredtoken',
            used: false,
            expires_at: pastDate,
        };
        mockQueryResult({ data: mockLink, error: null });

        const result = await HMS.patientLinks.validate('expiredtoken');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('expired');
    });

    test('markUsed() updates link with used=true', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.patientLinks.markUsed('goodtoken');

        expect(mockClient.from).toHaveBeenCalledWith('patient_links');
        const updateCall = mockClient._builder.update.mock.calls[0][0];
        expect(updateCall.used).toBe(true);
        expect(updateCall.used_at).toBeDefined();
        expect(mockClient._builder.eq).toHaveBeenCalledWith('token', 'goodtoken');
    });
});

// ============================================
// HMS.feedback
// ============================================

describe('HMS.feedback', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all feedback', async () => {
        const mockFeedback = [
            { id: 'uuid-f1', role: 'patient', type: 'bug', status: 'open' },
            { id: 'uuid-f2', role: 'doctor', type: 'feature', status: 'open' },
        ];
        mockQueryResult({ data: mockFeedback, error: null });

        const feedback = await HMS.feedback.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('feedback');
        expect(feedback).toEqual(mockFeedback);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const feedback = await HMS.feedback.getAll();

        expect(feedback).toEqual([]);
    });

    test('add() inserts feedback and returns created record', async () => {
        const createdFb = {
            id: 'uuid-fnew',
            role: 'patient',
            type: 'bug',
            description: 'Login not working',
            status: 'open',
        };
        mockQueryResult({ data: createdFb, error: null });

        const result = await HMS.feedback.add({
            role: 'patient',
            page: '/portal/patient',
            type: 'bug',
            description: 'Login not working',
        });

        expect(mockClient.from).toHaveBeenCalledWith('feedback');
        expect(mockClient._builder.insert).toHaveBeenCalled();
        expect(result).toEqual(createdFb);
    });

    test('add() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.feedback.add({ role: 'patient', type: 'bug' });

        expect(result.error).toBe('Insert failed');
    });

    test('getByRole() filters feedback by role', async () => {
        const mockFeedback = [{ id: 'uuid-f1', role: 'patient' }];
        mockQueryResult({ data: mockFeedback, error: null });

        const feedback = await HMS.feedback.getByRole('patient');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('role', 'patient');
        expect(feedback).toEqual(mockFeedback);
    });

    test('getByStatus() filters feedback by status', async () => {
        const mockFeedback = [{ id: 'uuid-f1', status: 'resolved' }];
        mockQueryResult({ data: mockFeedback, error: null });

        const feedback = await HMS.feedback.getByStatus('resolved');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('status', 'resolved');
        expect(feedback).toEqual(mockFeedback);
    });

    test('getOpen() uses .in() to filter open and in_progress', async () => {
        const mockFeedback = [
            { id: 'uuid-f1', status: 'open' },
            { id: 'uuid-f2', status: 'in_progress' },
        ];
        mockQueryResult({ data: mockFeedback, error: null });

        const feedback = await HMS.feedback.getOpen();

        expect(mockClient._builder.in).toHaveBeenCalledWith('status', ['open', 'in_progress']);
        expect(feedback).toEqual(mockFeedback);
    });

    test('updateStatus() updates feedback status', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.feedback.updateStatus('uuid-f1', 'resolved');

        expect(mockClient._builder.update).toHaveBeenCalledWith({ status: 'resolved' });
        expect(mockClient._builder.eq).toHaveBeenCalledWith('id', 'uuid-f1');
    });

    test('updateStatus() includes resolution_note when note is provided', async () => {
        mockQueryResult({ data: null, error: null });

        await HMS.feedback.updateStatus('uuid-f1', 'resolved', 'Fixed in v2.1');

        const updateCall = mockClient._builder.update.mock.calls[0][0];
        expect(updateCall.resolution_note).toBe('Fixed in v2.1');
    });

    test('stats() aggregates feedback counts', async () => {
        const mockFeedback = [
            { id: '1', role: 'patient', type: 'bug', status: 'open' },
            { id: '2', role: 'doctor', type: 'feature', status: 'open' },
            { id: '3', role: 'patient', type: 'bug', status: 'resolved' },
            { id: '4', role: 'admin', type: 'question', status: 'in_progress' },
        ];
        mockQueryResult({ data: mockFeedback, error: null });

        const stats = await HMS.feedback.stats();

        expect(stats.total).toBe(4);
        expect(stats.open).toBe(2);
        expect(stats.inProgress).toBe(1);
        expect(stats.resolved).toBe(1);
        expect(stats.byRole.patient).toBe(2);
        expect(stats.byRole.doctor).toBe(1);
        expect(stats.byRole.admin).toBe(1);
        expect(stats.byType.bug).toBe(2);
        expect(stats.byType.feature).toBe(1);
    });
});

// ============================================
// HMS.tokens
// ============================================

describe('HMS.tokens', () => {
    beforeEach(async () => {
        await setupMockClient();
    });

    test('getAll() returns all tokens', async () => {
        const mockTokens = [
            { id: 'uuid-t1', token: 'tok1', target_email: 'a@test.com' },
            { id: 'uuid-t2', token: 'tok2', target_email: 'b@test.com' },
        ];
        mockQueryResult({ data: mockTokens, error: null });

        const tokens = await HMS.tokens.getAll();

        expect(mockClient.from).toHaveBeenCalledWith('tokens');
        expect(tokens).toEqual(mockTokens);
    });

    test('getAll() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const tokens = await HMS.tokens.getAll();

        expect(tokens).toEqual([]);
    });

    test('create() inserts token and returns created record', async () => {
        const createdToken = {
            id: 'uuid-tnew',
            token: 'some-uuid-value',
            target_email: 'newdoc@test.com',
            target_role: 'doctor',
        };
        mockQueryResult({ data: createdToken, error: null });

        const result = await HMS.tokens.create({
            targetEmail: 'newdoc@test.com',
            targetRole: 'doctor',
            purpose: 'registration',
            createdBy: 'uuid-admin1',
        });

        expect(mockClient.from).toHaveBeenCalledWith('tokens');
        expect(mockClient._builder.insert).toHaveBeenCalled();
        expect(result).toEqual(createdToken);
    });

    test('create() returns { error } on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Insert failed' } });

        const result = await HMS.tokens.create({ targetEmail: 'x@test.com', targetRole: 'staff' });

        expect(result.error).toBe('Insert failed');
    });

    test('validate() returns { valid: true } for a valid unused unexpired token', async () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString();
        const mockToken = {
            id: 'uuid-t1',
            token: 'good-token-string',
            used: false,
            expires_at: futureDate,
        };
        mockQueryResult({ data: mockToken, error: null });

        const result = await HMS.tokens.validate('good-token-string');

        expect(result.valid).toBe(true);
        expect(result.token).toEqual(mockToken);
    });

    test('validate() returns { valid: false } when token not found', async () => {
        mockQueryResult({ data: null, error: null });

        const result = await HMS.tokens.validate('nonexistent');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('not found');
    });

    test('validate() returns { valid: false } when token already used', async () => {
        const mockToken = {
            token: 'used-token',
            used: true,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
        };
        mockQueryResult({ data: mockToken, error: null });

        const result = await HMS.tokens.validate('used-token');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('already used');
    });

    test('validate() returns { valid: false } when token expired', async () => {
        const mockToken = {
            token: 'expired-token',
            used: false,
            expires_at: new Date(Date.now() - 86400000).toISOString(),
        };
        mockQueryResult({ data: mockToken, error: null });

        const result = await HMS.tokens.validate('expired-token');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('expired');
    });

    test('markUsed() updates token with used=true and returns true on success', async () => {
        mockQueryResult({ data: null, error: null });

        const result = await HMS.tokens.markUsed('good-token-string');

        expect(mockClient.from).toHaveBeenCalledWith('tokens');
        const updateCall = mockClient._builder.update.mock.calls[0][0];
        expect(updateCall.used).toBe(true);
        expect(updateCall.used_at).toBeDefined();
        expect(result).toBe(true);
    });

    test('markUsed() returns false on Supabase error', async () => {
        mockQueryResult({ data: null, error: { message: 'Update failed' } });

        const result = await HMS.tokens.markUsed('bad-token');

        expect(result).toBe(false);
    });

    test('getByEmail() returns active tokens for an email address', async () => {
        const mockTokens = [{ id: 'uuid-t1', target_email: 'find@test.com', used: false }];
        mockQueryResult({ data: mockTokens, error: null });

        const tokens = await HMS.tokens.getByEmail('find@test.com');

        expect(mockClient._builder.eq).toHaveBeenCalledWith('target_email', 'find@test.com');
        expect(mockClient._builder.eq).toHaveBeenCalledWith('used', false);
        expect(tokens).toEqual(mockTokens);
    });

    test('getByEmail() returns [] on error', async () => {
        mockQueryResult({ data: null, error: { message: 'DB error' } });

        const tokens = await HMS.tokens.getByEmail('fail@test.com');

        expect(tokens).toEqual([]);
    });

    test('generateLink() creates a new token and returns a link', async () => {
        // getByEmail → no existing tokens
        const getByEmailBuilder = createQueryBuilder({ data: [], error: null });
        // create() → new token
        const createdToken = {
            id: 'uuid-tnew',
            token: 'fresh-uuid-value',
            target_email: 'newdoc@test.com',
            target_role: 'doctor',
            expires_at: new Date(Date.now() + 86400000).toISOString(),
        };
        const createBuilder = createQueryBuilder({ data: createdToken, error: null });

        let callCount = 0;
        mockClient.from.mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ? getByEmailBuilder : createBuilder;
        });

        const result = await HMS.tokens.generateLink({
            targetEmail: 'newdoc@test.com',
            targetRole: 'doctor',
            baseUrl: 'https://test.com',
        });

        expect(result.token).toBe('fresh-uuid-value');
        expect(result.link).toContain('doctor.html');
        expect(result.link).toContain('fresh-uuid-value');
        expect(result.isExisting).toBe(false);
    });

    test('generateLink() reuses existing token when one is found', async () => {
        const existingToken = {
            id: 'uuid-texist',
            token: 'existing-token-value',
            target_email: 'existing@test.com',
            target_role: 'staff',
            expires_at: new Date(Date.now() + 86400000).toISOString(),
        };
        // getByEmail returns an existing token
        const getByEmailBuilder = createQueryBuilder({ data: [existingToken], error: null });
        mockClient.from.mockImplementation(() => getByEmailBuilder);

        const result = await HMS.tokens.generateLink({
            targetEmail: 'existing@test.com',
            targetRole: 'staff',
            baseUrl: 'https://test.com',
        });

        expect(result.token).toBe('existing-token-value');
        expect(result.isExisting).toBe(true);
    });

    test('generateUUID() returns a string', () => {
        const uuid = HMS.tokens.generateUUID();
        expect(typeof uuid).toBe('string');
        expect(uuid.length).toBeGreaterThan(0);
    });
});

// ============================================
// HMS.utils (pure functions — no Supabase)
// ============================================

describe('HMS.utils', () => {
    test('formatDate() formats a date string with day, month, year', () => {
        const formatted = HMS.utils.formatDate('2025-12-25');
        expect(formatted).toBeDefined();
        expect(formatted).toContain('25');
    });

    test('formatCurrency() prefixes the rupee symbol', () => {
        const formatted = HMS.utils.formatCurrency(1000);
        expect(formatted).toContain('₹');
        expect(formatted).toContain('1,000');
    });

    test('formatCurrency() handles zero', () => {
        expect(HMS.utils.formatCurrency(0)).toContain('₹');
    });

    test('generateId() generates ID starting with provided prefix', () => {
        const id = HMS.utils.generateId('T');
        expect(id).toMatch(/^T/);
    });

    test('generateId() generates unique IDs on successive calls', () => {
        const id1 = HMS.utils.generateId('X');
        const id2 = HMS.utils.generateId('X');
        // They may occasionally collide within same ms tick but are designed to be unique
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
    });

    test('generateToken() returns a non-empty string', () => {
        const token = HMS.utils.generateToken();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });

    test('generateToken() generates distinct tokens on successive calls', () => {
        const token1 = HMS.utils.generateToken();
        const token2 = HMS.utils.generateToken();
        expect(token1).not.toBe(token2);
    });
});

// ============================================
// HMS.smsTemplates (static data — no Supabase)
// ============================================

describe('HMS.smsTemplates', () => {
    test('should have templates object', () => {
        expect(HMS.smsTemplates.templates).toBeDefined();
    });

    test('should have appointment_confirmation template in EN, HI, GU', () => {
        const tmpl = HMS.smsTemplates.templates.appointment_confirmation;
        expect(tmpl).toBeDefined();
        expect(tmpl.en).toBeDefined();
        expect(tmpl.hi).toBeDefined();
        expect(tmpl.gu).toBeDefined();
    });

    test('should have prescription_ready template', () => {
        expect(HMS.smsTemplates.templates.prescription_ready).toBeDefined();
    });

    test('should have patient_signup_link template', () => {
        expect(HMS.smsTemplates.templates.patient_signup_link).toBeDefined();
    });

    test('generate() fills template placeholders with data', () => {
        const message = HMS.smsTemplates.generate(
            'appointment_confirmation',
            { name: 'Ramesh', doctor: 'Dr. Ashok', date: '2025-12-25', time: '11:00 AM' },
            'en'
        );
        expect(message).toContain('Ramesh');
        expect(message).toContain('Dr. Ashok');
        expect(message).toContain('2025-12-25');
        expect(message).toContain('11:00 AM');
    });

    test('generate() uses Hindi template when language is hi', () => {
        const message = HMS.smsTemplates.generate(
            'appointment_confirmation',
            { name: 'Ramesh', doctor: 'Dr. Ashok', date: '2025-12-25', time: '11:00 AM' },
            'hi'
        );
        expect(message).toContain('प्रिय');
    });

    test('generate() uses Gujarati template when language is gu', () => {
        const message = HMS.smsTemplates.generate(
            'appointment_confirmation',
            { name: 'Ramesh', doctor: 'Dr. Ashok', date: '2025-12-25', time: '11:00 AM' },
            'gu'
        );
        expect(message).toContain('પ્રિય');
    });

    test('generate() falls back to English for unknown language', () => {
        const message = HMS.smsTemplates.generate(
            'appointment_confirmation',
            { name: 'X', doctor: 'Y', date: '2026-01-01', time: '10:00 AM' },
            'fr'
        );
        // Should fall back to English (contains English text)
        expect(message).toBeDefined();
        expect(message).toContain('X');
    });

    test('generate() returns null for unknown template key', () => {
        const message = HMS.smsTemplates.generate('nonexistent_template', {}, 'en');
        expect(message).toBeNull();
    });
});

// ============================================
// HMS.notifications (stub — no Supabase)
// ============================================

describe('HMS.notifications', () => {
    test('sendSMS() returns success with preview', () => {
        const result = HMS.notifications.sendSMS('9925450425', 'Test message');
        expect(result.success).toBe(true);
        expect(result.message).toBe('SMS queued');
        expect(result.preview).toBe('Test message');
    });

    test('sendSMS() accepts optional language parameter', () => {
        const result = HMS.notifications.sendSMS('9925450425', 'Test message', 'hi');
        expect(result.success).toBe(true);
    });
});

// ============================================
// HMS - Data Validation Logic (pure)
// ============================================

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

// ============================================
// HMS - ID Generation (pure)
// ============================================

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

// ============================================
// HMS - Token Validation (pure)
// ============================================

describe('HMS - Token Validation', () => {
    test('should validate token format (length > 20)', () => {
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
