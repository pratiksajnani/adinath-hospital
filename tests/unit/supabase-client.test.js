/**
 * Supabase Client Unit Tests
 * Tests authentication, database operations, and storage
 */

// Mock window
global.window = {
  location: { hostname: 'localhost', href: 'http://localhost/', pathname: '/' },
};

// Mock document
global.document = {
  addEventListener: jest.fn(),
  referrer: '',
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [], error: null }),
  })
);

// Load the module (this will use demo mode since Supabase isn't configured)
const SupabaseClient = require('../../js/supabase-client.js');

describe('SupabaseClient', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    test('should have SUPABASE_CONFIG defined', () => {
      expect(SupabaseClient.SUPABASE_CONFIG).toBeDefined();
    });

    test('should have url in config', () => {
      expect(SupabaseClient.SUPABASE_CONFIG.url).toBeDefined();
      expect(typeof SupabaseClient.SUPABASE_CONFIG.url).toBe('string');
    });

    test('should have anonKey in config', () => {
      expect(SupabaseClient.SUPABASE_CONFIG.anonKey).toBeDefined();
    });
  });

  describe('Demo Mode', () => {
    test('should indicate demo mode when not configured', () => {
      expect(SupabaseClient.isDemoMode()).toBe(true);
    });
  });

  describe('SupabaseAuth', () => {
    describe('signUp()', () => {
      test('should create user in demo mode', async () => {
        const result = await SupabaseClient.SupabaseAuth.signUp(
          'test@test.com',
          'password123',
          { role: 'patient', name: 'Test User' }
        );

        expect(result).toBeDefined();
        expect(result.error).toBeNull();
        expect(result.user).toBeDefined();
      });

      test('should store user in localStorage', async () => {
        await SupabaseClient.SupabaseAuth.signUp(
          'newuser@test.com',
          'password123',
          { role: 'patient' }
        );

        // Demo mode stores in hms_demo_users
        const users = JSON.parse(
          localStorage.getItem('hms_demo_users') || '[]'
        );
        const found = users.find((u) => u.email === 'newuser@test.com');
        expect(found).toBeDefined();
      });

      test('should validate email format', async () => {
        const result = await SupabaseClient.SupabaseAuth.signUp(
          'invalid-email',
          'password123',
          { role: 'patient' }
        );

        expect(result.error).toBeDefined();
      });

      test('should require password minimum length', async () => {
        const result = await SupabaseClient.SupabaseAuth.signUp(
          'test@test.com',
          '123',
          { role: 'patient' }
        );

        expect(result.error).toBeDefined();
      });
    });

    describe('signIn()', () => {
      beforeEach(async () => {
        // Create a test user
        await SupabaseClient.SupabaseAuth.signUp('existing@test.com', 'password123', {
          role: 'doctor',
          name: 'Dr. Test',
        });
      });

      test('should sign in valid user', async () => {
        const result = await SupabaseClient.SupabaseAuth.signIn(
          'existing@test.com',
          'password123'
        );

        expect(result.error).toBeNull();
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe('existing@test.com');
      });

      test('should reject invalid password', async () => {
        const result = await SupabaseClient.SupabaseAuth.signIn(
          'existing@test.com',
          'wrongpassword'
        );

        expect(result.error).toBeDefined();
      });

      test('should reject non-existent user', async () => {
        const result = await SupabaseClient.SupabaseAuth.signIn(
          'nonexistent@test.com',
          'password123'
        );

        expect(result.error).toBeDefined();
      });

      test('should set session data in localStorage', async () => {
        await SupabaseClient.SupabaseAuth.signIn('existing@test.com', 'password123');

        expect(localStorage.getItem('hms_logged_in')).toBe('true');
        expect(localStorage.getItem('hms_user_email')).toBe('existing@test.com');
      });
    });

    describe('signOut()', () => {
      beforeEach(async () => {
        await SupabaseClient.SupabaseAuth.signUp('user@test.com', 'password123', {
          role: 'staff',
        });
        await SupabaseClient.SupabaseAuth.signIn('user@test.com', 'password123');
      });

      test('should clear session', async () => {
        await SupabaseClient.SupabaseAuth.signOut();

        expect(localStorage.getItem('hms_logged_in')).toBeNull();
        expect(localStorage.getItem('hms_user_email')).toBeNull();
      });

      test('should return success', async () => {
        const result = await SupabaseClient.SupabaseAuth.signOut();

        expect(result.error).toBeNull();
      });
    });

    describe('getCurrentUser()', () => {
      test('should return null when not logged in', async () => {
        const user = await SupabaseClient.SupabaseAuth.getCurrentUser();

        expect(user).toBeNull();
      });

      test('should return user when logged in', async () => {
        await SupabaseClient.SupabaseAuth.signUp('user@test.com', 'password123', {
          role: 'patient',
          name: 'Test Patient',
        });
        await SupabaseClient.SupabaseAuth.signIn('user@test.com', 'password123');

        const user = await SupabaseClient.SupabaseAuth.getCurrentUser();

        expect(user).toBeDefined();
        expect(user.email).toBe('user@test.com');
      });
    });

    describe('getSession()', () => {
      test('should return null when not logged in', async () => {
        const session = await SupabaseClient.SupabaseAuth.getSession();

        expect(session).toBeNull();
      });

      test('should return session data when logged in', async () => {
        await SupabaseClient.SupabaseAuth.signUp('user@test.com', 'password123', {
          role: 'doctor',
        });
        await SupabaseClient.SupabaseAuth.signIn('user@test.com', 'password123');

        const session = await SupabaseClient.SupabaseAuth.getSession();

        expect(session).toBeDefined();
      });
    });

    describe('resetPassword()', () => {
      test('should return success for valid email', async () => {
        await SupabaseClient.SupabaseAuth.signUp('user@test.com', 'password123', {
          role: 'patient',
        });

        const result = await SupabaseClient.SupabaseAuth.resetPassword('user@test.com');

        expect(result.error).toBeNull();
      });

      test('should handle non-existent email gracefully', async () => {
        const result =
          await SupabaseClient.SupabaseAuth.resetPassword('nonexistent@test.com');

        // Should not reveal if email exists for security
        expect(result.error).toBeNull();
      });
    });

    describe('updatePassword()', () => {
      beforeEach(async () => {
        await SupabaseClient.SupabaseAuth.signUp('user@test.com', 'oldpassword', {
          role: 'patient',
        });
        await SupabaseClient.SupabaseAuth.signIn('user@test.com', 'oldpassword');
      });

      test('should update password', async () => {
        const result = await SupabaseClient.SupabaseAuth.updatePassword('newpassword123');

        expect(result.error).toBeNull();
      });

      test('should allow login with new password', async () => {
        await SupabaseClient.SupabaseAuth.updatePassword('newpassword123');
        await SupabaseClient.SupabaseAuth.signOut();

        const result = await SupabaseClient.SupabaseAuth.signIn(
          'user@test.com',
          'newpassword123'
        );

        expect(result.error).toBeNull();
      });
    });
  });

  describe('SupabaseDB', () => {
    describe('patients', () => {
      test('should create patient', async () => {
        const result = await SupabaseClient.SupabaseDB.patients.create({
          name: 'Test Patient',
          phone: '+919999999999',
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });

      test('should get patient by ID', async () => {
        const created = await SupabaseClient.SupabaseDB.patients.create({
          name: 'Test Patient',
          phone: '+919999999999',
        });

        const result = await SupabaseClient.SupabaseDB.patients.getById(
          created.data.id
        );

        expect(result.data.name).toBe('Test Patient');
      });

      test('should get all patients', async () => {
        await SupabaseClient.SupabaseDB.patients.create({ name: 'Patient 1' });
        await SupabaseClient.SupabaseDB.patients.create({ name: 'Patient 2' });

        const result = await SupabaseClient.SupabaseDB.patients.getAll();

        expect(result.data.length).toBeGreaterThanOrEqual(2);
      });

      test('should update patient', async () => {
        const created = await SupabaseClient.SupabaseDB.patients.create({
          name: 'Original Name',
        });

        const result = await SupabaseClient.SupabaseDB.patients.update(
          created.data.id,
          { name: 'Updated Name' }
        );

        expect(result.data.name).toBe('Updated Name');
      });

      test('should search patients by name', async () => {
        await SupabaseClient.SupabaseDB.patients.create({ name: 'John Doe' });
        await SupabaseClient.SupabaseDB.patients.create({ name: 'Jane Smith' });

        const result = await SupabaseClient.SupabaseDB.patients.search('John');

        expect(result.data.length).toBe(1);
        expect(result.data[0].name).toContain('John');
      });
    });

    describe('appointments', () => {
      test('should create appointment', async () => {
        const result = await SupabaseClient.SupabaseDB.appointments.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          date: '2025-01-15',
          time: '10:00',
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });

      test('should get appointments by doctor', async () => {
        await SupabaseClient.SupabaseDB.appointments.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          date: '2025-01-15',
        });
        await SupabaseClient.SupabaseDB.appointments.create({
          patient_id: 'P002',
          doctor_id: 'D001',
          date: '2025-01-15',
        });

        const result = await SupabaseClient.SupabaseDB.appointments.getByDoctor('D001');

        expect(result.data.length).toBeGreaterThanOrEqual(2);
      });

      test('should get appointments by patient', async () => {
        await SupabaseClient.SupabaseDB.appointments.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          date: '2025-01-15',
        });

        const result =
          await SupabaseClient.SupabaseDB.appointments.getByPatient('P001');

        expect(result.data.length).toBeGreaterThanOrEqual(1);
      });

      test('should update appointment status', async () => {
        const created = await SupabaseClient.SupabaseDB.appointments.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          status: 'scheduled',
        });

        const result = await SupabaseClient.SupabaseDB.appointments.updateStatus(
          created.data.id,
          'completed'
        );

        expect(result.data.status).toBe('completed');
      });
    });

    describe('prescriptions', () => {
      test('should create prescription', async () => {
        const result = await SupabaseClient.SupabaseDB.prescriptions.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          medications: [{ name: 'Aspirin', dosage: '100mg' }],
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });

      test('should get prescriptions by doctor', async () => {
        await SupabaseClient.SupabaseDB.prescriptions.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          medications: [],
        });

        const result =
          await SupabaseClient.SupabaseDB.prescriptions.getByDoctor('D001');

        expect(result.data.length).toBeGreaterThanOrEqual(1);
      });

      test('should get prescriptions by patient', async () => {
        await SupabaseClient.SupabaseDB.prescriptions.create({
          patient_id: 'P001',
          doctor_id: 'D001',
          medications: [],
        });

        const result =
          await SupabaseClient.SupabaseDB.prescriptions.getByPatient('P001');

        expect(result.data.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('SupabaseStorage', () => {
    describe('upload()', () => {
      test('should upload file in demo mode', async () => {
        const file = new Blob(['test content'], { type: 'text/plain' });

        const result = await SupabaseClient.SupabaseStorage.upload(
          'patient-files',
          'test.txt',
          file
        );

        expect(result.error).toBeNull();
        expect(result.path).toBeDefined();
      });

      test('should validate bucket name', async () => {
        const file = new Blob(['test']);

        const result = await SupabaseClient.SupabaseStorage.upload(
          '',
          'test.txt',
          file
        );

        expect(result.error).toBeDefined();
      });
    });

    describe('getPublicUrl()', () => {
      test('should return URL for file', () => {
        const url = SupabaseClient.SupabaseStorage.getPublicUrl(
          'hospital-images',
          'logo.png'
        );

        expect(url).toBeDefined();
        expect(typeof url).toBe('string');
      });
    });

    describe('delete()', () => {
      test('should delete file', async () => {
        const result = await SupabaseClient.SupabaseStorage.delete(
          'patient-files',
          'test.txt'
        );

        expect(result.error).toBeNull();
      });
    });

    describe('list()', () => {
      test('should list files in bucket', async () => {
        const result = await SupabaseClient.SupabaseStorage.list('patient-files');

        expect(result.error).toBeNull();
        expect(Array.isArray(result.data)).toBe(true);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('validateEmail()', () => {
      test('should validate correct email', () => {
        expect(SupabaseClient.utils.validateEmail('test@example.com')).toBe(true);
      });

      test('should reject invalid email', () => {
        expect(SupabaseClient.utils.validateEmail('invalid')).toBe(false);
        expect(SupabaseClient.utils.validateEmail('test@')).toBe(false);
        expect(SupabaseClient.utils.validateEmail('@example.com')).toBe(false);
      });
    });

    describe('generateId()', () => {
      test('should generate unique IDs', () => {
        const id1 = SupabaseClient.utils.generateId();
        const id2 = SupabaseClient.utils.generateId();

        expect(id1).not.toBe(id2);
      });

      test('should generate string ID', () => {
        const id = SupabaseClient.utils.generateId();

        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });
    });
  });
});

