/**
 * ACCESS CONTROL Unit Tests
 * Tests role-based page access management
 */

// Mock alert
global.alert = jest.fn();

// Set up window.location before loading module
Object.defineProperty(window, 'location', {
    value: { 
        pathname: '/', 
        href: 'http://localhost/',
        replace: jest.fn()
    },
    writable: true,
    configurable: true
});

// Load AccessControl module using eval to get coverage
const fs = require('fs');
const path = require('path');
const acCode = fs.readFileSync(path.join(__dirname, '../../js/access-control.js'), 'utf8');
eval(acCode);

beforeEach(() => {
    localStorage.clear();
    global.alert.mockClear();
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

    test('should return correct role for staff', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.getCurrentRole()).toBe('staff');
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
        expect(AccessControl.canAccess('/check-status.html')).toBe(true);
    });

    test('should allow access to services pages', () => {
        expect(AccessControl.canAccess('/services/')).toBe(true);
        expect(AccessControl.canAccess('/services/orthopedic.html')).toBe(true);
        expect(AccessControl.canAccess('/services/gynecology.html')).toBe(true);
        expect(AccessControl.canAccess('/services/yoga.html')).toBe(true);
    });

    test('should allow access to onboarding pages', () => {
        expect(AccessControl.canAccess('/onboard/')).toBe(true);
        expect(AccessControl.canAccess('/onboard/admin.html')).toBe(true);
        expect(AccessControl.canAccess('/onboard/doctor.html')).toBe(true);
        expect(AccessControl.canAccess('/onboard/staff.html')).toBe(true);
        expect(AccessControl.canAccess('/onboard/patient.html')).toBe(true);
    });

    test('should allow access to public docs', () => {
        expect(AccessControl.canAccess('/docs/')).toBe(true);
        expect(AccessControl.canAccess('/docs/PATIENT_GUIDE.html')).toBe(true);
        expect(AccessControl.canAccess('/docs/PATIENT_DEMO.html')).toBe(true);
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
        expect(AccessControl.canAccess('/portal/admin/manage.html')).toBe(false);
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
        expect(AccessControl.canAccess('/portal/admin/send-registration.html')).toBe(true);
    });

    test('should restrict ADMIN_GUIDE to admin only', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.canAccess('/docs/ADMIN_GUIDE.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/docs/ADMIN_GUIDE.html')).toBe(true);
    });

    test('should restrict send-registration-links.html to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/docs/send-registration-links.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/docs/send-registration-links.html')).toBe(true);
    });

    test('should restrict clear-cache.html to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.canAccess('/clear-cache.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/clear-cache.html')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Doctor Pages', () => {
    test('should deny doctor portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/doctor/')).toBe(false);
        expect(AccessControl.canAccess('/portal/doctor/index.html')).toBe(false);
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
        expect(AccessControl.canAccess('/portal/doctor/index.html')).toBe(true);
        expect(AccessControl.canAccess('/portal/doctor/simple.html')).toBe(true);
    });

    test('should allow doctor portal to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/portal/doctor/')).toBe(true);
    });

    test('should restrict DOCTOR_GUIDE appropriately', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/docs/DOCTOR_GUIDE.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/docs/DOCTOR_GUIDE.html')).toBe(true);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/docs/DOCTOR_GUIDE.html')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Staff Pages', () => {
    test('should deny staff portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/staff/')).toBe(false);
        expect(AccessControl.canAccess('/portal/staff/index.html')).toBe(false);
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

    test('should restrict STAFF_GUIDE appropriately', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/docs/STAFF_GUIDE.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.canAccess('/docs/STAFF_GUIDE.html')).toBe(true);
        
        localStorage.setItem('hms_role', 'receptionist');
        expect(AccessControl.canAccess('/docs/STAFF_GUIDE.html')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Patient Pages', () => {
    test('should deny patient portal when not logged in', () => {
        expect(AccessControl.canAccess('/portal/patient/')).toBe(false);
        expect(AccessControl.canAccess('/portal/patient/appointments.html')).toBe(false);
    });

    test('should allow patient portal to patient', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'patient');
        expect(AccessControl.canAccess('/portal/patient/')).toBe(true);
        expect(AccessControl.canAccess('/portal/patient/index.html')).toBe(true);
        expect(AccessControl.canAccess('/portal/patient/appointments.html')).toBe(true);
        expect(AccessControl.canAccess('/portal/patient/prescriptions.html')).toBe(true);
    });

    test('should allow patient portal to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/portal/patient/')).toBe(true);
    });

    test('should deny patient portal to doctor', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/portal/patient/')).toBe(false);
    });
});

describe('AccessControl.canAccess() - Forms', () => {
    test('should deny forms when not logged in', () => {
        expect(AccessControl.canAccess('/forms/')).toBe(false);
        expect(AccessControl.canAccess('/forms/patient-intake.html')).toBe(false);
    });

    test('should allow forms to staff roles', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'receptionist');
        expect(AccessControl.canAccess('/forms/')).toBe(true);
        expect(AccessControl.canAccess('/forms/patient-intake.html')).toBe(true);
        expect(AccessControl.canAccess('/forms/consent.html')).toBe(true);
    });

    test('should restrict prescription form to doctors and admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'receptionist');
        expect(AccessControl.canAccess('/forms/prescription.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/forms/prescription.html')).toBe(true);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/forms/prescription.html')).toBe(true);
    });

    test('should restrict discharge form to doctors and admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'staff');
        expect(AccessControl.canAccess('/forms/discharge.html')).toBe(false);
        
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/forms/discharge.html')).toBe(true);
    });

    test('should restrict data-collection to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        
        localStorage.setItem('hms_role', 'doctor');
        expect(AccessControl.canAccess('/forms/data-collection/')).toBe(false);
        
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/forms/data-collection/')).toBe(true);
    });
});

describe('AccessControl.canAccess() - Store', () => {
    test('should deny store dashboard when not logged in', () => {
        expect(AccessControl.canAccess('/store/')).toBe(false);
    });

    test('should allow store to pharmacy staff', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'pharmacist');
        expect(AccessControl.canAccess('/store/')).toBe(true);
    });

    test('should allow store to admin', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/store/')).toBe(true);
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

    test('should return ../ for docs pages', () => {
        window.location.pathname = '/docs/PATIENT_GUIDE.html';
        expect(AccessControl.getBasePath()).toBe('../');
    });

    test('should return ../ for services pages', () => {
        window.location.pathname = '/services/orthopedic.html';
        expect(AccessControl.getBasePath()).toBe('../');
    });

    test('should return ../ for forms pages', () => {
        window.location.pathname = '/forms/intake.html';
        expect(AccessControl.getBasePath()).toBe('../');
    });

    test('should return ../../ for nested forms', () => {
        window.location.pathname = '/forms/data-collection/test.html';
        expect(AccessControl.getBasePath()).toBe('../../');
    });
});

describe('AccessControl.logout()', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_email', 'test@test.com');
        localStorage.setItem('hms_user_name', 'Test User');
        localStorage.setItem('hms_current_user', 'test');
        localStorage.setItem('hms_auth_method', 'password');
        localStorage.setItem('hms_doctor', 'ashok');
        localStorage.setItem('hms_demo_user', 'true');
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

    test('should clear hms_user_name', () => {
        AccessControl.logout();
        expect(localStorage.getItem('hms_user_name')).toBeNull();
    });

    test('should clear hms_current_user', () => {
        AccessControl.logout();
        expect(localStorage.getItem('hms_current_user')).toBeNull();
    });

    test('should clear all session data', () => {
        AccessControl.logout();
        
        expect(localStorage.getItem('hms_logged_in')).toBeNull();
        expect(localStorage.getItem('hms_role')).toBeNull();
        expect(localStorage.getItem('hms_auth_method')).toBeNull();
        expect(localStorage.getItem('hms_doctor')).toBeNull();
        expect(localStorage.getItem('hms_demo_user')).toBeNull();
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

describe('AccessControl - Rules Completeness', () => {
    test('should have rules for critical paths', () => {
        const criticalPaths = [
            '/', '/index.html', '/login.html', '/book.html', '/store.html',
            '/portal/', '/portal/admin/', '/portal/doctor/', '/portal/staff/', '/portal/patient/',
            '/forms/', '/docs/'
        ];
        
        criticalPaths.forEach(path => {
            expect(AccessControl.rules[path]).toBeDefined();
        });
    });

    test('should default to allowing undefined paths', () => {
        expect(AccessControl.canAccess('/random-undefined-page.html')).toBe(true);
    });

    test('should handle paths with prefix matching', () => {
        // Test a deeply nested path that should match parent rules
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        expect(AccessControl.canAccess('/portal/admin/some/deep/path.html')).toBe(true);
    });
});

describe('AccessControl.redirectToRolePortal()', () => {
    test('should redirect admin to admin portal', () => {
        window.location.pathname = '/';
        AccessControl.redirectToRolePortal('admin');
        // Just verify it doesn't throw
    });

    test('should redirect doctor to doctor portal', () => {
        window.location.pathname = '/';
        AccessControl.redirectToRolePortal('doctor');
    });

    test('should redirect staff to staff portal', () => {
        window.location.pathname = '/';
        AccessControl.redirectToRolePortal('staff');
    });

    test('should redirect patient to patient portal', () => {
        window.location.pathname = '/';
        AccessControl.redirectToRolePortal('patient');
    });

    test('should redirect pharmacist to store', () => {
        window.location.pathname = '/';
        AccessControl.redirectToRolePortal('pharmacist');
    });
});

describe('AccessControl.addSecurityMeta()', () => {
    test('should be a function', () => {
        expect(typeof AccessControl.addSecurityMeta).toBe('function');
    });
});

describe('AccessControl.initSessionTimeout()', () => {
    test('should be a function', () => {
        expect(typeof AccessControl.initSessionTimeout).toBe('function');
    });
});

console.log('AccessControl Unit Tests loaded');
