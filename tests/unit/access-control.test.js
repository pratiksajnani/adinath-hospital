/**
 * ACCESS CONTROL Unit Tests
 * Tests role-based page access management
 */

// Load the access control module
let AccessControl;

beforeAll(() => {
    // Mock alert
    global.alert = jest.fn();
    
    // Set up minimal window.location
    Object.defineProperty(window, 'location', {
        value: { 
            pathname: '/', 
            href: 'http://localhost/',
            replace: jest.fn()
        },
        writable: true,
        configurable: true
    });
    
    // Load AccessControl
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.join(__dirname, '../../js/access-control.js'), 'utf8');
    eval(code);
    AccessControl = window.AccessControl;
});

beforeEach(() => {
    localStorage.clear();
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
});

describe('AccessControl.canAccess() - Authenticated Pages', () => {
    test('should deny portal access when not logged in', () => {
        expect(AccessControl.canAccess('/portal/')).toBe(false);
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
        expect(AccessControl.canAccess('/portal/admin/manage.html')).toBe(true);
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

    test('should allow staff portal to various staff roles', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        ['staff', 'receptionist', 'nurse', 'pharmacist', 'admin'].forEach(role => {
            localStorage.setItem('hms_role', role);
            expect(AccessControl.canAccess('/portal/staff/')).toBe(true);
        });
    });

    test('should deny staff portal to patient and doctor', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/portal/staff/')).toBe(false);
        
        localStorage.setItem('hms_role', 'doctor');
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

    test('should restrict prescription form to doctors and admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'receptionist');
        expect(AccessControl.canAccess('/forms/prescription.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/forms/prescription.html')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Documentation', () => {
    test('should restrict ADMIN_GUIDE to admin only', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.canAccess('/docs/ADMIN_GUIDE.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/docs/ADMIN_GUIDE.html')).toBe(true);
    });

    test('should allow public docs to anyone', () => {
        expect(AccessControl.canAccess('/docs/PATIENT_GUIDE.html')).toBe(true);
    });
});

describe('AccessControl.getBasePath()', () => {
    test('should return empty for root pages', () => {
        window.location.pathname = '/index.html';
        expect(AccessControl.getBasePath()).toBe('');
    });

    test('should return ../ for portal pages', () => {
        window.location.pathname = '/portal/index.html';
        expect(AccessControl.getBasePath()).toBe('../');
    });

    test('should return ../../ for nested portal pages', () => {
        window.location.pathname = '/portal/admin/index.html';
        expect(AccessControl.getBasePath()).toBe('../../');
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

    test('should clear all session data', () => {
        AccessControl.logout();
        
        expect(localStorage.getItem('hms_logged_in')).toBeNull();
        expect(localStorage.getItem('hms_role')).toBeNull();
        expect(localStorage.getItem('hms_user_email')).toBeNull();
        expect(localStorage.getItem('hms_user_name')).toBeNull();
    });
});

describe('AccessControl - Session Timeout', () => {
    test('should have 30 minute timeout configured', () => {
        expect(AccessControl.sessionTimeout).toBe(30 * 60 * 1000);
    });
});

describe('AccessControl - Rules Completeness', () => {
    test('should have rules for critical paths', () => {
        const criticalPaths = [
            '/', '/index.html', '/login.html',
            '/portal/', '/portal/admin/', '/portal/doctor/', '/portal/staff/', '/portal/patient/',
            '/forms/'
        ];
        
        criticalPaths.forEach(path => {
            expect(AccessControl.rules[path]).toBeDefined();
        });
    });

    test('should default to allowing undefined paths', () => {
        expect(AccessControl.canAccess('/random-undefined-page.html')).toBe(true);
    });
});
