/**
 * Authentication Flow Integration Tests
 * Tests the complete auth flow against the Supabase-backed HMS module.
 * All Supabase calls are mocked — no real network requests are made.
 */

// ============================================================
// Mock setup — must happen before require('../../js/hms.js')
// ============================================================

const mockAuth = {
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signInWithOtp: jest.fn(),
    verifyOtp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
};

// Chainable query builder for from().select().eq().single() patterns
const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    // Thenables for chains that don't end with .single()
    then: function (resolve) {
        return Promise.resolve({ data: null, error: null }).then(resolve);
    },
};

const mockClient = {
    auth: mockAuth,
    from: jest.fn().mockReturnValue(mockQueryBuilder),
};

// Globals required by hms.js
global.CONFIG = {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-key',
    BASE_URL: '',
};
global.supabase = { createClient: jest.fn().mockReturnValue(mockClient) };
global.window = {
    location: { hostname: 'localhost', pathname: '/', origin: 'http://localhost' },
};
global.document = { addEventListener: jest.fn() };
global.alert = jest.fn();

const HMS = require('../../js/hms.js');

// ============================================================
// Helpers
// ============================================================

/** Reset all mock call history and re-wire default return values. */
function resetMocks() {
    jest.clearAllMocks();

    // Restore chainable returns that clearAllMocks() wipes
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.eq.mockReturnThis();
    mockQueryBuilder.order.mockReturnThis();
    mockQueryBuilder.insert.mockReturnThis();
    mockQueryBuilder.update.mockReturnThis();
    mockQueryBuilder.delete.mockReturnThis();
    mockQueryBuilder.not.mockReturnThis();
    mockQueryBuilder.or.mockReturnThis();
    mockQueryBuilder.in.mockReturnThis();
    mockQueryBuilder.gt.mockReturnThis();
    mockClient.from.mockReturnValue(mockQueryBuilder);

    // Default: no active session
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    mockAuth.getUser.mockResolvedValue({ data: { user: null } });
    mockAuth.signOut.mockResolvedValue({ error: null });
    mockAuth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });

    // Ensure HMS uses the mock client (re-init after each reset)
    HMS._supabase = mockClient;
}

// ============================================================
// signIn
// ============================================================

describe('HMS.auth.signIn', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('returns success with user and session on valid credentials', async () => {
        const mockUser = { id: 'user-001', email: 'drsajnani@gmail.com' };
        const mockSession = { access_token: 'tok123', user: mockUser };
        mockAuth.signInWithPassword.mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
        });

        const result = await HMS.auth.signIn('drsajnani@gmail.com', 'doctor123');

        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
            email: 'drsajnani@gmail.com',
            password: 'doctor123',
        });
        expect(result.success).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.session).toEqual(mockSession);
        expect(result.error).toBeUndefined();
    });

    test('returns error message on invalid credentials', async () => {
        mockAuth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
        });

        const result = await HMS.auth.signIn('nobody@test.com', 'wrongpassword');

        expect(result.error).toBe('Invalid login credentials');
        expect(result.success).toBeUndefined();
    });

    test('returns error message when account is disabled', async () => {
        mockAuth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Email not confirmed' },
        });

        const result = await HMS.auth.signIn('unconfirmed@test.com', 'pass123');

        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
    });
});

// ============================================================
// signOut
// ============================================================

describe('HMS.auth.signOut', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('calls supabase signOut', async () => {
        mockAuth.signOut.mockResolvedValue({ error: null });

        await HMS.auth.signOut();

        expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    });

    test('after signOut, getSession returns null', async () => {
        // Simulate an active session, then sign out
        const mockUser = { id: 'user-002', email: 'drsajnani@gmail.com' };
        mockAuth.signInWithPassword.mockResolvedValue({
            data: { user: mockUser, session: { access_token: 'tok', user: mockUser } },
            error: null,
        });

        await HMS.auth.signIn('drsajnani@gmail.com', 'doctor123');

        // After sign out, session returns null
        mockAuth.getSession.mockResolvedValue({ data: { session: null } });
        await HMS.auth.signOut();

        const session = await HMS.auth.getSession();
        expect(session).toBeNull();
    });

    test('logs error but does not throw if signOut fails', async () => {
        mockAuth.signOut.mockResolvedValue({ error: { message: 'Network error' } });

        // Should not throw
        await expect(HMS.auth.signOut()).resolves.toBeUndefined();
    });
});

// ============================================================
// getSession
// ============================================================

describe('HMS.auth.getSession', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('returns session object when logged in', async () => {
        const mockSession = { access_token: 'abc', user: { id: 'u1', email: 'a@test.com' } };
        mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });

        const session = await HMS.auth.getSession();

        expect(session).toEqual(mockSession);
    });

    test('returns null when not logged in', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: null } });

        const session = await HMS.auth.getSession();

        expect(session).toBeNull();
    });
});

// ============================================================
// isLoggedIn
// ============================================================

describe('HMS.auth.isLoggedIn', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('returns true when session exists', async () => {
        mockAuth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok', user: { id: 'u1' } } },
        });

        const loggedIn = await HMS.auth.isLoggedIn();

        expect(loggedIn).toBe(true);
    });

    test('returns false when no session', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: null } });

        const loggedIn = await HMS.auth.isLoggedIn();

        expect(loggedIn).toBe(false);
    });
});

// ============================================================
// getRole
// ============================================================

describe('HMS.auth.getRole', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('returns role from profiles table when session exists', async () => {
        const mockSession = { user: { id: 'user-admin-001' } };
        mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });
        mockQueryBuilder.single.mockResolvedValue({ data: { role: 'admin' }, error: null });

        const role = await HMS.auth.getRole();

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(mockQueryBuilder.select).toHaveBeenCalledWith('role');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'user-admin-001');
        expect(role).toBe('admin');
    });

    test('returns doctor role for doctor user', async () => {
        const mockSession = { user: { id: 'user-doctor-002' } };
        mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });
        mockQueryBuilder.single.mockResolvedValue({ data: { role: 'doctor' }, error: null });

        const role = await HMS.auth.getRole();

        expect(role).toBe('doctor');
    });

    test('returns null when no active session', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: null } });

        const role = await HMS.auth.getRole();

        expect(role).toBeNull();
        // Should not query profiles when there is no session
        expect(mockClient.from).not.toHaveBeenCalled();
    });

    test('returns null when profile data is missing', async () => {
        const mockSession = { user: { id: 'user-no-profile' } };
        mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });
        mockQueryBuilder.single.mockResolvedValue({ data: null, error: null });

        const role = await HMS.auth.getRole();

        expect(role).toBeNull();
    });
});

// ============================================================
// getProfile
// ============================================================

describe('HMS.auth.getProfile', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('returns full profile row when session exists', async () => {
        const mockSession = { user: { id: 'user-003' } };
        const mockProfile = {
            id: 'user-003',
            email: 'reception@adinathhealth.com',
            name: 'Poonam',
            role: 'receptionist',
            active: true,
        };
        mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });
        mockQueryBuilder.single.mockResolvedValue({ data: mockProfile, error: null });

        const profile = await HMS.auth.getProfile();

        expect(mockClient.from).toHaveBeenCalledWith('profiles');
        expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'user-003');
        expect(profile).toEqual(mockProfile);
    });

    test('returns null when no active session', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: null } });

        const profile = await HMS.auth.getProfile();

        expect(profile).toBeNull();
        expect(mockClient.from).not.toHaveBeenCalled();
    });

    test('returns null when profile query returns no data', async () => {
        const mockSession = { user: { id: 'user-404' } };
        mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });
        mockQueryBuilder.single.mockResolvedValue({ data: null, error: null });

        const profile = await HMS.auth.getProfile();

        expect(profile).toBeNull();
    });
});

// ============================================================
// OAuth flow
// ============================================================

describe('HMS.auth.signInWithOAuth', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('initiates Google OAuth and returns success', async () => {
        const mockOAuthData = { provider: 'google', url: 'https://accounts.google.com/o/oauth2/...' };
        mockAuth.signInWithOAuth.mockResolvedValue({
            data: mockOAuthData,
            error: null,
        });

        const result = await HMS.auth.signInWithOAuth('google');

        expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
            provider: 'google',
            options: {},
        });
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockOAuthData);
    });

    test('passes options object through to supabase', async () => {
        const options = { redirectTo: 'https://adinathhealth.com/portal/admin/' };
        mockAuth.signInWithOAuth.mockResolvedValue({ data: {}, error: null });

        await HMS.auth.signInWithOAuth('google', options);

        expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
            provider: 'google',
            options,
        });
    });

    test('returns error when OAuth fails', async () => {
        mockAuth.signInWithOAuth.mockResolvedValue({
            data: null,
            error: { message: 'OAuth provider error' },
        });

        const result = await HMS.auth.signInWithOAuth('google');

        expect(result.error).toBe('OAuth provider error');
        expect(result.success).toBeUndefined();
    });
});

// ============================================================
// OTP flow
// ============================================================

describe('HMS.auth.signInWithOtp', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('sends OTP to phone number', async () => {
        mockAuth.signInWithOtp.mockResolvedValue({ data: {}, error: null });

        const result = await HMS.auth.signInWithOtp({ phone: '+919925450425' });

        expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({ phone: '+919925450425' });
        expect(result.success).toBe(true);
    });

    test('sends OTP to email address', async () => {
        mockAuth.signInWithOtp.mockResolvedValue({ data: {}, error: null });

        const result = await HMS.auth.signInWithOtp({ email: 'patient@test.com' });

        expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({ email: 'patient@test.com' });
        expect(result.success).toBe(true);
    });

    test('returns error when OTP send fails', async () => {
        mockAuth.signInWithOtp.mockResolvedValue({
            data: null,
            error: { message: 'Phone number invalid' },
        });

        const result = await HMS.auth.signInWithOtp({ phone: 'invalid' });

        expect(result.error).toBe('Phone number invalid');
    });
});

describe('HMS.auth.verifyOtp', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('verifies OTP and returns user and session on success', async () => {
        const mockUser = { id: 'user-otp-001', phone: '+919925450425' };
        const mockSession = { access_token: 'otp-token', user: mockUser };
        mockAuth.verifyOtp.mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
        });

        const result = await HMS.auth.verifyOtp({
            phone: '+919925450425',
            token: '123456',
            type: 'sms',
        });

        expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
            phone: '+919925450425',
            token: '123456',
            type: 'sms',
        });
        expect(result.success).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.session).toEqual(mockSession);
    });

    test('returns error for expired OTP', async () => {
        mockAuth.verifyOtp.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Token has expired or is invalid' },
        });

        const result = await HMS.auth.verifyOtp({
            phone: '+919925450425',
            token: '000000',
            type: 'sms',
        });

        expect(result.error).toBe('Token has expired or is invalid');
        expect(result.success).toBeUndefined();
    });

    test('returns error for wrong OTP', async () => {
        mockAuth.verifyOtp.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'OTP does not match' },
        });

        const result = await HMS.auth.verifyOtp({
            phone: '+919925450425',
            token: '999999',
            type: 'sms',
        });

        expect(result.error).toBeDefined();
    });
});

// ============================================================
// No localStorage for auth state
// ============================================================

describe('Auth state — no localStorage', () => {
    beforeEach(() => {
        resetMocks();
    });

    test('signIn does not write to localStorage', async () => {
        const mockUser = { id: 'u1', email: 'drsajnani@gmail.com' };
        mockAuth.signInWithPassword.mockResolvedValue({
            data: { user: mockUser, session: { access_token: 'tok', user: mockUser } },
            error: null,
        });

        await HMS.auth.signIn('drsajnani@gmail.com', 'doctor123');

        // localStorage should not be touched for auth state
        expect(localStorage.getItem('hms_logged_in')).toBeNull();
        expect(localStorage.getItem('hms_role')).toBeNull();
        expect(localStorage.getItem('hms_current_user')).toBeNull();
        expect(localStorage.getItem('hms_user_email')).toBeNull();
    });

    test('signOut does not depend on localStorage', async () => {
        mockAuth.signOut.mockResolvedValue({ error: null });

        // Should work even with empty localStorage
        await expect(HMS.auth.signOut()).resolves.not.toThrow();
    });

    test('isLoggedIn is determined by Supabase session, not localStorage', async () => {
        // Simulate localStorage having stale values (old auth system remnant)
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');

        // But Supabase says no session
        mockAuth.getSession.mockResolvedValue({ data: { session: null } });

        const loggedIn = await HMS.auth.isLoggedIn();

        // Supabase wins — localStorage values are irrelevant
        expect(loggedIn).toBe(false);
    });
});
