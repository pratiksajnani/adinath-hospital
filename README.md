# 🏥 Adinath Hospital Website

Official website for Adinath Hospital, Ahmedabad - Orthopedic & Gynecology Care.

## 🔗 Live Website

| Link | URL |
|------|-----|
| **Main Site** | https://main.d2a0i6erg1hmca.amplifyapp.com |
| **Short URL** | https://tinyurl.com/adinath-hospital |
| **Patient Demo Guide** | https://tinyurl.com/2xj66x22 |

---

## 📱 Patient Demo Guide

### Quick Test (5 minutes)

Open the website on your phone and try these:

1. **📅 Book Appointment** → Select doctor → Pick date → Submit
2. **👨‍⚕️ View Doctors** → See Dr. Ashok & Dr. Sunita profiles
3. **🧘 Yoga Classes** → View schedule and photos
4. **💊 Medical Store** → Check pharmacy info
5. **📍 Get Directions** → Opens Google Maps
6. **🌐 Switch Language** → Try EN/हि/ગુ buttons
7. **💬 WhatsApp** → Green button opens chat
8. **📞 Call** → Tap phone number to call

### Pages to Test

| Page | Path |
|------|------|
| Homepage | `/` |
| Book Appointment | `/book.html` |
| Orthopedic Services | `/services/orthopedic.html` |
| Gynecology Services | `/services/gynecology.html` |
| Yoga Classes | `/services/yoga.html` |
| Medical Store | `/store.html` |
| Staff Login | `/login.html` |

### Demo Checklist

- [ ] Phone numbers work (calls +91 99254 50425)
- [ ] WhatsApp opens correctly
- [ ] Google Maps shows right location
- [ ] Booking form submits
- [ ] Doctor photos display properly
- [ ] Language switching works
- [ ] Mobile view looks good

---

## 🏢 Hospital Information

**Adinath Hospital**  
Shukan Mall, 2nd Floor  
Shahibaug Rd., Near Rajasthan Hospital  
Shahi Baug, Ahmedabad, Gujarat 380004  
India

**Phone:** +91 99254 50425  
**Hours:** Mon-Sat 11:00 AM - 7:00 PM

### Doctors

| Doctor | Specialty | Experience |
|--------|-----------|------------|
| Dr. Ashok Sajnani | Orthopedic & Joint Surgery | 35+ years |
| Dr. Sunita Sajnani | OB-GYN & Yoga | 30+ years |

---

## 🛠 Development

### Local Development

```bash
# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js
npx serve

# Option 3: VS Code Live Server
# Install Live Server extension and click "Go Live"
```

### Project Structure

```
adinath-hospital/
├── index.html          # Homepage
├── book.html           # Appointment booking
├── login.html          # Staff login
├── store.html          # Medical store info
├── services/           # Service pages
│   ├── orthopedic.html
│   ├── gynecology.html
│   └── yoga.html
├── portal/             # Staff portals
│   ├── doctor/
│   ├── staff/
│   ├── admin/
│   └── patient/
├── forms/              # Printable forms
│   ├── patient-intake.html
│   ├── prescription.html
│   └── consent.html
├── css/styles.css      # Main stylesheet
├── js/
│   ├── main.js         # Main JavaScript
│   ├── config.js       # Configuration
│   ├── i18n.js         # Translations
│   ├── hms.js          # Hospital Management System
│   └── supabase-client.js # Auth (optional)
└── images/             # Photos and icons
```

---

## 🚀 Deployment

### Hosting: AWS Amplify

The site auto-deploys when you push to `main` branch.

```bash
# Deploy changes
git add -A
git commit -m "Your changes"
git push origin main
# Wait ~2 minutes for Amplify to deploy
```

### Configuration Files

| File | Purpose |
|------|---------|
| `amplify.yml` | Build configuration |
| `_redirects` | URL rewrite rules |
| `manifest.json` | PWA settings |
| `sw.js` | Service worker |
| `sitemap.xml` | SEO sitemap |
| `robots.txt` | Search engine rules |

---

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [PATIENT_DEMO.html](docs/PATIENT_DEMO.html) | Patient walkthrough guide |
| [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Authentication setup |
| [QUESTIONS.md](docs/QUESTIONS.md) | Data needed from family |

---

## 🔐 Staff Access

Demo login accounts (password: any in demo mode):

| Role | Email |
|------|-------|
| Admin | pratik.sajnani@gmail.com |
| Doctor | drsajnani@gmail.com |
| Doctor | sunita.sajnani9@gmail.com |
| Staff | poonam@adinathhospital.com |

---

## 📞 Contact

- **Hospital:** +91 99254 50425
- **WhatsApp:** [Chat](https://wa.me/919925450425)
- **Developer:** Pratik Sajnani

---

© 2025 Adinath Hospital. All rights reserved.  
Made with ❤️ in Ahmedabad
