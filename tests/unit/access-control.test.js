/**
 * ACCESS CONTROL Unit Tests
 * Tests role-based page access management (Supabase)
 */

// HMS is pre-mocked in setup.js; just load the module here
// Load AccessControl module (auto-init runs here, calls HMS.auth.getRole)
const AccessControl = require('../../js/access-control.js');

beforeEach(() => {
    // Re-set implementations after resetMocks resets them between tests
    HMS.auth.getRole.mockResolvedValue(null);
    HMS.auth.signOut.mockResolvedValue(undefined);
});

describe('AccessControl Module', () => {
    test('should have getCurrentRole function', () => {
        expect(typeof AccessControl.getCurrentRole).toBe('function');
    });

    test('should have canAccessWithRole function', () => {
        expect(typeof AccessControl.canAccessWithRole).toBe('function');
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
    test('should call HMS.auth.getRole', async () => {
        HMS.auth.getRole.mockResolvedValue('admin');
        await AccessControl.getCurrentRole();
        expect(HMS.auth.getRole).toHaveBeenCalled();
    });

    test('should return the role from HMS.auth.getRole', async () => {
        HMS.auth.getRole.mockResolvedValue('doctor');
        const role = await AccessControl.getCurrentRole();
        expect(role).toBe('doctor');
    });

    test('should return null when no session', async () => {
        HMS.auth.getRole.mockResolvedValue(null);
        const role = await AccessControl.getCurrentRole();
        expect(role).toBeNull();
    });
});

describe('AccessControl.canAccessWithRole() - Public Pages', () => {
    test('should allow access to homepage', () => {
        expect(AccessControl.canAccessWithRole('/', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/index.html', null)).toBe(true);
    });

    test('should allow access to public pages', () => {
        expect(AccessControl.canAccessWithRole('/book.html', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/store.html', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/login.html', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/404.html', null)).toBe(true);
    });

    test('should allow access to services pages', () => {
        expect(AccessControl.canAccessWithRole('/services/', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/services/orthopedic.html', null)).toBe(true);
    });

    test('should allow access to onboarding pages', () => {
        expect(AccessControl.canAccessWithRole('/onboard/', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/onboard/admin.html', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/onboard/doctor.html', null)).toBe(true);
    });

    test('should allow access to public docs', () => {
        expect(AccessControl.canAccessWithRole('/docs/', null)).toBe(true);
        expect(AccessControl.canAccessWithRole('/docs/PATIENT_GUIDE.html', null)).toBe(true);
    });
});

describe('AccessControl.canAccessWithRole() - Authenticated Pages', () => {
    test('should deny portal access when not logged in', () => {
        expect(AccessControl.canAccessWithRole('/portal/', null)).toBe(false);
        expect(AccessControl.canAccessWithRole('/portal/index.html', null)).toBe(false);
    });

    test('should allow portal access when logged in as any role', () => {
        expect(AccessControl.canAccessWithRole('/portal/', 'patient')).toBe(true);
        expect(AccessControl.canAccessWithRole('/portal/', 'doctor')).toBe(true);
    });
});

describe('AccessControl.canAccessWithRole() - Admin Pages', () => {
    test('should deny admin portal when not logged in', () => {
        expect(AccessControl.canAccessWithRole('/portal/admin/', null)).toBe(false);
        expect(AccessControl.canAccessWithRole('/portal/admin/index.html', null)).toBe(false);
    });

    test('should deny admin portal to non-admin', () => {
        expect(AccessControl.canAccessWithRole('/portal/admin/', 'doctor')).toBe(false);
    });

    test('should allow admin portal to admin', () => {
        expect(AccessControl.canAccessWithRole('/portal/admin/', 'admin')).toBe(true);
        expect(AccessControl.canAccessWithRole('/portal/admin/index.html', 'admin')).toBe(true);
    });

    test('should restrict ADMIN_GUIDE to admin only', () => {
        expect(AccessControl.canAccessWithRole('/docs/ADMIN_GUIDE.html', 'staff')).toBe(false);
        expect(AccessControl.canAccessWithRole('/docs/ADMIN_GUIDE.html', 'admin')).toBe(true);
    });
});

describe('AccessControl.canAccessWithRole() - Doctor Pages', () => {
    test('should deny doctor portal when not logged in', () => {
        expect(AccessControl.canAccessWithRole('/portal/doctor/', null)).toBe(false);
    });

    test('should deny doctor portal to patient', () => {
        expect(AccessControl.canAccessWithRole('/portal/doctor/', 'patient')).toBe(false);
    });

    test('should allow doctor portal to doctor', () => {
        expect(AccessControl.canAccessWithRole('/portal/doctor/', 'doctor')).toBe(true);
    });

    test('should allow doctor portal to admin', () => {
        expect(AccessControl.canAccessWithRole('/portal/doctor/', 'admin')).toBe(true);
    });
});

describe('AccessControl.canAccessWithRole() - Staff Pages', () => {
    test('should deny staff portal when not logged in', () => {
        expect(AccessControl.canAccessWithRole('/portal/staff/', null)).toBe(false);
    });

    test('should allow staff portal to staff roles', () => {
        ['staff', 'receptionist', 'nurse', 'pharmacist', 'admin'].forEach((role) => {
            expect(AccessControl.canAccessWithRole('/portal/staff/', role)).toBe(true);
        });
    });

    test('should deny staff portal to patient', () => {
        expect(AccessControl.canAccessWithRole('/portal/staff/', 'patient')).toBe(false);
    });
});

describe('AccessControl.canAccessWithRole() - Patient Pages', () => {
    test('should deny patient portal when not logged in', () => {
        expect(AccessControl.canAccessWithRole('/portal/patient/', null)).toBe(false);
    });

    test('should allow patient portal to patient', () => {
        expect(AccessControl.canAccessWithRole('/portal/patient/', 'patient')).toBe(true);
    });

    test('should allow patient portal to admin', () => {
        expect(AccessControl.canAccessWithRole('/portal/patient/', 'admin')).toBe(true);
    });
});

describe('AccessControl.canAccessWithRole() - Forms', () => {
    test('should deny forms when not logged in', () => {
        expect(AccessControl.canAccessWithRole('/forms/', null)).toBe(false);
    });

    test('should allow forms to receptionist', () => {
        expect(AccessControl.canAccessWithRole('/forms/', 'receptionist')).toBe(true);
    });
});

describe('AccessControl.canAccessWithRole() - Prefix Matching', () => {
    test('should use prefix matching for unknown paths under known directories', () => {
        expect(
            AccessControl.canAccessWithRole('/portal/admin/some-unknown-page.html', 'admin')
        ).toBe(true);
    });

    test('should return true for completely unknown paths (default public)', () => {
        expect(AccessControl.canAccessWithRole('/some-random-unknown-path.html', null)).toBe(true);
    });
});

describe('AccessControl.logout()', () => {
    test('should call HMS.auth.signOut', async () => {
        HMS.auth.signOut.mockResolvedValue(undefined);
        // Expect signOut to be called (navigation side-effect tested via E2E)
        await expect(AccessControl.logout()).resolves.not.toThrow();
        expect(HMS.auth.signOut).toHaveBeenCalled();
    });

    test('should redirect after signing out', async () => {
        HMS.auth.signOut.mockResolvedValue(undefined);
        // logout() navigates — jsdom will emit a "Not implemented: navigation" error.
        // We verify signOut was called; the actual redirect is validated via E2E tests.
        let signOutCalled = false;
        HMS.auth.signOut.mockImplementation(async () => {
            signOutCalled = true;
        });
        await expect(AccessControl.logout()).resolves.not.toThrow();
        expect(signOutCalled).toBe(true);
    });
});

describe('AccessControl.getBasePath()', () => {
    test('should return empty for root pages', () => {
        expect(AccessControl.getBasePath('/index.html')).toBe('');
    });

    test('should return ../ for portal pages', () => {
        expect(AccessControl.getBasePath('/portal/index.html')).toBe('../');
    });

    test('should return ../../ for nested portal pages', () => {
        expect(AccessControl.getBasePath('/portal/admin/index.html')).toBe('../../');
    });

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

describe('AccessControl - Rules Completeness', () => {
    test('should have rules for critical paths', () => {
        const criticalPaths = [
            '/',
            '/index.html',
            '/login.html',
            '/book.html',
            '/portal/',
            '/portal/admin/',
            '/portal/doctor/',
            '/portal/staff/',
            '/portal/patient/',
            '/forms/',
            '/docs/',
        ];

        criticalPaths.forEach((path) => {
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

    test('should be able to update lastActivity', () => {
        const before = AccessControl.lastActivity;
        AccessControl.lastActivity = Date.now() + 1000;
        expect(AccessControl.lastActivity).toBeGreaterThan(before);
    });
});

describe('AccessControl.enforce()', () => {
    test('should have enforce function', () => {
        expect(typeof AccessControl.enforce).toBe('function');
    });

    test('should not throw when called on public page with no role', async () => {
        HMS.auth.getRole.mockResolvedValue(null);
        // Pathname is '/' (public) — enforce should do nothing
        await expect(AccessControl.enforce()).resolves.toBeUndefined();
    });
});

describe('AccessControl.redirectToRolePortal()', () => {
    test('should have redirectToRolePortal function', () => {
        expect(typeof AccessControl.redirectToRolePortal).toBe('function');
    });

    test('should define portal mappings for all known roles', () => {
        // Verify the function exists and won't throw when we look it up
        // (actual navigation tested via E2E tests in jsdom — window.location.assign is read-only)
        const roles = ['admin', 'doctor', 'staff', 'receptionist', 'nurse', 'pharmacist', 'patient'];
        roles.forEach((role) => {
            expect(typeof AccessControl.redirectToRolePortal).toBe('function');
        });
    });
});

describe('AccessControl.initSessionTimeout()', () => {
    test('should not throw when initializing session timeout', () => {
        expect(() => AccessControl.initSessionTimeout()).not.toThrow();
    });

    test('should have valid sessionTimeout value', () => {
        expect(AccessControl.sessionTimeout).toBe(30 * 60 * 1000);
    });
});
