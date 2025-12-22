# Uptime Monitoring Setup

This document describes how to set up external uptime monitoring for Adinath Hospital website.

## Recommended Service: UptimeRobot (Free Tier)

UptimeRobot offers 50 free monitors with 5-minute check intervals.

### Setup Steps

1. **Create Account**
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Sign up for a free account

2. **Add Monitors**

   Create the following HTTP(s) monitors:

   | Monitor Name | URL | Check Interval |
   |--------------|-----|----------------|
   | Homepage | https://adinathhealth.com/ | 5 min |
   | Booking Page | https://adinathhealth.com/book.html | 5 min |
   | Login Page | https://adinathhealth.com/login.html | 5 min |
   | Doctor Portal | https://adinathhealth.com/portal/doctor/simple.html | 5 min |
   | Patient Portal | https://adinathhealth.com/portal/patient/index.html | 5 min |
   | Medical Store | https://adinathhealth.com/store.html | 5 min |

3. **Configure Alerts**

   Add alert contacts:
   - **Email**: pratik.sajnani@gmail.com (Site Admin)
   - **SMS via MSG91**: Use webhook integration (see below)

4. **Webhook for SMS Alerts**

   Set up a webhook alert that calls the MSG91 API:
   
   ```
   URL: https://lhwqwloibxiiqtgaoxqp.supabase.co/functions/v1/send-sms
   Method: POST
   Headers:
     Authorization: Bearer <your-anon-key>
     Content-Type: application/json
   Body:
     {
       "to": "+919925450425",
       "message": "🚨 ALERT: *monitorFriendlyName* is *alertTypeFriendlyName*",
       "template": "alert"
     }
   ```

5. **Status Page (Optional)**

   Create a public status page to show uptime to patients:
   - Enable "Public Status Page" in UptimeRobot settings
   - Add link to hospital website footer

## Alternative Services

### Pingdom (Paid)
- More detailed analytics
- Real user monitoring
- Starting at $10/month

### Better Uptime (Free Tier)
- 10 monitors free
- Beautiful status pages
- Incident management

### Freshping (Free)
- 50 monitors free
- Multi-location checks
- Status pages included

## Maintenance Windows

Configure maintenance windows to avoid false alerts during planned downtime:
- Sunday 2:00 AM - 4:00 AM IST (routine maintenance)

## Escalation Policy

1. **First Alert**: Email to admin
2. **After 5 minutes down**: SMS to admin
3. **After 15 minutes down**: SMS to Dr. Ashok and Dr. Sunita
4. **After 30 minutes down**: Phone call (if service supports it)

## Monthly Reports

UptimeRobot provides monthly uptime reports. Configure email delivery to:
- pratik.sajnani@gmail.com (weekly)
- drsajnani@gmail.com (monthly summary)

