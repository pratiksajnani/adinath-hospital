# 🚀 LAUNCH CHECKLIST - Adinath Hospital

## Domain: adinathhealth.com

---

## ✅ PRE-LAUNCH (Before DNS Switch)

### Technical
- [x] All pages load correctly
- [x] Mobile responsive on all devices
- [x] HTTPS configured (AWS Amplify auto)
- [x] Sitemap.xml updated with production URLs
- [x] robots.txt configured
- [x] Canonical URLs point to adinathhealth.com
- [x] JSON-LD structured data for SEO
- [x] Favicon & Apple touch icons
- [x] PWA manifest configured
- [x] 404 page customized

### Content
- [x] Doctor profiles complete
- [x] Service pages complete (Orthopedic, Gynecology, Yoga)
- [x] Contact information accurate
- [x] WhatsApp links working
- [x] Google Maps embedded
- [x] FAQ section complete

### Portals
- [x] Staff portal functional
- [x] Doctor portal functional
- [x] Patient portal functional
- [x] Admin portal functional
- [x] Feedback system active

### Forms
- [x] Booking form working
- [x] Patient intake form printable
- [x] Prescription form printable
- [x] Consent form printable
- [x] Discharge form printable

---

## 🔧 DNS CONFIGURATION

When your domain is ready:

### Option A: Point to AWS Amplify
1. Add CNAME record:
   - Name: `www`
   - Value: `main.d2a0i6erg1hmca.amplifyapp.com`
   
2. For root domain (adinathhealth.com):
   - Use ALIAS/ANAME record to Amplify
   - Or use redirect from www

### Option B: Use CloudFlare (Recommended)
1. Add site to CloudFlare
2. Change nameservers at registrar
3. Add CNAME for www → Amplify
4. Enable "Proxied" for SSL

---

## 📱 POST-LAUNCH TESTING

### Test on Real Devices
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Firefox

### Test Core Flows
- [ ] Book appointment (patient)
- [ ] Register patient (staff)
- [ ] View queue (doctor)
- [ ] Print prescription
- [ ] WhatsApp button works
- [ ] Language switching

### Test Each Portal
- [ ] `/login.html` - Login works
- [ ] `/portal/staff/index.html` - Staff features
- [ ] `/portal/doctor/simple.html` - Doctor features
- [ ] `/portal/patient/index.html` - Patient view
- [ ] `/portal/admin/index.html` - Admin view

---

## 📊 ANALYTICS SETUP (Optional)

### Google Analytics
Add to index.html:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Google Search Console
1. Verify domain ownership
2. Submit sitemap: `https://adinathhealth.com/sitemap.xml`

---

## 📞 CONTACT FOR ISSUES

- **Technical:** Pratik Sajnani - pratik.sajnani@gmail.com
- **Hospital:** +91 99254 50425

---

## 🎉 GO LIVE!

Once all checks pass:
1. Update DNS
2. Wait 10-48 hours for propagation
3. Test on production domain
4. Announce to patients!

---

*Last Updated: December 21, 2025*

