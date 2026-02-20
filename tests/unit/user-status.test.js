/**
 * USER STATUS Widget Unit Tests
 * Tests for user status display, menus, and logout (Supabase)
 */

// HMS is pre-mocked in setup.js; load the module here
// user-status.js auto-executes injectUserStatus() when required
const { getBasePath, toggleUserMenu, updateUserStatusWidget, doLogout, injectUserStatus } =
    require('../../js/user-status.js');

beforeEach(() => {
    // Re-set HMS mock implementations after resetMocks resets them
    HMS.auth.getProfile.mockResolvedValue(null);
    HMS.auth.signOut.mockResolvedValue(undefined);
    // Clear DOM between tests
    document.body.innerHTML = '';
});

describe('getBasePath()', () => {
    test('should return empty string for root pages', () => {
        expect(getBasePath('/index.html')).toBe('');
    });

    test('should return ../ for portal pages', () => {
        expect(getBasePath('/portal/index.html')).toBe('../');
    });

    test('should return ../../ for nested portal pages', () => {
        expect(getBasePath('/portal/admin/index.html')).toBe('../../');
    });

    test('should return ../ for docs pages', () => {
        expect(getBasePath('/docs/PATIENT_GUIDE.html')).toBe('../');
    });

    test('should return ../ for services pages', () => {
        expect(getBasePath('/services/orthopedic.html')).toBe('../');
    });

    test('should return ../ for forms pages', () => {
        expect(getBasePath('/forms/intake.html')).toBe('../');
    });

    test('should return ../../ for nested forms', () => {
        expect(getBasePath('/forms/data-collection/form.html')).toBe('../../');
    });

    test('should return ../ for onboard pages', () => {
        expect(getBasePath('/onboard/doctor.html')).toBe('../');
    });

    test('should return empty for homepage', () => {
        expect(getBasePath('/')).toBe('');
    });
});

describe('injectUserStatus()', () => {
    test('should inject user status widget into body', () => {
        injectUserStatus();
        const widget = document.getElementById('user-status-widget');
        expect(widget).toBeTruthy();
    });

    test('should show Guest by default', () => {
        injectUserStatus();
        const nameElement = document.getElementById('user-status-name');
        expect(nameElement.textContent).toBe('Guest');
    });

    test('should create user-status-btn element', () => {
        injectUserStatus();
        expect(document.getElementById('user-status-btn')).toBeTruthy();
    });

    test('should create user-status-menu element', () => {
        injectUserStatus();
        expect(document.getElementById('user-status-menu')).toBeTruthy();
    });

    test('should create guest-menu-items element', () => {
        injectUserStatus();
        expect(document.getElementById('guest-menu-items')).toBeTruthy();
    });

    test('should create logged-in-menu-items element', () => {
        injectUserStatus();
        expect(document.getElementById('logged-in-menu-items')).toBeTruthy();
    });

    test('should not inject duplicate widget if already present', () => {
        injectUserStatus();
        injectUserStatus();
        const widgets = document.querySelectorAll('#user-status-widget');
        expect(widgets.length).toBe(1);
    });
});

describe('updateUserStatusWidget()', () => {
    beforeEach(() => {
        injectUserStatus();
    });

    test('should show Guest when profile is null', async () => {
        HMS.auth.getProfile.mockResolvedValue(null);
        await updateUserStatusWidget();
        const nameElement = document.getElementById('user-status-name');
        expect(nameElement.textContent).toBe('Guest');
    });

    test('should show first word of name when logged in', async () => {
        HMS.auth.getProfile.mockResolvedValue({
            name: 'Dr. Ashok',
            email: 'drsajnani@gmail.com',
            role: 'doctor',
        });
        await updateUserStatusWidget();
        const nameElement = document.getElementById('user-status-name');
        // displayName = name.split('@')[0].split(' ')[0] = 'Dr.'
        expect(nameElement.textContent).toBe('Dr.');
    });

    test('should show email prefix when name is not available', async () => {
        HMS.auth.getProfile.mockResolvedValue({
            name: null,
            email: 'test@test.com',
            role: 'patient',
        });
        await updateUserStatusWidget();
        const nameElement = document.getElementById('user-status-name');
        // displayName = email.split('@')[0].split(' ')[0] = 'test'
        expect(nameElement.textContent).toBe('test');
    });

    test('should show guest menu when not logged in', async () => {
        HMS.auth.getProfile.mockResolvedValue(null);
        await updateUserStatusWidget();
        const guestMenu = document.getElementById('guest-menu-items');
        const loggedInMenu = document.getElementById('logged-in-menu-items');
        expect(guestMenu.style.display).not.toBe('none');
        expect(loggedInMenu.style.display).toBe('none');
    });

    test('should show logged-in menu when logged in', async () => {
        HMS.auth.getProfile.mockResolvedValue({
            name: 'Test User',
            email: 'test@test.com',
            role: 'patient',
        });
        await updateUserStatusWidget();
        const guestMenu = document.getElementById('guest-menu-items');
        const loggedInMenu = document.getElementById('logged-in-menu-items');
        expect(guestMenu.style.display).toBe('none');
        expect(loggedInMenu.style.display).toBe('block');
    });

    test('should handle HMS error gracefully and show Guest', async () => {
        HMS.auth.getProfile.mockRejectedValue(new Error('HMS not initialized'));
        await updateUserStatusWidget();
        const nameElement = document.getElementById('user-status-name');
        expect(nameElement.textContent).toBe('Guest');
    });
});

describe('Role Icons', () => {
    beforeEach(() => {
        injectUserStatus();
    });

    test('should show doctor icon for doctor role', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Dr. Test', email: 'dr@test.com', role: 'doctor' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F468}\u200D\u2695\uFE0F');
    });

    test('should show admin icon for admin role', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Admin', email: 'admin@test.com', role: 'admin' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F451}');
    });

    test('should show patient icon for patient role', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Patient', email: 'patient@test.com', role: 'patient' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F3E5}');
    });

    test('should show staff icon for staff role', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Staff', email: 'staff@test.com', role: 'staff' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F481}');
    });

    test('should show receptionist icon', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Receptionist', email: 'r@test.com', role: 'receptionist' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F481}');
    });

    test('should show nurse icon', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Nurse', email: 'nurse@test.com', role: 'nurse' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F469}\u200D\u2695\uFE0F');
    });

    test('should show default icon for unknown role', async () => {
        HMS.auth.getProfile.mockResolvedValue({ name: 'Unknown', email: 'u@test.com', role: 'unknown' });
        await updateUserStatusWidget();
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('\u{1F464}');
    });
});

describe('toggleUserMenu()', () => {
    beforeEach(() => {
        HMS.auth.getProfile.mockResolvedValue(null);
        injectUserStatus();
    });

    test('should toggle menu visibility', () => {
        const menu = document.getElementById('user-status-menu');
        expect(menu.style.display).toBe('none');

        toggleUserMenu();
        expect(menu.style.display).toBe('block');

        toggleUserMenu();
        expect(menu.style.display).toBe('none');
    });
});

describe('doLogout()', () => {
    beforeEach(() => {
        HMS.auth.getProfile.mockResolvedValue(null);
        HMS.auth.signOut.mockResolvedValue(undefined);
        injectUserStatus();
    });

    test('should call HMS.auth.signOut', async () => {
        // window.location.assign is read-only in jsdom; verify signOut is called
        // (redirect assertion is covered by E2E tests)
        await expect(doLogout()).resolves.not.toThrow();
        expect(HMS.auth.signOut).toHaveBeenCalled();
    });

    test('should complete without error', async () => {
        await expect(doLogout()).resolves.not.toThrow();
    });
});
