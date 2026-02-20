// ============================================
// ACCESS CONTROL & SECURITY
// Role-based page access management (Supabase)
// ============================================
const AccessControl = {
    // Page access rules
    // 'public' = anyone, 'authenticated' = any logged-in user, array = specific roles
    rules: {
        '/': 'public',
        '/index.html': 'public',
        '/book.html': 'public',
        '/store.html': 'public',
        '/check-status.html': 'public',
        '/login.html': 'public',
        '/404.html': 'public',
        '/services/': 'public',
        '/services/orthopedic.html': 'public',
        '/services/gynecology.html': 'public',
        '/services/yoga.html': 'public',

        '/onboard/': 'public',
        '/onboard/admin.html': 'public',
        '/onboard/doctor.html': 'public',
        '/onboard/staff.html': 'public',
        '/onboard/patient.html': 'public',

        '/docs/': 'public',
        '/docs/PATIENT_GUIDE.html': 'public',
        '/docs/PATIENT_DEMO.html': 'public',
        '/docs/share-links.html': 'public',

        '/docs/STAFF_GUIDE.html': ['admin', 'staff', 'receptionist'],
        '/docs/DOCTOR_GUIDE.html': ['admin', 'doctor'],
        '/docs/ADMIN_GUIDE.html': ['admin'],
        '/docs/SITEADMIN_DEMO.html': ['admin'],
        '/docs/test-matrix.html': ['admin'],
        '/docs/send-registration-links.html': ['admin'],

        '/forms/': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/index.html': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/patient-intake.html': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/prescription.html': ['admin', 'doctor'],
        '/forms/consent.html': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/discharge.html': ['admin', 'doctor'],
        '/forms/data-collection/': ['admin'],

        '/portal/': 'authenticated',
        '/portal/index.html': 'authenticated',

        '/portal/admin/': ['admin'],
        '/portal/admin/index.html': ['admin'],
        '/portal/admin/manage.html': ['admin'],
        '/portal/admin/send-registration.html': ['admin'],

        '/portal/doctor/': ['admin', 'doctor'],
        '/portal/doctor/index.html': ['admin', 'doctor'],
        '/portal/doctor/simple.html': ['admin', 'doctor'],

        '/portal/staff/': ['admin', 'staff', 'receptionist', 'nurse', 'pharmacist'],
        '/portal/staff/index.html': ['admin', 'staff', 'receptionist', 'nurse', 'pharmacist'],

        '/portal/patient/': ['admin', 'patient'],
        '/portal/patient/index.html': ['admin', 'patient'],
        '/portal/patient/appointments.html': ['admin', 'patient'],
        '/portal/patient/prescriptions.html': ['admin', 'patient'],

        '/store/': ['admin', 'staff', 'receptionist', 'pharmacist'],
        '/store/index.html': ['admin', 'staff', 'receptionist', 'pharmacist'],

        '/clear-cache.html': ['admin'],
    },

    // Get current user role from Supabase
    async getCurrentRole() {
        return HMS.auth.getRole();
    },

    // Check if user can access a given path
    canAccessWithRole(path, role) {
        let rule = this.rules[path];

        if (!rule) {
            const pathParts = path.split('/').filter((p) => p);
            for (let i = pathParts.length; i >= 0; i--) {
                const prefix = `/${pathParts.slice(0, i).join('/')}/`;
                if (this.rules[prefix]) {
                    rule = this.rules[prefix];
                    break;
                }
            }
        }

        if (!rule) {
            return true;
        }
        if (rule === 'public') {
            return true;
        }
        if (rule === 'authenticated') {
            return !!role;
        }
        if (Array.isArray(rule)) {
            return rule.includes(role);
        }
        return false;
    },

    // Enforce access control (async)
    async enforce() {
        const path = window.location.pathname;
        let normalizedPath = path;
        if (path.includes('/adinath-hospital')) {
            normalizedPath = path.replace('/adinath-hospital', '');
        }
        if (!normalizedPath.startsWith('/')) {
            normalizedPath = `/${normalizedPath}`;
        }

        const role = await this.getCurrentRole();

        if (!this.canAccessWithRole(normalizedPath, role)) {
            if (!role) {
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.assign(`${this.getBasePath()}login.html?redirect=${returnUrl}`);
            } else {
                // eslint-disable-next-line no-alert -- Intentional user notification
                window.alert(
                    '⛔ Access Denied\n\nYou do not have permission to access this page.\nRedirecting to your dashboard...'
                );
                this.redirectToRolePortal(role);
            }
        }
    },

    // Get base path for relative navigation
    getBasePath(testPath = null) {
        const path = testPath || window.location.pathname;
        if (
            path.includes('/portal/admin/') ||
            path.includes('/portal/doctor/') ||
            path.includes('/portal/staff/') ||
            path.includes('/portal/patient/') ||
            path.includes('/forms/data-collection/')
        ) {
            return '../../';
        }
        if (
            path.includes('/portal/') ||
            path.includes('/docs/') ||
            path.includes('/services/') ||
            path.includes('/forms/') ||
            path.includes('/store/') ||
            path.includes('/onboard/')
        ) {
            return '../';
        }
        return '';
    },

    // Redirect to appropriate portal based on role
    redirectToRolePortal(role) {
        const basePath = this.getBasePath();
        const portals = {
            admin: 'portal/admin/index.html',
            doctor: 'portal/doctor/simple.html',
            staff: 'portal/staff/index.html',
            receptionist: 'portal/staff/index.html',
            nurse: 'portal/staff/index.html',
            pharmacist: 'store/index.html',
            patient: 'portal/patient/index.html',
        };

        const portal = portals[role] || 'index.html';
        window.location.assign(basePath + portal);
    },

    // Session timeout (auto logout after inactivity)
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    lastActivity: Date.now(),

    initSessionTimeout() {
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
            document.addEventListener(
                event,
                () => {
                    this.lastActivity = Date.now();
                },
                { passive: true }
            );
        });

        setInterval(async () => {
            const role = await this.getCurrentRole();
            if (role && Date.now() - this.lastActivity > this.sessionTimeout) {
                // eslint-disable-next-line no-alert -- Intentional user notification
                window.alert('⏰ Session Expired\n\nYou have been logged out due to inactivity.');
                await this.logout();
            }
        }, 60000);
    },

    // Secure logout via Supabase
    async logout() {
        await HMS.auth.signOut();
        window.location.assign(`${this.getBasePath()}index.html`);
    },

    // Initialize (async)
    async init() {
        const publicPaths = [
            '/',
            '/index.html',
            '/login.html',
            '/book.html',
            '/store.html',
            '/404.html',
        ];
        const currentPath = window.location.pathname.replace('/adinath-hospital', '');

        if (
            !publicPaths.includes(currentPath) &&
            !currentPath.startsWith('/services/') &&
            !currentPath.startsWith('/onboard/')
        ) {
            await this.enforce();
        }

        const role = await this.getCurrentRole();
        if (role) {
            this.initSessionTimeout();
        }
    },
};

// Auto-initialize when DOM is ready (async)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccessControl.init());
} else {
    AccessControl.init();
}

// Export for use in other scripts
window.AccessControl = AccessControl;

// Export for Node.js/Jest testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessControl;
}
