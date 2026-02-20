// ============================================
// USER STATUS COMPONENT
// Shows logged-in user or Guest on all pages
// Uses Supabase session for auth state
// ============================================
// Get base path for links (shared with AccessControl)
function getBasePath(testPath = null) {
    if (typeof AccessControl !== 'undefined' && AccessControl.getBasePath) {
        return AccessControl.getBasePath(testPath);
    }
    const path = testPath || window.location.pathname;
    if (
        path.includes('/portal/') ||
        path.includes('/docs/') ||
        path.includes('/services/') ||
        path.includes('/forms/') ||
        path.includes('/store/') ||
        path.includes('/onboard/')
    ) {
        if (path.split('/').filter((p) => p).length >= 3) {
            return '../../';
        }
        return '../';
    }
    return '';
}

// Inject component styles (once)
function injectUserStatusStyles() {
    if (document.getElementById('user-status-styles')) {
        return;
    }
    const style = document.createElement('style');
    style.id = 'user-status-styles';
    style.textContent = `
        /* Floating widget (pages without nav) */
        body > #user-status-widget {
            position: fixed;
            top: 15px;
            right: 20px;
            z-index: 99;
            font-family: "Segoe UI", system-ui, sans-serif;
        }
        /* Nav-integrated: flows as flex child */
        .nav > #user-status-widget {
            position: relative;
        }
        /* Button pill */
        #user-status-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            border-radius: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
            cursor: pointer;
            font-size: 14px;
            border: 2px solid #236b48;
            transition: all 0.2s;
        }
        .nav > #user-status-widget #user-status-btn {
            box-shadow: none;
            padding: 6px 14px;
        }
        #user-status-name {
            font-weight: 500;
            color: #1e293b;
        }
        #user-status-btn .us-arrow {
            color: #64748b;
            font-size: 10px;
        }
        /* Dropdown menu (display: none set inline for JS toggle) */
        #user-status-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            min-width: 220px;
            overflow: hidden;
            z-index: 999;
        }
        #user-status-menu a {
            display: block;
            padding: 12px 16px;
            text-decoration: none;
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
        }
        /* Override nav link styles that bleed into menu */
        #user-status-menu a::after { content: none; }
        #user-status-menu a:last-child { border-bottom: none; }
        #user-status-menu a:hover { background: #f8fafc; }
        #user-status-menu .us-logout { color: #dc2626; }
        .us-header {
            padding: 16px;
            background: linear-gradient(135deg, #f0fdf4, #e8f5e9);
            border-bottom: 1px solid #e2e8f0;
        }
        #menu-user-name {
            font-weight: 600;
            color: #236b48;
            font-size: 15px;
        }
        #menu-user-role {
            font-size: 12px;
            color: #64748b;
            text-transform: capitalize;
            margin-top: 2px;
        }
    `;
    document.head.appendChild(style);
}

// Build the widget DOM tree (no inline styles)
function buildUserStatusWidget() {
    const basePath = getBasePath();

    const widget = document.createElement('div');
    widget.id = 'user-status-widget';

    const btn = document.createElement('div');
    btn.id = 'user-status-btn';
    btn.onclick = toggleUserMenu;

    const iconSpan = Object.assign(document.createElement('span'), {
        id: 'user-status-icon',
        textContent: '👤',
    });
    const nameSpan = Object.assign(document.createElement('span'), {
        id: 'user-status-name',
        textContent: 'Guest',
    });
    const arrow = document.createElement('span');
    arrow.className = 'us-arrow';
    arrow.textContent = '▼';
    btn.append(iconSpan, nameSpan, arrow);

    const menu = document.createElement('div');
    menu.id = 'user-status-menu';
    menu.style.display = 'none'; // inline so toggleUserMenu() can read it

    // Guest menu
    const guestMenu = document.createElement('div');
    guestMenu.id = 'guest-menu-items';

    const loginLink = Object.assign(document.createElement('a'), {
        href: `${basePath}login.html`,
        textContent: '🔐 Staff/Doctor Login',
    });
    const patientLink = Object.assign(document.createElement('a'), {
        href: `${basePath}portal/patient/index.html`,
        textContent: '🏥 Patient Portal',
    });
    guestMenu.append(loginLink, patientLink);

    // Logged-in menu
    const loggedInMenu = document.createElement('div');
    loggedInMenu.id = 'logged-in-menu-items';
    loggedInMenu.style.display = 'none';

    const userHeader = document.createElement('div');
    userHeader.className = 'us-header';
    const menuUserName = Object.assign(document.createElement('div'), {
        id: 'menu-user-name',
        textContent: 'User',
    });
    const menuUserRole = Object.assign(document.createElement('div'), {
        id: 'menu-user-role',
        textContent: 'Role',
    });
    userHeader.append(menuUserName, menuUserRole);

    const portalLink = Object.assign(document.createElement('a'), {
        id: 'menu-portal-link',
        href: '#',
        textContent: '📊 My Dashboard',
    });
    const homeLink = Object.assign(document.createElement('a'), {
        href: `${basePath}index.html`,
        textContent: '🏠 Home',
    });
    const logoutLink = Object.assign(document.createElement('a'), {
        href: '#',
        textContent: '🚪 Logout',
        className: 'us-logout',
    });
    logoutLink.onclick = (e) => {
        e.preventDefault();
        doLogout();
    };

    loggedInMenu.append(userHeader, portalLink, homeLink, logoutLink);
    menu.append(guestMenu, loggedInMenu);
    widget.append(btn, menu);

    return widget;
}

// Inject User Status UI into page
function injectUserStatus() {
    // Skip if inline user-status exists in nav (e.g., index.html)
    if (document.querySelector('.nav .user-status')) {
        updateUserStatusWidget();
        return;
    }
    // Skip if already injected
    if (document.getElementById('user-status-widget')) {
        updateUserStatusWidget();
        return;
    }

    injectUserStatusStyles();
    const widget = buildUserStatusWidget();

    // Integrate into nav if one exists — flows as flex child, no overlap.
    // All <header class="header"> pages have .nav inside, so this covers
    // every fixed-header page. Pages without a nav get the floating widget.
    const nav = document.querySelector('.header .nav');
    if (nav) {
        nav.appendChild(widget);
    } else {
        document.body.appendChild(widget);
    }

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target)) {
            const menu = document.getElementById('user-status-menu');
            if (menu) {
                menu.style.display = 'none';
            }
        }
    });

    updateUserStatusWidget();
}

// Toggle menu visibility
function toggleUserMenu() {
    const menu = document.getElementById('user-status-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Update the widget based on Supabase session
async function updateUserStatusWidget() {
    let role = null;
    let userName = null;

    try {
        if (typeof HMS !== 'undefined') {
            // Ensure HMS is initialized (processes #access_token hash if present)
            await HMS.init();
            const profile = await HMS.auth.getProfile();
            if (profile) {
                role = profile.role;
                userName = profile.name || profile.email;
            }
        }
    } catch {
        // HMS not available or no session
    }

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

    if (role) {
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
            doctor: '#236b48',
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

// Logout via Supabase
async function doLogout() {
    await HMS.auth.signOut();
    await updateUserStatusWidget();
    window.location.assign(`${getBasePath()}index.html`);
}

// Auto-inject when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUserStatus);
} else {
    injectUserStatus();
}

// Re-render widget when auth state changes (e.g., after OAuth redirect processes #access_token)
if (typeof HMS !== 'undefined' && typeof HMS.init === 'function') {
    HMS.init()
        .then(() => {
            if (typeof HMS.auth.onAuthStateChange === 'function') {
                HMS.auth.onAuthStateChange(() => {
                    updateUserStatusWidget();
                });
            }
        })
        .catch(() => {});
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
