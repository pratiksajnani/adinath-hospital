/**
 * USER STATUS Component Unit Tests
 * Tests user status widget functionality
 */

// Setup mock DOM elements
const mockElements = {};

// Store original getElementById
const originalGetElementById = document.getElementById ? document.getElementById.bind(document) : () => null;

// Override getElementById to return our mock elements
document.getElementById = (id) => {
    if (mockElements[id] !== undefined) {
        return mockElements[id];
    }
    return originalGetElementById(id);
};

// Mock insertAdjacentHTML on the existing body
if (document.body) {
    document.body.insertAdjacentHTML = jest.fn();
}

Object.defineProperty(window, 'location', {
    value: { pathname: '/', href: 'http://localhost/' },
    writable: true,
    configurable: true
});

// Load user-status module - functions will be in global scope
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '../../js/user-status.js'), 'utf8');
eval(code);

beforeEach(() => {
    localStorage.clear();
    // Reset mock elements
    mockElements['user-status-icon'] = { textContent: '' };
    mockElements['user-status-name'] = { textContent: '', style: { color: '' } };
    mockElements['guest-menu-items'] = { style: { display: '' } };
    mockElements['logged-in-menu-items'] = { style: { display: '' } };
    mockElements['menu-user-name'] = { textContent: '' };
    mockElements['menu-user-role'] = { textContent: '' };
    mockElements['menu-portal-link'] = { href: '' };
    mockElements['user-status-menu'] = { style: { display: 'none' } };
});

describe('getBasePath()', () => {
    test('should return empty for root pages', () => {
        window.location.pathname = '/index.html';
        expect(getBasePath()).toBe('');
    });

    test('should return ../ for portal pages', () => {
        window.location.pathname = '/portal/index.html';
        expect(getBasePath()).toBe('../');
    });

    test('should return ../../ for nested portal pages', () => {
        window.location.pathname = '/portal/admin/index.html';
        expect(getBasePath()).toBe('../../');
    });

    test('should return ../ for docs pages', () => {
        window.location.pathname = '/docs/guide.html';
        expect(getBasePath()).toBe('../');
    });

    test('should return ../ for services pages', () => {
        window.location.pathname = '/services/orthopedic.html';
        expect(getBasePath()).toBe('../');
    });

    test('should return ../ for forms pages', () => {
        window.location.pathname = '/forms/intake.html';
        expect(getBasePath()).toBe('../');
    });

    test('should return ../ for onboard pages', () => {
        window.location.pathname = '/onboard/doctor.html';
        expect(getBasePath()).toBe('../');
    });

    test('should return ../ for store pages', () => {
        window.location.pathname = '/store/index.html';
        expect(getBasePath()).toBe('../');
    });
});

describe('toggleUserMenu()', () => {
    test('should show menu when hidden', () => {
        mockElements['user-status-menu'].style.display = 'none';
        toggleUserMenu();
        expect(mockElements['user-status-menu'].style.display).toBe('block');
    });

    test('should hide menu when visible', () => {
        mockElements['user-status-menu'].style.display = 'block';
        toggleUserMenu();
        expect(mockElements['user-status-menu'].style.display).toBe('none');
    });
});

describe('updateUserStatusWidget() - Guest State', () => {
    test('should show guest icon', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-icon'].textContent).toBe('👤');
    });

    test('should show Guest as name', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].textContent).toBe('Guest');
    });

    test('should use grey color', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].style.color).toBe('#64748b');
    });

    test('should show guest menu, hide logged in menu', () => {
        updateUserStatusWidget();
        expect(mockElements['guest-menu-items'].style.display).toBe('block');
        expect(mockElements['logged-in-menu-items'].style.display).toBe('none');
    });
});

describe('updateUserStatusWidget() - Admin State', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_name', 'Pratik Sajnani');
    });

    test('should show admin crown icon', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-icon'].textContent).toBe('👑');
    });

    test('should show first name', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].textContent).toBe('Pratik');
    });

    test('should use red color for admin', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].style.color).toBe('#dc2626');
    });

    test('should show logged in menu, hide guest menu', () => {
        updateUserStatusWidget();
        expect(mockElements['guest-menu-items'].style.display).toBe('none');
        expect(mockElements['logged-in-menu-items'].style.display).toBe('block');
    });

    test('should set portal link to admin portal', () => {
        window.location.pathname = '/';
        updateUserStatusWidget();
        expect(mockElements['menu-portal-link'].href).toBe('portal/admin/index.html');
    });
});

describe('updateUserStatusWidget() - Doctor State', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'doctor');
        localStorage.setItem('hms_user_name', 'Dr. Ashok');
    });

    test('should show doctor icon', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-icon'].textContent).toBe('👨‍⚕️');
    });

    test('should use teal color', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].style.color).toBe('#0f766e');
    });

    test('should set portal link to doctor portal', () => {
        window.location.pathname = '/';
        updateUserStatusWidget();
        expect(mockElements['menu-portal-link'].href).toBe('portal/doctor/simple.html');
    });
});

describe('updateUserStatusWidget() - Staff State', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'staff');
        localStorage.setItem('hms_user_name', 'Staff Member');
    });

    test('should show staff icon', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-icon'].textContent).toBe('💁');
    });

    test('should use purple color', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].style.color).toBe('#7c3aed');
    });

    test('should set portal link to staff portal', () => {
        window.location.pathname = '/';
        updateUserStatusWidget();
        expect(mockElements['menu-portal-link'].href).toBe('portal/staff/index.html');
    });
});

describe('updateUserStatusWidget() - Patient State', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'patient');
        localStorage.setItem('hms_user_email', 'patient@test.com');
    });

    test('should show patient icon', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-icon'].textContent).toBe('🏥');
    });

    test('should use blue color', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].style.color).toBe('#2563eb');
    });

    test('should extract name from email', () => {
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].textContent).toBe('patient');
    });

    test('should set portal link to patient portal', () => {
        window.location.pathname = '/';
        updateUserStatusWidget();
        expect(mockElements['menu-portal-link'].href).toBe('portal/patient/index.html');
    });
});

describe('updateUserStatusWidget() - Menu Details', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_name', 'Test Admin');
    });

    test('should set menu user name', () => {
        updateUserStatusWidget();
        expect(mockElements['menu-user-name'].textContent).toBe('Test Admin');
    });

    test('should set role with proper capitalization', () => {
        updateUserStatusWidget();
        expect(mockElements['menu-user-role'].textContent).toBe('Admin');
    });
});

describe('doLogout()', () => {
    beforeEach(() => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_email', 'test@test.com');
        localStorage.setItem('hms_user_name', 'Test');
        localStorage.setItem('hms_current_user', 'test');
        localStorage.setItem('hms_auth_method', 'password');
        localStorage.setItem('hms_doctor_id', 'ashok');
        localStorage.setItem('currentPatient', 'patient123');
        window.location.pathname = '/';
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

describe('updateUserStatusWidget() - Edge Cases', () => {
    test('should handle missing DOM elements gracefully', () => {
        mockElements['user-status-icon'] = null;
        mockElements['user-status-name'] = null;
        expect(() => updateUserStatusWidget()).not.toThrow();
    });

    test('should fallback to role name if no user name', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'doctor');
        // Reset elements
        mockElements['user-status-icon'] = { textContent: '' };
        mockElements['user-status-name'] = { textContent: '', style: { color: '' } };
        mockElements['guest-menu-items'] = { style: { display: '' } };
        mockElements['logged-in-menu-items'] = { style: { display: '' } };
        mockElements['menu-user-name'] = { textContent: '' };
        mockElements['menu-user-role'] = { textContent: '' };
        mockElements['menu-portal-link'] = { href: '' };
        
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].textContent).toBe('doctor');
    });

    test('should handle logged_in=false correctly', () => {
        localStorage.setItem('hms_logged_in', 'false');
        localStorage.setItem('hms_role', 'admin');
        // Reset elements
        mockElements['user-status-icon'] = { textContent: '' };
        mockElements['user-status-name'] = { textContent: '', style: { color: '' } };
        mockElements['guest-menu-items'] = { style: { display: '' } };
        mockElements['logged-in-menu-items'] = { style: { display: '' } };
        
        updateUserStatusWidget();
        expect(mockElements['user-status-name'].textContent).toBe('Guest');
    });
});
