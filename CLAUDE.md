# CLAUDE.md

> Inherits from: ~/src/CLAUDE.md (workspace principles)
> Narrows: #1 Real data → real hospital, real doctors
> Adds: Patient content accuracy, accessibility, vanilla simplicity

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Adinath Hospital** is a comprehensive Hospital Management System (HMS) web application for a mid-size hospital in Ahmedabad, India. It features role-based access (Patient, Doctor, Staff, Admin), appointment booking, prescription management, and multilingual support (English, Hindi, Gujarati).

- **Live Site:** https://adinathhealth.com/
- **Hosting:** AWS Amplify (auto-deploy from `main` branch)
- **Tech Stack:** HTML5, CSS3, Vanilla JavaScript (no frameworks), localStorage for data

## Product Principles

1. **Patient safety first** — Real hospital, real doctors, real patients. Never ship fake data. Verify names, contacts, and medical info against AGENT.md before committing.
2. **Accessibility is non-negotiable** — WCAG compliance, multilingual (EN/HI/GU), mobile-first. Every feature must work across languages and devices.
3. **Vanilla simplicity** — No frameworks (React, Vue, etc.). HTML/CSS/JS with localStorage. Complexity comes from the domain, not the tooling.
4. **Progressive enhancement** — Core features work without JavaScript where possible. Service worker for offline, but pages degrade gracefully.
5. **Hospital staff are the users** — Receptionist Poonam, Dr. Ashok, Dr. Sunita use this daily. Optimize for their workflows, not developer convenience.

## Architecture & Key Modules

### Core Data Layer (`js/hms.js`)

The Hospital Management System is a localStorage-backed database abstraction providing:

- **Users**: Authentication and role-based access (admin, doctor, staff, patient)
- **Patients**: Patient registry with contact info and medical history
- **Appointments**: Scheduling, status tracking, and queue management
- **Prescriptions**: Medicine prescriptions with dosage instructions
- **Inventory**: Medical store stock tracking and billing
- **PatientLinks**: QR-code-based patient signup/access links

Key methods follow a consistent pattern:

- `Entity.add(data)` - Create with auto-generated ID
- `Entity.get(id)` - Retrieve by ID
- `Entity.getAll()` - List all records
- `Entity.update(id, data)` - Modify existing record
- `Entity.delete(id)` - Remove record

**Note:** All data methods are async (return Promises). Data is stored in Supabase (PostgreSQL).

### Internationalization (`js/i18n.js`)

Provides translations for EN (English), HI (Hindi), GU (Gujarati):

- `I18N.t(key)` - Get translation by key
- `I18N.setLanguage(code)` - Switch language
- `data-i18n="key"` - HTML attribute for auto-translation
- `data-i18n-placeholder="key"` - Placeholder translation

### UI & Interactions (`js/main.js`)

Central entry point for:

- Service worker registration (offline support)
- Global event listeners
- Page initialization based on current URL
- Modal/drawer management
- Form handling and validation

### Configuration (`js/config.js`)

Environment-specific settings. Key variables:

- `CONFIG.API_BASE_URL` - Base URL for API calls (localhost for dev, adinathhealth.com for prod)
- Update this if running against a different backend

## Development Commands

```bash
# Install dependencies
npm install

# Local server (serve static files)
npx serve
# Or with Python: python3 -m http.server 8080
# Then open http://localhost:8080

# Quality checks (lint + format + tests)
npm run quality

# Auto-fix linting and formatting
npm run quality:fix

# Run all tests
npm run test:all

# Run specific test suite
npm run test:unit

# E2E tests
npm run test:e2e

# Test locally, then deploy
npm run predeploy   # Runs quality checks
git push origin main # Amplify auto-deploys
```

## Code Style & Naming

### JavaScript

- Use `const`/`let` (never `var`)
- camelCase for variables and functions: `getPatientById()`
- UPPER_SNAKE_CASE for constants: `API_BASE_URL`
- PascalCase for classes: `PatientManager`
- Arrow functions for callbacks: `arr.map(x => x.id)`
- Template literals: `` `Hello ${name}` ``
- Strict equality: `===` and `!==`

### CSS & HTML

- kebab-case for CSS classes: `.patient-card`, `.menu-item`
- No inline styles (use utility classes in `css/design-system.css`)
- No page-specific `<style>` blocks; all styles in CSS files
- Use defined z-index scale (variables like `--z-modal`, `--z-dropdown`)
- Use spacing utilities: `.p-4`, `.mb-6`, `.mt-8` instead of custom padding/margin
- Color variables: `--primary`, `--success`, `--error` (never hardcoded hex values)
- BEM-like naming with modifiers: `.card__header--active`

### File Organization

```
adinath-hospital/
├── index.html              # Homepage
├── book.html               # Appointment booking
├── login.html              # Staff/Doctor login
├── store.html              # Public pharmacy
├── portal/index.html       # Portal navigation hub
├── portal/patient/         # Patient portal & dashboards
├── portal/doctor/          # Doctor dashboards
├── portal/staff/           # Staff/receptionist portal
├── portal/admin/           # Admin dashboard
├── forms/                  # Printable forms
├── services/               # Service detail pages
├── css/
│   ├── design-system.css   # Variables, utilities, design tokens (source of truth)
│   ├── styles.css          # Main website styles
│   └── components.css      # Shared component styles
├── js/
│   ├── hms.js              # Hospital Management System core
│   ├── i18n.js             # Translations
│   ├── config.js           # Configuration
│   └── main.js             # UI interactions & initialization
├── tests/
│   ├── test-runner.js      # Automated test suite
│   ├── TEST_STRATEGY.md    # Manual test cases
│   └── link-checker.js     # Link validation
├── images/                 # All media assets
└── docs/                   # Documentation & demo guides
```

## User Roles & Real Data

The system uses **real people** (not fake demo data):

| Role         | Name               | Email                       | Status             |
| ------------ | ------------------ | --------------------------- | ------------------ |
| Site Admin   | Pratik Sajnani     | pratik.sajnani@gmail.com    | ✅ Active          |
| Doctor       | Dr. Ashok Sajnani  | drsajnani@gmail.com         | ✅ Active          |
| Doctor       | Dr. Sunita Sajnani | sunita.sajnani9@gmail.com   | ✅ Active          |
| Receptionist | Poonam             | reception@adinathhealth.com | ⏳ Phone # pending |

**Important:** Always check that you're using the correct real names and contact info. Never commit test/fake data; use the real hospital information from AGENT.md.

## Testing Strategy

### Test Organization

- **Unit tests:** `tests/unit/*.test.js` - Logic testing with Jest
- **E2E tests:** `tests/e2e/*.spec.js` - Full user flows with Playwright
- **Link validation:** `tests/link-checker.js` - All pages accessible
- **Manual testing:** `tests/TEST_STRATEGY.md` - Step-by-step user flows

### Key Test Flows

1. **Patient:** Book appointment → View portal → Check status
2. **Doctor:** Login → View appointments → Write prescriptions → Send SMS
3. **Staff:** Login → Send patient links → Manage queue → View bills
4. **Admin:** View stats → Manage users → Content management

### Running Tests

```bash
npm run test:unit           # Jest unit tests
npm run test:e2e            # Playwright E2E tests
npm run test:all            # Unit + E2E + links
npm run test:links          # Link checker only
npm run test:report         # View Playwright report
npm run coverage            # Test coverage report
```

## Deployment & CI/CD

### GitHub Actions Workflow

On every push to `main`:

1. Install dependencies
2. Lint JavaScript (ESLint)
3. Check formatting (Prettier)
4. Run unit tests (Jest)
5. Run E2E tests (Playwright)
6. AWS Amplify auto-deploys successful builds

### Manual Deployment

```bash
# Make changes locally
git add -A
git commit -m "feat: add patient notifications"
git push origin main
# Amplify auto-deploys in ~2 minutes
```

### Pre-commit Hooks

Husky + lint-staged runs automatically before commits:

- ESLint fix + format JavaScript files
- Stylelint fix + format CSS files
- Prettier format JSON, Markdown, YAML
- Jest runs affected unit tests

If pre-commit checks fail, fix issues and commit again (never use `--no-verify`).

## Important Guidelines

### Real Hospital Data

- Hospital: **Adinath Hospital**, Ahmedabad
- Address: 2nd Floor, Shukan Mall, Shahibaug Rd, Ahmedabad 380004
- Phone: +91 99254 50425
- Hours: 11 AM - 7 PM (no emergencies)
- Doctors: Dr. Ashok Sajnani (Orthopedic), Dr. Sunita Sajnani (OB-GYN)

### Data Persistence

- All data stored in Supabase (PostgreSQL with Row Level Security)
- Data syncs across devices and browsers via Supabase session
- **Auth:** Supabase Auth (email/password, Google OAuth)
- `localStorage` only used for UI preferences (language, accessibility settings)

### Security Considerations

- No hardcoded credentials or sensitive data in repository
- Patient data currently demo-only (localStorage); production needs encryption
- Real SMS integration (MSG91/Twilio) is a future enhancement
- Real payment gateway is a future enhancement

### Accessibility & Multilingual

- WCAG compliance required for all new features
- All user-facing text must support i18n (EN/HI/GU)
- Use `data-i18n="key"` for HTML content
- Use `I18N.t('key')` in JavaScript
- Test language switching on modified pages

### Design System & Styling

- Use CSS variables (design-system.css) for all colors and spacing
- Utility classes for layout and spacing (no inline styles)
- Component classes for cards, alerts, badges (see STYLE_GUIDE.md)
- Z-index must use defined scale variables (`--z-modal`, `--z-dropdown`, etc.)
- Mobile-first responsive design

## Key Files to Know

| File                     | Purpose                  | Size                      |
| ------------------------ | ------------------------ | ------------------------- |
| `js/hms.js`              | HMS database abstraction | Core system               |
| `js/i18n.js`             | Translation system       | Multi-language support    |
| `js/main.js`             | UI interactions          | Page initialization       |
| `js/config.js`           | Environment config       | API base URL              |
| `css/design-system.css`  | Design tokens            | Single source of truth    |
| `tests/TEST_STRATEGY.md` | Manual test cases        | 8+ detailed flows         |
| `AGENT.md`               | AI agent context         | Real user data, TODO list |

## Common Tasks

### Add New User Role

1. Update `HMS.users.add()` in `js/hms.js` with role type
2. Add role checks in `js/main.js` page initialization
3. Create role-specific page in `portal/[role]/`
4. Test login flow for new role
5. Add translation keys for new role labels

### Fix a Page

1. Check which file(s) need changes (HTML, CSS, JS)
2. Verify current styling in `design-system.css` and `styles.css`
3. For logic changes, check if HMS methods are involved
4. Run `npm run quality` before committing
5. Push to `main` to trigger auto-deploy

### Add Translations

1. Add key-value pairs to all language sections in `js/i18n.js`
2. Use `data-i18n="key"` for HTML or `I18N.t('key')` in JS
3. Test in all 3 languages (language switcher on portal pages)

### Modify Form Fields

1. Update form HTML with new inputs
2. Add validation in form handler (usually in `js/main.js` or page-specific JS)
3. Update HMS model if storing new data
4. Add i18n labels and placeholders
5. Update corresponding printable form if needed

## Troubleshooting

### Data Not Persisting

Check Supabase connection in browser console. Verify `HMS.init()` completes without errors. Check network tab for failed Supabase API calls.

### Tests Failing

- Ensure `npm install` has run
- Check that Playwright browsers are installed: `npx playwright install`
- Review test output in `test-results/` directory
- Run failing test in isolation: `npm test -- --testPathPattern="filename"`

### Deployment Blocked

Check GitHub Actions status. Usually due to:

- ESLint/Prettier errors (run `npm run quality:fix`)
- Test failures (run `npm run test:all` locally first)
- Pre-commit hook failures (commit again after fixing)

### Local Server Issues

- Port 8080 already in use? Change: `npx serve -p 8081`
- Clear browser cache if seeing old code: Cmd+Shift+R (Mac) or Ctrl+Shift+R (PC)
- Check browser console for JavaScript errors

## References & Links

- **Live Site:** https://adinathhealth.com/
- **Staging:** https://main.d2a0i6erg1hmca.amplifyapp.com/
- **GitHub:** https://github.com/pratiksajnani/adinath-hospital
- **AWS Amplify Console:** https://console.aws.amazon.com/amplify/
- **Test Report:** After running tests, view with `npm run test:report`
- **Documentation:** See `docs/` folder for guides and demo scripts

## Contact & Support

For questions about the codebase or deployment:

- **Site Admin:** Pratik Sajnani (pratik.sajnani@gmail.com)
- **Repository:** pratiksajnani/adinath-hospital
