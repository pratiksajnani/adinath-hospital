/**
 * USER STATUS Component Unit Tests
 * Tests user status widget functionality
 */

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Assign globally
global.localStorage = mockLocalStorage;

// Test getBasePath logic directly
describe('getBasePath Logic', () => {
    const getBasePath = (pathname) => {
        if (pathname.includes('/portal/admin/') || pathname.includes('/portal/doctor/') || pathname.includes('/portal/staff/')) {
            return '../../';
        }
        if (pathname.includes('/portal/') || pathname.includes('/docs/') || pathname.includes('/services/') || 
            pathname.includes('/forms/') || pathname.includes('/onboard/') || pathname.includes('/store/')) {
            return '../';
        }
        return '';
    };

    test('should return empty for root pages', () => {
        expect(getBasePath('/index.html')).toBe('');
    });

    test('should return ../ for portal pages', () => {
        expect(getBasePath('/portal/index.html')).toBe('../');
    });

    test('should return ../../ for nested portal pages', () => {
        expect(getBasePath('/portal/admin/index.html')).toBe('../../');
    });

    test('should return ../ for docs pages', () => {
        expect(getBasePath('/docs/DOCTOR_GUIDE.html')).toBe('../');
    });

    test('should return ../ for services pages', () => {
        expect(getBasePath('/services/orthopedic.html')).toBe('../');
    });

    test('should return ../ for forms pages', () => {
        expect(getBasePath('/forms/patient-intake.html')).toBe('../');
    });

    test('should return ../ for onboard pages', () => {
        expect(getBasePath('/onboard/doctor.html')).toBe('../');
    });

    test('should return ../ for store pages', () => {
        expect(getBasePath('/store/index.html')).toBe('../');
    });
});

describe('User Role Icons', () => {
    const getRoleIcon = (role) => {
        const icons = {
            admin: '👑',
            doctor: '👨‍⚕️',
            receptionist: '👔',
            nurse: '👔',
            staff: '👔',
            patient: '🧑'
        };
        return icons[role] || '👤';
    };

    test('admin should have crown icon', () => {
        expect(getRoleIcon('admin')).toBe('👑');
    });

    test('doctor should have doctor icon', () => {
        expect(getRoleIcon('doctor')).toBe('👨‍⚕️');
    });

    test('staff roles should have tie icon', () => {
        expect(getRoleIcon('receptionist')).toBe('👔');
        expect(getRoleIcon('nurse')).toBe('👔');
        expect(getRoleIcon('staff')).toBe('👔');
    });

    test('patient should have person icon', () => {
        expect(getRoleIcon('patient')).toBe('🧑');
    });

    test('unknown role should default to guest icon', () => {
        expect(getRoleIcon('unknown')).toBe('👤');
    });
});

describe('User Role Colors', () => {
    const getRoleColor = (role) => {
        const colors = {
            admin: '#dc2626',      // red
            doctor: '#0f766e',     // teal
            receptionist: '#7c3aed', // purple
            nurse: '#7c3aed',      // purple
            patient: '#2563eb'     // blue
        };
        return colors[role] || '#64748b';
    };

    test('admin should be red', () => {
        expect(getRoleColor('admin')).toBe('#dc2626');
    });

    test('doctor should be teal', () => {
        expect(getRoleColor('doctor')).toBe('#0f766e');
    });

    test('staff should be purple', () => {
        expect(getRoleColor('receptionist')).toBe('#7c3aed');
    });

    test('patient should be blue', () => {
        expect(getRoleColor('patient')).toBe('#2563eb');
    });
});

describe('Portal URL Mapping', () => {
    const getPortalUrl = (role, basePath = '') => {
        const portals = {
            admin: 'portal/admin/',
            doctor: 'portal/doctor/',
            receptionist: 'portal/staff/',
            nurse: 'portal/staff/',
            patient: 'portal/patient/'
        };
        return basePath + (portals[role] || 'login.html');
    };

    test('admin should go to admin portal', () => {
        expect(getPortalUrl('admin')).toContain('portal/admin');
    });

    test('doctor should go to doctor portal', () => {
        expect(getPortalUrl('doctor')).toContain('portal/doctor');
    });

    test('receptionist should go to staff portal', () => {
        expect(getPortalUrl('receptionist')).toContain('portal/staff');
    });

    test('patient should go to patient portal', () => {
        expect(getPortalUrl('patient')).toContain('portal/patient');
    });

    test('unknown role should go to login', () => {
        expect(getPortalUrl('unknown')).toContain('login.html');
    });
});

describe('Name Extraction', () => {
    const getDisplayName = (fullName, email) => {
        if (fullName) {
            return fullName.split(' ')[0];
        }
        if (email) {
            return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
        }
        return 'Guest';
    };

    test('should extract first name from full name', () => {
        expect(getDisplayName('Pratik Sajnani', null)).toBe('Pratik');
    });

    test('should extract name from email', () => {
        expect(getDisplayName(null, 'pratik@test.com')).toBe('Pratik');
    });

    test('should return Guest if no name or email', () => {
        expect(getDisplayName(null, null)).toBe('Guest');
    });

    test('should handle Dr. prefix', () => {
        expect(getDisplayName('Dr. Ashok Sajnani', null)).toBe('Dr.');
    });
});

describe('Login State Management', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should detect logged in state', () => {
        const isLoggedIn = () => localStorage.getItem('hms_logged_in') === 'true';
        
        expect(isLoggedIn()).toBe(false);
        
        localStorage.setItem('hms_logged_in', 'true');
        expect(isLoggedIn()).toBe(true);
    });

    test('should get user role', () => {
        const getRole = () => localStorage.getItem('hms_role') || 'guest';
        
        expect(getRole()).toBe('guest');
        
        localStorage.setItem('hms_role', 'admin');
        expect(getRole()).toBe('admin');
    });

    test('logout should clear all user data', () => {
        localStorage.setItem('hms_logged_in', 'true');
        localStorage.setItem('hms_role', 'admin');
        localStorage.setItem('hms_user_email', 'test@test.com');
        localStorage.setItem('hms_user_name', 'Test User');
        
        // Simulate logout
        localStorage.removeItem('hms_logged_in');
        localStorage.removeItem('hms_role');
        localStorage.removeItem('hms_user_email');
        localStorage.removeItem('hms_user_name');
        
        expect(localStorage.getItem('hms_logged_in')).toBeNull();
        expect(localStorage.getItem('hms_role')).toBeNull();
        expect(localStorage.getItem('hms_user_email')).toBeNull();
        expect(localStorage.getItem('hms_user_name')).toBeNull();
    });
});

describe('Role Capitalization', () => {
    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    test('should capitalize role names', () => {
        expect(capitalize('admin')).toBe('Admin');
        expect(capitalize('doctor')).toBe('Doctor');
        expect(capitalize('receptionist')).toBe('Receptionist');
        expect(capitalize('patient')).toBe('Patient');
    });

    test('should handle empty string', () => {
        expect(capitalize('')).toBe('');
    });

    test('should handle null', () => {
        expect(capitalize(null)).toBe('');
    });
});

console.log('User Status Unit Tests loaded');
