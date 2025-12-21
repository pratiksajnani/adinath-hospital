# Security Policy

## 🔒 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it privately:

- **Email:** pratik.sajnani@gmail.com
- **Subject:** [SECURITY] Adinath Hospital Website

**Do NOT create public GitHub issues for security vulnerabilities.**

---

## 🛡️ Security Practices

### Credentials Management

- ❌ **Never commit real passwords** to this repository
- ❌ **Never expose API keys** in client-side code
- ✅ Use environment variables for sensitive data
- ✅ Use secure onboarding links with expiring tokens

### For Developers

1. **Before committing**, check for exposed secrets:
   ```bash
   npm run security:scan
   ```

2. **Demo/test credentials** should:
   - Only be used in local development
   - Never match production passwords
   - Be clearly marked as "DEMO ONLY"

3. **Production credentials** should:
   - Be stored in Supabase Auth (not localStorage)
   - Use strong, unique passwords
   - Enable 2FA where available

---

## 🔐 Access Control

| Role | Access Level |
|------|--------------|
| Site Admin | Full access to all data and settings |
| Doctor | Patient data, appointments, prescriptions |
| Staff | Patient registration, appointments, queue |
| Patient | Own data only |

---

## 📋 Security Checklist

- [ ] No credentials in README or public docs
- [ ] No API keys in JavaScript files
- [ ] Environment variables used for secrets
- [ ] HTTPS enforced on all pages
- [ ] Content Security Policy headers set
- [ ] XSS protection enabled
- [ ] SQL injection prevented (parameterized queries)

---

## 🔄 Credential Rotation

If credentials are compromised:

1. Immediately change passwords in Supabase
2. Revoke any exposed API keys
3. Update environment variables
4. Notify affected users
5. Review access logs

---

## 📞 Contact

**Security Team:** pratik.sajnani@gmail.com

