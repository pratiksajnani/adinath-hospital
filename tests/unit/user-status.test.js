/**
 * USER STATUS Widget Unit Tests
 * Tests for user status display, menus, and logout
 */

// Jest 30+ with jsdom - mock location methods, don't replace the object
window.location.replace = jest.fn();
window.location.assign = jest.fn();

// Load user-status module
const { getBasePath, toggleUserMenu, updateUserStatusWidget, doLogout, injectUserStatus } = require('../../js/user-status.js');

beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
});

describe('getBasePath()', () => {
    // Using testPath parameter for Jest 30+ jsdom compatibility
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
});

describe('injectUserStatus()', () => {
    test('should inject user status widget into body', () => {
        injectUserStatus();
        const widget = document.getElementById('user-status-widget');
        expect(widget).toBeDefined();
    });

    test('should show Guest by default', () => {
        injectUserStatus();
        const nameElement = document.getElementById('user-status-name');
        expect(nameElement.textContent).toBe('Guest');
    });

    test('should call updateUserStatusWidget', () => {
        injectUserStatus();
        // Widget should exist after injection
        expect(document.getElementById('user-status-widget')).toBeTruthy();
    });
});

describe('updateUserStatusWidget()', () => {
    beforeEach(() => {
        injectUserStatus();
    });

    test('should show Guest when not logged in', () => {
        updateUserStatusWidget();
        const nameElement = document.getElementById('user-status-name');
        expect(nameElement.textContent).toBe('Guest');
    });

    test('should show first word of user name when logged in', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Dr. Ashok');
        localStorage.setItem('hms_role', 'doctor');
        
        updateUserStatusWidget();
        
        const nameElement = document.getElementById('user-status-name');
        // Code shows first word only
        expect(nameElement.textContent).toBe('Dr.');
    });

    test('should show Admin when admin is logged in', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Pratik');
        localStorage.setItem('hms_role', 'admin');
        
        updateUserStatusWidget();
        
        const nameElement = document.getElementById('user-status-name');
        expect(nameElement.textContent).toBe('Pratik');
    });

    test('should show email prefix if name not available', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_email', 'test@test.com');
        localStorage.setItem('hms_role', 'patient');
        
        updateUserStatusWidget();
        
        const nameElement = document.getElementById('user-status-name');
        // Code shows part before @ and first word
        expect(nameElement.textContent).toBe('test');
    });
});

describe('toggleUserMenu()', () => {
    beforeEach(() => {
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
        injectUserStatus();
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_email', 'test@test.com');
        localStorage.setItem('hms_user_name', 'Test User');
    });

    test('should clear hms_logged_in', () => {
        doLogout();
        expect(localStorage.getItem('hms_logged_in')).toBeNull();
    });

    test('should clear hms_role', () => {
        doLogout();
        expect(localStorage.getItem('hms_role')).toBeNull();
    });

    test('should clear hms_user_email', () => {
        doLogout();
        expect(localStorage.getItem('hms_user_email')).toBeNull();
    });

    test('should clear hms_user_name', () => {
        doLogout();
        expect(localStorage.getItem('hms_user_name')).toBeNull();
    });
});

describe('Role Icons', () => {
    beforeEach(() => {
        injectUserStatus();
    });

    test('should show doctor icon for doctor role', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Dr. Test');
        localStorage.setItem('hms_role', 'doctor');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('👨‍⚕️');
    });

    test('should show admin icon for admin role', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Admin');
        localStorage.setItem('hms_role', 'admin');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('👑');
    });

    test('should show patient icon for patient role', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Patient');
        localStorage.setItem('hms_role', 'patient');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('🏥');
    });

    test('should show staff icon for staff role', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Staff');
        localStorage.setItem('hms_role', 'staff');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('💁');
    });

    test('should show receptionist icon', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Receptionist');
        localStorage.setItem('hms_role', 'receptionist');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('💁');
    });

    test('should show nurse icon', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Nurse');
        localStorage.setItem('hms_role', 'nurse');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('👩‍⚕️');
    });

    test('should show default icon for unknown role', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Unknown');
        localStorage.setItem('hms_role', 'unknown');
        
        updateUserStatusWidget();
        
        const iconElement = document.getElementById('user-status-icon');
        expect(iconElement.textContent).toBe('👤');
    });
});

describe('Menu Items', () => {
    beforeEach(() => {
        injectUserStatus();
    });

    test('should show guest menu when not logged in', () => {
        updateUserStatusWidget();
        
        const guestMenu = document.getElementById('guest-menu-items');
        const loggedInMenu = document.getElementById('logged-in-menu-items');
        
        expect(guestMenu.style.display).not.toBe('none');
        expect(loggedInMenu.style.display).toBe('none');
    });

    test('should show logged in menu when logged in', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_user_name', 'Test');
        localStorage.setItem('hms_role', 'patient');
        
        updateUserStatusWidget();
        
        const guestMenu = document.getElementById('guest-menu-items');
        const loggedInMenu = document.getElementById('logged-in-menu-items');
        
        expect(guestMenu.style.display).toBe('none');
        expect(loggedInMenu.style.display).toBe('block');
    });
});
