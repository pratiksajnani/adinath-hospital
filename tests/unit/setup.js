/**
 * Jest Setup File
 * Global mocks and setup for unit and integration tests
 */

// ============================================
// STORAGE MOCKS
// ============================================

const createStorageMock = () => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = String(value);
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (i) => Object.keys(store)[i] || null,
    };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
});

// ============================================
// LOCATION MOCK
// ============================================

const mockLocationMethods = () => {
    if (typeof window !== 'undefined' && window.location) {
        window.location.assign = jest.fn();
        window.location.replace = jest.fn();
        window.location.reload = jest.fn();
    }
};

const createLocationMock = () => ({
    _href: 'http://localhost/',
    hostname: 'localhost',
    pathname: '/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    search: '',
    hash: '',
    get href() {
        return this._href;
    },
    set href(value) {
        this._href = value;
    },
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
});

global.createLocationMock = createLocationMock;

mockLocationMethods();

if (typeof global.window === 'undefined') {
    global.window = {
        location: createLocationMock(),
    };
}

Object.assign(global.window, {
    open: jest.fn(),
    alert: jest.fn(),
    confirm: jest.fn(() => true),
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    onerror: null,
    onunhandledrejection: null,
});

if (typeof global.location === 'undefined') {
    global.location = createLocationMock();
}

// ============================================
// DOCUMENT MOCK
// ============================================

global.document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(() => ({
        style: {},
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            toggle: jest.fn(),
            contains: jest.fn(() => false),
        },
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn(() => null),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        innerHTML: '',
        textContent: '',
        value: '',
        focus: jest.fn(),
        remove: jest.fn(),
        async: false,
        src: '',
        onload: null,
        onerror: null,
    })),
    body: {
        appendChild: jest.fn(),
        insertAdjacentHTML: jest.fn(),
        append: jest.fn(),
    },
    head: {
        appendChild: jest.fn(),
    },
    getElementById: jest.fn(() => null),
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    referrer: '',
};

// ============================================
// NAVIGATOR MOCK
// ============================================

global.navigator = {
    userAgent: 'Mozilla/5.0 Test Browser',
    language: 'en-US',
    onLine: true,
};

// ============================================
// PERFORMANCE MOCK
// ============================================

global.performance = {
    now: jest.fn(() => Date.now()),
    timing: {
        navigationStart: Date.now() - 1000,
        responseStart: Date.now() - 800,
        responseEnd: Date.now() - 700,
        domContentLoadedEventEnd: Date.now() - 500,
        loadEventEnd: Date.now() - 100,
        domInteractive: Date.now() - 600,
    },
    getEntriesByType: jest.fn(() => []),
};

// ============================================
// CRYPTO MOCK
// ============================================

global.crypto = {
    getRandomValues: jest.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    }),
    randomUUID: jest.fn(
        () =>
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            })
    ),
};

// ============================================
// FETCH MOCK
// ============================================

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    })
);

// ============================================
// MISC BROWSER API MOCKS
// ============================================

global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn(() => '');

global.Blob = class Blob {
    constructor(content, options) {
        this.content = content;
        this.options = options;
        this.size = content.reduce((acc, val) => acc + val.length, 0);
        this.type = options?.type || '';
    }
};

global.URL = {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
};

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
}));

global.MutationObserver = class MutationObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
};

global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// ============================================
// CONSOLE MOCK
// ============================================

const originalConsole = { ...console };
global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// ============================================
// CONFIG MOCK (read by HMS.init())
// ============================================

global.CONFIG = {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    BASE_URL: '',
};

// ============================================
// HMS MOCK (used by access-control.js, user-status.js at module load)
// ============================================

global.HMS = {
    auth: {
        getRole: jest.fn().mockResolvedValue(null),
        getProfile: jest.fn().mockResolvedValue(null),
        signOut: jest.fn().mockResolvedValue(undefined),
        login: jest.fn().mockResolvedValue({ error: null }),
    },
    init: jest.fn().mockResolvedValue({}),
};

// ============================================
// SUPABASE CLIENT MOCK
// ============================================

/**
 * Creates a chainable Supabase query builder that also acts as a thenable.
 * Every chaining method returns `this` so chains like
 *   .from('x').select('*').eq('id', 1).single()
 * all resolve to { data, error } when awaited.
 *
 * @param {object} resolveValue - The { data, error } to resolve with.
 */
function createQueryBuilder(resolveValue = { data: null, error: null }) {
    const builder = {
        _resolveValue: resolveValue,
        select: jest.fn(function () {
            return this;
        }),
        insert: jest.fn(function () {
            return this;
        }),
        update: jest.fn(function () {
            return this;
        }),
        delete: jest.fn(function () {
            return this;
        }),
        eq: jest.fn(function () {
            return this;
        }),
        neq: jest.fn(function () {
            return this;
        }),
        not: jest.fn(function () {
            return this;
        }),
        or: jest.fn(function () {
            return this;
        }),
        in: jest.fn(function () {
            return this;
        }),
        gt: jest.fn(function () {
            return this;
        }),
        order: jest.fn(function () {
            return this;
        }),
        // .single() returns a Promise directly (not `this`)
        single: jest.fn(function () {
            return Promise.resolve(this._resolveValue);
        }),
        // Make the builder itself thenable so chains that don't end with
        // .single() also resolve when awaited (e.g. getAll, delete).
        then: function (resolve, reject) {
            return Promise.resolve(this._resolveValue).then(resolve, reject);
        },
    };
    return builder;
}

/**
 * Creates a fresh mock Supabase client.
 * `.from()` is a jest.fn() so tests can assert which table was queried.
 * The query builder it returns is stored on `mockClient._builder` so
 * individual tests can inspect or override it.
 *
 * Auth methods mirror the real Supabase auth API and resolve to sensible
 * defaults that tests can override with mockAuthResult().
 */
function createMockSupabaseClient() {
    const client = {
        // Holds the last builder created by .from(); tests can read this.
        _builder: null,
        _authResult: { data: { user: null, session: null }, error: null },

        from: jest.fn(function (table) {
            client._builder = createQueryBuilder(client._builder?._resolveValue ?? { data: null, error: null });
            return client._builder;
        }),

        auth: {
            signInWithPassword: jest.fn(() =>
                Promise.resolve(client._authResult)
            ),
            signInWithOAuth: jest.fn(() =>
                Promise.resolve(client._authResult)
            ),
            signInWithOtp: jest.fn(() =>
                Promise.resolve(client._authResult)
            ),
            verifyOtp: jest.fn(() =>
                Promise.resolve(client._authResult)
            ),
            signOut: jest.fn(() =>
                Promise.resolve({ error: null })
            ),
            getSession: jest.fn(() =>
                Promise.resolve({ data: { session: client._authResult.data.session }, error: null })
            ),
            getUser: jest.fn(() =>
                Promise.resolve({ data: { user: client._authResult.data.user }, error: null })
            ),
            onAuthStateChange: jest.fn((cb) => {
                // Return an unsubscribe-style object like the real Supabase client
                return { data: { subscription: { unsubscribe: jest.fn() } } };
            }),
        },
    };

    return client;
}

// Expose createQueryBuilder so test files can build custom builders.
global.createQueryBuilder = createQueryBuilder;

// The global supabase namespace that HMS.init() looks for.
global.supabase = {
    createClient: jest.fn(),
};

// Expose factory so test files can create fresh clients.
global.createMockSupabaseClient = createMockSupabaseClient;

/**
 * Helper used inside test files to set the { data, error } that the NEXT
 * Supabase query will resolve with.
 *
 * Usage (in a test):
 *   mockQueryResult({ data: [...], error: null });
 *   const result = await HMS.patients.getAll();
 *
 * The helper replaces the builder's _resolveValue so both thenable and
 * .single() resolution use the same value.
 *
 * @param {object} result - { data, error }
 * @param {object} client - the mock client (defaults to the last one set up)
 */
global.mockQueryResult = function mockQueryResult(result, client) {
    const target = client || global._currentMockClient;
    if (!target) {
        throw new Error(
            'mockQueryResult: no mock client found. Call setupMockClient() first.'
        );
    }
    // Pre-seed the builder so .from() picks it up
    target._builder = createQueryBuilder(result);
    // Override .from() so it always returns the seeded builder
    target.from.mockImplementation(() => target._builder);
};

/**
 * Helper to override the auth result returned by auth methods.
 *
 * @param {object} authData - { data: { user, session }, error }
 * @param {object} client   - the mock client
 */
global.mockAuthResult = function mockAuthResult(authData, client) {
    const target = client || global._currentMockClient;
    if (!target) {
        throw new Error(
            'mockAuthResult: no mock client found. Call setupMockClient() first.'
        );
    }
    target._authResult = authData;
    // Re-bind auth methods to use the updated _authResult
    target.auth.signInWithPassword.mockImplementation(() =>
        Promise.resolve(target._authResult)
    );
    target.auth.signInWithOAuth.mockImplementation(() =>
        Promise.resolve(target._authResult)
    );
    target.auth.signInWithOtp.mockImplementation(() =>
        Promise.resolve(target._authResult)
    );
    target.auth.verifyOtp.mockImplementation(() =>
        Promise.resolve(target._authResult)
    );
    target.auth.getSession.mockImplementation(() =>
        Promise.resolve({
            data: { session: target._authResult.data.session },
            error: null,
        })
    );
    target.auth.getUser.mockImplementation(() =>
        Promise.resolve({
            data: { user: target._authResult.data.user },
            error: null,
        })
    );
};

// ============================================
// PER-TEST RESET
// ============================================

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    global.fetch.mockClear();

    // Reset supabase.createClient mock (individual test files set the return value)
    global.supabase.createClient.mockReset();

    // Clear the tracked current mock client
    global._currentMockClient = null;
});

afterAll(() => {
    jest.restoreAllMocks();
});
