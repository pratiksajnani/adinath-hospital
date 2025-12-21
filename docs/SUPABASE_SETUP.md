# 🔐 Supabase Setup Guide for Adinath Hospital

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project** (free tier available)
3. Sign in with GitHub
4. Click **New Project**
5. Fill in:
   - **Name:** `adinath-hospital`
   - **Database Password:** (save this somewhere safe!)
   - **Region:** `South Asia (Mumbai)` - closest to Ahmedabad
6. Click **Create new project** (takes ~2 minutes)

### Step 2: Get Your API Keys

1. In your project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 3: Update the Website

Open `js/supabase-client.js` and update:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT_ID.supabase.co',  // Paste Project URL
    anonKey: 'eyJ...'  // Paste anon public key
};
```

### Step 4: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Paste this SQL and click **Run**:

```sql
-- Users table (for staff profiles)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_gu TEXT,
    name_hi TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'patient',
    photo_url TEXT,
    department TEXT,
    specialty TEXT,
    permissions TEXT[],
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT,
    address TEXT,
    blood_group TEXT,
    medical_history TEXT,
    allergies TEXT,
    emergency_contact TEXT,
    preferred_language TEXT DEFAULT 'hi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    doctor_id TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    reason TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    doctor_id TEXT NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    diagnosis TEXT,
    medicines JSONB,
    advice TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table (for medical store)
CREATE TABLE inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    unit TEXT,
    price DECIMAL(10,2),
    expiry_date DATE,
    reorder_level INTEGER DEFAULT 10,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Policies for patients (staff and doctors can view all)
CREATE POLICY "Staff can view patients" ON patients
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'doctor', 'receptionist', 'nurse'))
    );

-- Policies for appointments
CREATE POLICY "Staff can manage appointments" ON appointments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'doctor', 'receptionist'))
    );

-- Insert default admin user (run after first signup)
-- UPDATE users SET role = 'admin' WHERE email = 'pratik.sajnani@gmail.com';
```

### Step 5: Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. (Optional) Configure email templates

### Step 6: Test It!

1. Push the code changes: `git add -A && git commit -m "Add Supabase" && git push`
2. Wait for Amplify to deploy (~2 mins)
3. Go to your website login page
4. Try signing up with your email
5. Check Supabase dashboard → **Authentication** → **Users** to see the new user

---

## Optional: Phone OTP Login

For phone/SMS login (patients), you need Twilio:

1. Create Twilio account at [twilio.com](https://www.twilio.com)
2. Get a phone number
3. In Supabase: **Authentication** → **Providers** → **Phone**
4. Add your Twilio credentials

---

## Demo Mode

Until Supabase is configured, the website runs in **demo mode**:
- Login works with any password
- Data saves to browser localStorage only
- Not shared across devices/browsers

Once you add the Supabase config, it automatically switches to real mode.

---

## Need Help?

The code is designed to gracefully fall back to demo mode if Supabase isn't configured. You can set it up whenever ready!

