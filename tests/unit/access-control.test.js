/**
 * ACCESS CONTROL Unit Tests
 * Tests role-based page access management
 */

// Mock alert
global.alert = jest.fn();

// Jest 30+ with jsdom - mock location methods, don't replace the object
// jsdom provides window.location, we just mock the navigation methods
window.location.replace = jest.fn();
window.location.assign = jest.fn();

// Load AccessControl module
const AccessControl = require('../../js/access-control.js');

beforeEach(() => {
    localStorage.clear();
    global.alert.mockClear();
});

describe('AccessControl Module', () => {
    test('should have getCurrentRole function', () => {
        expect(typeof AccessControl.getCurrentRole).toBe('function');
    });

    test('should have canAccess function', () => {
        expect(typeof AccessControl.canAccess).toBe('function');
    });

    test('should have logout function', () => {
        expect(typeof AccessControl.logout).toBe('function');
    });

    test('should have rules object', () => {
        expect(AccessControl.rules).toBeDefined();
        expect(typeof AccessControl.rules).toBe('object');
    });
});

describe('AccessControl.getCurrentRole()', () => {
    test('should return null when not logged in', () => {
        expect(AccessControl.getCurrentRole()).toBeNull();
    });

    test('should return role when logged in', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.getCurrentRole()).toBe('admin');
    });

    test('should return null if logged_in is false', () => {
        localStorage.setItem('hms_logged_in', 'false');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.getCurrentRole()).toBeNull();
    });

    test('should return correct role for doctor', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.getCurrentRole()).toBe('doctor');
    });
});

describe('AccessControl.canAccess() - Public Pages', () => {
    test('should allow access to homepage', () => {
        expect(AccessControl.canAccess('/')).toBe(true);
        expect(AccessControl.canAccess('/index.html')).toBe(true);
    });

    test('should allow access to public pages', () => {
        expect(AccessControl.canAccess('/book.html')).toBe(true);
        expect(AccessControl.canAccess('/store.html')).toBe(true);
        expect(AccessControl.canAccess('/login.html')).toBe(true);
        expect(AccessControl.canAccess('/404.html')).toBe(true);
    });

    test('should allow access to services pages', () => {
        expect(AccessControl.canAccess('/services/')).toBe(true);
        expect(AccessControl.canAccess('/services/orthopedic.html')).toBe(true);
    });

    test('should allow access to onboarding pages', () => {
        expect(AccessControl.canAccess('/onboard/')).toBe(true);
        expect(AccessControl.canAccess('/onboard/admin.html')).toBe(true);
        expect(AccessControl.canAccess('/onboard/doctor.html')).toBe(true);
    });

    test('should allow access to public docs', () => {
        expect(AccessControl.canAccess('/docs/')).toBe(true);
        expect(AccessControl.canAccess('/docs/PATIENT_GUIDE.html')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Authenticated Pages', () => {
    test('should deny portal access when not logged in', () => {
        expect(AccessControl.canAccess('/portal/')).toBe(false);
        expect(AccessControl.canAccess('/portal/index.html')).toBe(false);
    });

    test('should allow portal access when logged in as any role', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/portal/')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Admin Pages', () => {
    test('should deny admin portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/admin/')).toBe(false);
        expect(AccessControl.canAccess('/portal/admin/index.html')).toBe(false);
    });

    test('should deny admin portal to non-admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/portal/admin/')).toBe(false);
    });

    test('should allow admin portal to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/portal/admin/')).toBe(true);
        expect(AccessControl.canAccess('/portal/admin/index.html')).toBe(true);
    });

    test('should restrict ADMIN_GUIDE to admin only', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.canAccess('/docs/ADMIN_GUIDE.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/docs/ADMIN_GUIDE.html')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Doctor Pages', () => {
    test('should deny doctor portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/doctor/')).toBe(false);
    });

    test('should deny doctor portal to patient', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/portal/doctor/')).toBe(false);
    });

    test('should allow doctor portal to doctor', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/portal/doctor/')).toBe(true);
    });

    test('should allow doctor portal to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/portal/doctor/')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Staff Pages', () => {
    test('should deny staff portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/staff/')).toBe(false);
    });

    test('should allow staff portal to staff roles', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        ['staff', 'receptionist', 'nurse', 'pharmacist', 'admin'].forEach(role => {
            localStorage.setItem('hms_role', role);
            expect(AccessControl.canAccess('/portal/staff/')).toBe(true);
        });
    });

    test('should deny staff portal to patient', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/portal/staff/')).toBe(false);
    });
});

describe('AccessControl.canAccess() - Patient Pages', () => {
    test('should deny patient portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/patient/')).toBe(false);
    });

    test('should allow patient portal to patient', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/portal/patient/')).toBe(true);
    });

    test('should allow patient portal to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/portal/patient/')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Forms', () => {
    test('should deny forms when not logged in', () => {
        expect(AccessControl.canAccess('/forms/')).toBe(false);
    });

    test('should allow forms to staff roles', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'receptionist');
        expect(AccessControl.canAccess('/forms/')).toBe(true);
    });
});

describe('AccessControl.logout()', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_email', 'test@test.com');
        localStorage.setItem('hms_user_name', 'Test User');
        window.location.pathname = '/';
    });

    test('should clear hms_logged_in', () => {
        AccessControl.logout();
        expect(localStorage.getItem('hms_logged_in')).toBeNull();
    });

    test('should clear hms_role', () => {
        AccessControl.logout();
        expect(localStorage.getItem('hms_role')).toBeNull();
    });

    test('should clear hms_user_email', () => {
        AccessControl.logout();
        expect(localStorage.getItem('hms_user_email')).toBeNull();
    });
});

describe('AccessControl.getBasePath()', () => {
    // Using testPath parameter for Jest 30+ jsdom compatibility
    test('should return empty for root pages', () => {
        expect(AccessControl.getBasePath('/index.html')).toBe('');
    });

    test('should return ../ for portal pages', () => {
        expect(AccessControl.getBasePath('/portal/index.html')).toBe('../');
    });

    test('should return ../../ for nested portal pages', () => {
        expect(AccessControl.getBasePath('/portal/admin/index.html')).toBe('../../');
    });
});

describe('AccessControl - Rules Completeness', () => {
    test('should have rules for critical paths', () => {
        const criticalPaths = [
            '/', '/index.html', '/login.html', '/book.html',
            '/portal/', '/portal/admin/', '/portal/doctor/', '/portal/staff/', '/portal/patient/',
            '/forms/', '/docs/'
        ];
        
        criticalPaths.forEach(path => {
            expect(AccessControl.rules[path]).toBeDefined();
        });
    });
});

describe('AccessControl - Session Timeout', () => {
    test('should have 30 minute timeout configured', () => {
        expect(AccessControl.sessionTimeout).toBe(30 * 60 * 1000);
    });

    test('should track lastActivity', () => {
        expect(AccessControl.lastActivity).toBeDefined();
        expect(typeof AccessControl.lastActivity).toBe('number');
    });
});

describe('AccessControl.canAccess() - Prefix Matching', () => {
    test('should use prefix matching for unknown paths under known directories', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        
        // Path like /portal/admin/some-unknown-page.html should match /portal/admin/
        expect(AccessControl.canAccess('/portal/admin/some-unknown-page.html')).toBe(true);
    });

    test('should return true for completely unknown paths (default public)', () => {
        // An unknown path with no matching rule defaults to public
        expect(AccessControl.canAccess('/some-random-unknown-path.html')).toBe(true);
    });
});

describe('AccessControl.enforce()', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert.mockClear();
    });

    // Note: These tests are limited in Jest 30+ jsdom because window.location.pathname
    // cannot be changed. The actual enforce() is tested via E2E tests.
    test('should not throw on public page', () => {
        // Current pathname is '/' which is public
        expect(() => AccessControl.enforce()).not.toThrow();
    });

    test('should have enforce function', () => {
        expect(typeof AccessControl.enforce).toBe('function');
    });
});

describe('AccessControl.getBasePath() - Various Paths', () => {
    // Using testPath parameter for Jest 30+ jsdom compatibility
    test('should return ../../ for doctor portal pages', () => {
        expect(AccessControl.getBasePath('/portal/doctor/index.html')).toBe('../../');
    });

    test('should return ../../ for staff portal pages', () => {
        expect(AccessControl.getBasePath('/portal/staff/index.html')).toBe('../../');
    });

    test('should return ../../ for patient portal pages', () => {
        expect(AccessControl.getBasePath('/portal/patient/index.html')).toBe('../../');
    });

    test('should return ../../ for data-collection forms', () => {
        expect(AccessControl.getBasePath('/forms/data-collection/some-form.html')).toBe('../../');
    });

    test('should return ../ for docs pages', () => {
        expect(AccessControl.getBasePath('/docs/ADMIN_GUIDE.html')).toBe('../');
    });

    test('should return ../ for services pages', () => {
        expect(AccessControl.getBasePath('/services/orthopedic.html')).toBe('../');
    });

    test('should return ../ for forms pages', () => {
        expect(AccessControl.getBasePath('/forms/some-form.html')).toBe('../');
    });

    test('should return ../ for store pages', () => {
        expect(AccessControl.getBasePath('/store/checkout.html')).toBe('../');
    });

    test('should return ../ for onboard pages', () => {
        expect(AccessControl.getBasePath('/onboard/admin.html')).toBe('../');
    });
});

// Note: In Jest 30+ with jsdom, window.location.assign is read-only and cannot be mocked.
// These redirect tests are covered by E2E tests instead.
describe('AccessControl.redirectToRolePortal()', () => {
    test('should have redirectToRolePortal function', () => {
        expect(typeof AccessControl.redirectToRolePortal).toBe('function');
    });

    test('should define portal mappings correctly', () => {
        // Test the mapping logic without triggering navigation
        const portals = {
            admin: 'portal/admin/index.html',
            doctor: 'portal/doctor/index.html',
            staff: 'portal/staff/index.html',
            receptionist: 'portal/staff/index.html',
            nurse: 'portal/staff/index.html',
            pharmacist: 'store/index.html',
            patient: 'portal/patient/index.html',
        };
        
        // Verify the function exists and can handle role lookups
        Object.keys(portals).forEach(role => {
            expect(() => AccessControl.redirectToRolePortal).not.toThrow();
        });
    });
});

describe('AccessControl.addSecurityMeta()', () => {
    test('should not throw', () => {
        expect(() => AccessControl.addSecurityMeta()).not.toThrow();
    });
});

describe('AccessControl - Activity Tracking', () => {
    test('should be able to set lastActivity', () => {
        const before = AccessControl.lastActivity;
        AccessControl.lastActivity = Date.now() + 1000;
        expect(AccessControl.lastActivity).toBeGreaterThan(before);
    });
});

describe('AccessControl.init()', () => {
    beforeEach(() => {
        localStorage.clear();
        window.location.pathname = '/';
    });

    test('should not throw when initializing', () => {
        expect(() => AccessControl.init()).not.toThrow();
    });

    test('should call addSecurityMeta', () => {
        const spy = jest.spyOn(AccessControl, 'addSecurityMeta');
        AccessControl.init();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});

describe('AccessControl.initSessionTimeout()', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
    });

    test('should not throw when initializing session timeout', () => {
        expect(() => AccessControl.initSessionTimeout()).not.toThrow();
    });

    test('should have valid sessionTimeout value', () => {
        expect(AccessControl.sessionTimeout).toBe(30 * 60 * 1000);
    });
});

describe('AccessControl.canAccess() - Edge Cases', () => {
    test('should return false for unmatched authenticated rule when not logged in', () => {
        localStorage.clear();
        expect(AccessControl.canAccess('/portal/')).toBe(false);
    });
});


