// ============================================
// ACCESS CONTROL & SECURITY
// Role-based page access management
// ============================================

const AccessControl = {
    // Define page access rules
    // 'public' = anyone can access
    // 'authenticated' = any logged in user
    // Array of roles = only those roles can access
    rules: {
        // Public pages - anyone can access
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
        
        // Onboarding - requires valid token (handled by page itself)
        '/onboard/': 'public',
        '/onboard/admin.html': 'public',
        '/onboard/doctor.html': 'public',
        '/onboard/staff.html': 'public',
        '/onboard/patient.html': 'public',
        
        // Documentation/Guides - public for now
        '/docs/': 'public',
        '/docs/PATIENT_GUIDE.html': 'public',
        '/docs/PATIENT_DEMO.html': 'public',
        '/docs/share-links.html': 'public',
        
        // Staff-only guides
        '/docs/STAFF_GUIDE.html': ['admin', 'staff', 'receptionist'],
        
        // Doctor-only guides  
        '/docs/DOCTOR_GUIDE.html': ['admin', 'doctor'],
        
        // Admin-only guides
        '/docs/ADMIN_GUIDE.html': ['admin'],
        '/docs/SITEADMIN_DEMO.html': ['admin'],
        '/docs/test-matrix.html': ['admin'],
        '/docs/send-registration-links.html': ['admin'],
        
        // Forms - staff and above
        '/forms/': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/index.html': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/patient-intake.html': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/prescription.html': ['admin', 'doctor'],
        '/forms/consent.html': ['admin', 'doctor', 'staff', 'receptionist'],
        '/forms/discharge.html': ['admin', 'doctor'],
        '/forms/data-collection/': ['admin'],
        
        // Portal - role-specific access
        '/portal/': 'authenticated',
        '/portal/index.html': 'authenticated',
        
        // Admin portal
        '/portal/admin/': ['admin'],
        '/portal/admin/index.html': ['admin'],
        '/portal/admin/manage.html': ['admin'],
        '/portal/admin/send-registration.html': ['admin'],
        
        // Doctor portal
        '/portal/doctor/': ['admin', 'doctor'],
        '/portal/doctor/index.html': ['admin', 'doctor'],
        '/portal/doctor/simple.html': ['admin', 'doctor'],
        
        // Staff portal
        '/portal/staff/': ['admin', 'staff', 'receptionist', 'nurse', 'pharmacist'],
        '/portal/staff/index.html': ['admin', 'staff', 'receptionist', 'nurse', 'pharmacist'],
        
        // Patient portal
        '/portal/patient/': ['admin', 'patient'],
        '/portal/patient/index.html': ['admin', 'patient'],
        '/portal/patient/appointments.html': ['admin', 'patient'],
        '/portal/patient/prescriptions.html': ['admin', 'patient'],
        
        // Store dashboard - staff only
        '/store/': ['admin', 'staff', 'receptionist', 'pharmacist'],
        '/store/index.html': ['admin', 'staff', 'receptionist', 'pharmacist'],
        
        // Cache clear - admin only
        '/clear-cache.html': ['admin']
    },
    
    // Get current user role
    getCurrentRole() {
        const isLoggedIn = localStorage.getItem('hms_logged_in') === 'true';
        if (!isLoggedIn) return null;
        return localStorage.getItem('hms_role');
    },
    
    // Check if user can access current page
    canAccess(path) {
        const role = this.getCurrentRole();
        
        // Find matching rule (check exact match first, then prefix match)
        let rule = this.rules[path];
        
        if (!rule) {
            // Try prefix matching for directories
            const pathParts = path.split('/').filter(p => p);
            for (let i = pathParts.length; i >= 0; i--) {
                const prefix = '/' + pathParts.slice(0, i).join('/') + '/';
                if (this.rules[prefix]) {
                    rule = this.rules[prefix];
                    break;
                }
            }
        }
        
        // Default to public if no rule found
        if (!rule) return true;
        
        // Public pages
        if (rule === 'public') return true;
        
        // Authenticated pages
        if (rule === 'authenticated') return !!role;
        
        // Role-specific pages
        if (Array.isArray(rule)) {
            return rule.includes(role);
        }
        
        return false;
    },
    
    // Enforce access control
    enforce() {
        const path = window.location.pathname;
        
        // Normalize path
        let normalizedPath = path;
        if (path.includes('/adinath-hospital')) {
            normalizedPath = path.replace('/adinath-hospital', '');
        }
        if (!normalizedPath.startsWith('/')) {
            normalizedPath = '/' + normalizedPath;
        }
        
        if (!this.canAccess(normalizedPath)) {
            const role = this.getCurrentRole();
            
            if (!role) {
                // Not logged in - redirect to login
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = this.getBasePath() + 'login.html?redirect=' + returnUrl;
            } else {
                // Logged in but unauthorized - show error and redirect
                alert('⛔ Access Denied\n\nYou do not have permission to access this page.\nRedirecting to your dashboard...');
                this.redirectToRolePortal(role);
            }
        }
    },
    
    // Get base path for current environment
    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/portal/admin/') || path.includes('/portal/doctor/') || 
            path.includes('/portal/staff/') || path.includes('/portal/patient/') ||
            path.includes('/forms/data-collection/')) {
            return '../../';
        }
        if (path.includes('/portal/') || path.includes('/docs/') || 
            path.includes('/services/') || path.includes('/forms/') ||
            path.includes('/store/') || path.includes('/onboard/')) {
            return '../';
        }
        return '';
    },
    
    // Redirect to appropriate portal based on role
    redirectToRolePortal(role) {
        const basePath = this.getBasePath();
        const portals = {
            'admin': 'portal/admin/index.html',
            'doctor': 'portal/doctor/simple.html',
            'staff': 'portal/staff/index.html',
            'receptionist': 'portal/staff/index.html',
            'nurse': 'portal/staff/index.html',
            'pharmacist': 'store/index.html',
            'patient': 'portal/patient/index.html'
        };
        
        const portal = portals[role] || 'index.html';
        window.location.href = basePath + portal;
    },
    
    // Add security headers via meta tags (CSP, etc.)
    addSecurityMeta() {
        // Content Security Policy
        const csp = document.createElement('meta');
        csp.httpEquiv = 'Content-Security-Policy';
        csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:;";
        
        // X-Content-Type-Options
        const xcto = document.createElement('meta');
        xcto.httpEquiv = 'X-Content-Type-Options';
        xcto.content = 'nosniff';
        
        // X-Frame-Options
        const xfo = document.createElement('meta');
        xfo.httpEquiv = 'X-Frame-Options';
        xfo.content = 'SAMEORIGIN';
        
        // Referrer Policy
        const rp = document.createElement('meta');
        rp.name = 'referrer';
        rp.content = 'strict-origin-when-cross-origin';
        
        document.head.prepend(rp, xfo, xcto, csp);
    },
    
    // Session timeout (auto logout after inactivity)
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    lastActivity: Date.now(),
    
    initSessionTimeout() {
        // Update last activity on user interaction
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            }, { passive: true });
        });
        
        // Check for timeout every minute
        setInterval(() => {
            const role = this.getCurrentRole();
            if (role && (Date.now() - this.lastActivity > this.sessionTimeout)) {
                alert('⏰ Session Expired\n\nYou have been logged out due to inactivity.');
                this.logout();
            }
        }, 60000);
    },
    
    // Secure logout
    logout() {
        localStorage.removeItem('hms_logged_in');
        localStorage.removeItem('hms_role');
        localStorage.removeItem('hms_user_email');
        localStorage.removeItem('hms_user_name');
        localStorage.removeItem('hms_current_user');
        localStorage.removeItem('hms_auth_method');
        localStorage.removeItem('hms_doctor');
        localStorage.removeItem('hms_demo_user');
        
        window.location.href = this.getBasePath() + 'index.html';
    },
    
    // Initialize
    init() {
        // Add security meta tags
        this.addSecurityMeta();
        
        // Enforce access control (skip for public pages to avoid redirect loops)
        const publicPaths = ['/', '/index.html', '/login.html', '/book.html', '/store.html', '/404.html'];
        const currentPath = window.location.pathname.replace('/adinath-hospital', '');
        
        if (!publicPaths.includes(currentPath) && 
            !currentPath.startsWith('/services/') &&
            !currentPath.startsWith('/onboard/')) {
            this.enforce();
        }
        
        // Initialize session timeout for authenticated users
        if (this.getCurrentRole()) {
            this.initSessionTimeout();
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccessControl.init());
} else {
    AccessControl.init();
}

// Export for use in other scripts
window.AccessControl = AccessControl;

