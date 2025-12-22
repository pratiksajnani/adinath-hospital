// ============================================
// USER STATUS COMPONENT
// Shows logged-in user or Guest on all pages
// ============================================

// Inject User Status UI into page
function injectUserStatus() {
    // Don't inject if page already has a nav-integrated user status
    if (
        document.querySelector('.nav .user-status') ||
        document.getElementById('user-status-widget')
    ) {
        // Just update the existing widget instead
        updateUserStatusWidget();
        return;
    }

    // Create the user status HTML
    const userStatusHTML = `
        <div id="user-status-widget" style="
            position: fixed;
            top: 15px;
            right: 20px;
            z-index: 9999;
            font-family: 'Segoe UI', system-ui, sans-serif;
        ">
            <div id="user-status-btn" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: white;
                border-radius: 25px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.15);
                cursor: pointer;
                font-size: 14px;
                border: 2px solid #0f766e;
                transition: all 0.2s;
            " onclick="toggleUserMenu()">
                <span id="user-status-icon">👤</span>
                <span id="user-status-name" style="font-weight: 500; color: #1e293b;">Guest</span>
                <span style="color: #64748b; font-size: 10px;">▼</span>
            </div>
            
            <div id="user-status-menu" style="
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                min-width: 220px;
                overflow: hidden;
            ">
                <!-- Guest Menu -->
                <div id="guest-menu-items">
                    <a href="${getBasePath()}login.html" style="display: block; padding: 12px 16px; text-decoration: none; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                        🔐 Staff/Doctor Login
                    </a>
                    <a href="${getBasePath()}portal/patient/index.html" style="display: block; padding: 12px 16px; text-decoration: none; color: #1e293b;">
                        🏥 Patient Portal
                    </a>
                </div>
                
                <!-- Logged In Menu -->
                <div id="logged-in-menu-items" style="display: none;">
                    <div style="padding: 16px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-bottom: 1px solid #e2e8f0;">
                        <div id="menu-user-name" style="font-weight: 600; color: #0f766e; font-size: 15px;">User</div>
                        <div id="menu-user-role" style="font-size: 12px; color: #64748b; text-transform: capitalize; margin-top: 2px;">Role</div>
                    </div>
                    <a href="#" id="menu-portal-link" style="display: block; padding: 12px 16px; text-decoration: none; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                        📊 My Dashboard
                    </a>
                    <a href="${getBasePath()}index.html" style="display: block; padding: 12px 16px; text-decoration: none; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
                        🏠 Home
                    </a>
                    <a href="#" onclick="doLogout(); return false;" style="display: block; padding: 12px 16px; text-decoration: none; color: #dc2626;">
                        🚪 Logout
                    </a>
                </div>
            </div>
        </div>
    `;

    // Add to page
    document.body.insertAdjacentHTML('beforeend', userStatusHTML);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const widget = document.getElementById('user-status-widget');
        if (widget && !widget.contains(e.target)) {
            document.getElementById('user-status-menu').style.display = 'none';
        }
    });

    // Update status on load
    updateUserStatusWidget();
}

// Get base path for links
// Accepts optional path parameter for testing
function getBasePath(testPath = null) {
    const path = testPath || window.location.pathname;

    if (
        path.includes('/portal/') ||
        path.includes('/docs/') ||
        path.includes('/services/') ||
        path.includes('/forms/') ||
        path.includes('/store/') ||
        path.includes('/onboard/')
    ) {
        // Nested pages
        if (path.split('/').filter((p) => p).length >= 3) {
            return '../../';
        }
        return '../';
    }
    return '';
}

// Toggle menu visibility
function toggleUserMenu() {
    const menu = document.getElementById('user-status-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Update the widget based on login status
function updateUserStatusWidget() {
    const isLoggedIn = localStorage.getItem('hms_logged_in') === 'true';
    const role = localStorage.getItem('hms_role');
    const userName =
        localStorage.getItem('hms_user_name') || localStorage.getItem('hms_user_email');

    // Try injected widget first, then nav-integrated version
    const icon = document.getElementById('user-status-icon') || document.getElementById('userIcon');
    const name =
        document.getElementById('user-status-name') || document.getElementById('userDisplayName');
    const guestMenu =
        document.getElementById('guest-menu-items') || document.getElementById('guestMenu');
    const loggedInMenu =
        document.getElementById('logged-in-menu-items') || document.getElementById('loggedInMenu');
    const menuName =
        document.getElementById('menu-user-name') || document.getElementById('loggedInName');
    const menuRole =
        document.getElementById('menu-user-role') || document.getElementById('loggedInRole');
    const portalLink =
        document.getElementById('menu-portal-link') || document.getElementById('myPortalLink');

    if (!icon && !name) {
        return;
    }

    if (isLoggedIn && role) {
        // Logged in state
        const roleIcons = {
            admin: '👑',
            doctor: '👨‍⚕️',
            staff: '💁',
            receptionist: '💁',
            nurse: '👩‍⚕️',
            patient: '🏥',
        };

        const roleColors = {
            admin: '#dc2626',
            doctor: '#0f766e',
            staff: '#7c3aed',
            receptionist: '#7c3aed',
            patient: '#2563eb',
        };

        const displayName = userName ? userName.split('@')[0].split(' ')[0] : role;

        if (icon) {
            icon.textContent = roleIcons[role] || '👤';
        }
        if (name) {
            name.textContent = displayName;
            name.style.color = roleColors[role] || '#1e293b';
        }

        if (guestMenu) {
            guestMenu.style.display = 'none';
        }
        if (loggedInMenu) {
            loggedInMenu.style.display = 'block';
        }
        if (menuName) {
            menuName.textContent = userName || 'User';
        }
        if (menuRole) {
            menuRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        }

        // Set portal link
        const basePath = getBasePath();
        const portalLinks = {
            admin: `${basePath}portal/admin/index.html`,
            doctor: `${basePath}portal/doctor/simple.html`,
            staff: `${basePath}portal/staff/index.html`,
            receptionist: `${basePath}portal/staff/index.html`,
            patient: `${basePath}portal/patient/index.html`,
        };
        if (portalLink) {
            portalLink.href = portalLinks[role] || `${basePath}portal/index.html`;
        }
    } else {
        // Guest state
        if (icon) {
            icon.textContent = '👤';
        }
        if (name) {
            name.textContent = 'Guest';
            name.style.color = '#64748b';
        }

        if (guestMenu) {
            guestMenu.style.display = 'block';
        }
        if (loggedInMenu) {
            loggedInMenu.style.display = 'none';
        }
    }
}

// Logout function
function doLogout() {
    localStorage.removeItem('hms_logged_in');
    localStorage.removeItem('hms_role');
    localStorage.removeItem('hms_user_email');
    localStorage.removeItem('hms_user_name');
    localStorage.removeItem('hms_current_user');
    localStorage.removeItem('hms_auth_method');
    localStorage.removeItem('hms_doctor_id');
    localStorage.removeItem('currentPatient');

    updateUserStatusWidget();

    // Redirect to home
    window.location.assign(`${getBasePath()}index.html`);
}

// Auto-inject when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUserStatus);
} else {
    injectUserStatus();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBasePath,
        toggleUserMenu,
        updateUserStatusWidget,
        doLogout,
        injectUserStatus,
    };
}
