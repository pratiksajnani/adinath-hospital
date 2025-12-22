// ============================================
// ADINATH HOSPITAL - Supabase Client
// Real authentication & database
// ============================================

// Supabase Configuration
// Project: adinath-hospital (Mumbai region)
const SUPABASE_CONFIG = {
    url: 'https://lhwqwloibxiiqtgaoxqp.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod3F3bG9pYnhpaXF0Z2FveHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzMzMzksImV4cCI6MjA4MTkwOTMzOX0.s5IuG7e50dam4QAPpyTXEYoNHIWv8PupOgXx8Y_Rv0Y',
};

// Initialize Supabase client (lazy load)
let _supabase = null;

function getSupabase() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.warn('Supabase not configured. Using demo mode.');
        return null;
    }

    if (!_supabase && window.supabase) {
        _supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
    return _supabase;
}

// ============================================
// AUTH MODULE
// ============================================
const SupabaseAuth = {
    // Check if Supabase is configured
    isConfigured() {
        return SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey;
    },

    // Get current session
    async getSession() {
        const supabase = getSupabase();
        if (!supabase) {
            return null;
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session;
    },

    // Get current user
    async getCurrentUser() {
        const session = await this.getSession();
        if (!session) {
            return null;
        }

        // Get user profile from our users table
        const supabase = getSupabase();
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

        return profile;
    },

    // Sign up with email/password
    async signUp(email, password, userData = {}) {
        const supabase = getSupabase();
        if (!supabase) {
            return { error: { message: 'Supabase not configured' } };
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: userData.name,
                    role: userData.role || 'patient',
                },
            },
        });

        if (authError) {
            return { error: authError };
        }

        // Create profile in users table
        if (authData.user) {
            const { error: profileError } = await supabase.from('users').insert({
                auth_id: authData.user.id,
                email,
                name: userData.name || '',
                phone: userData.phone || '',
                role: userData.role || 'patient',
                preferred_language: userData.language || 'en',
                created_at: new Date().toISOString(),
            });

            if (profileError) {
                console.error('Profile creation error:', profileError);
            }
        }

        return { data: authData };
    },

    // Sign in with email/password
    async signIn(email, password) {
        const supabase = getSupabase();
        if (!supabase) {
            // Fall back to demo mode
            return this.demoSignIn(email, password);
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error };
        }

        // Get user profile
        const profile = await this.getCurrentUser();
        return { data: { ...data, profile } };
    },

    // Demo sign in (when Supabase not configured)
    demoSignIn(email, _password) {
        void _password; // Password validation is done via HMS.auth in demo mode
        // Check against demo users
        const demoUsers = {
            'pratik.sajnani@gmail.com': { role: 'admin', name: 'Pratik Sajnani' },
            'drsajnani@gmail.com': { role: 'doctor', name: 'Dr. Ashok Sajnani', doctor: 'ashok' },
            'sunita.sajnani9@gmail.com': {
                role: 'doctor',
                name: 'Dr. Sunita Sajnani',
                doctor: 'sunita',
            },
            'reception@adinathhealth.com': { role: 'staff', name: 'Poonam' },
        };

        const user = demoUsers[email.toLowerCase()];
        if (user) {
            // Store in localStorage for demo
            localStorage.setItem(
                'hms_demo_user',
                JSON.stringify({
                    email,
                    ...user,
                    isDemo: true,
                })
            );
            return {
                data: {
                    user: { email, ...user },
                    isDemo: true,
                },
            };
        }

        return { error: { message: 'Invalid email or password' } };
    },

    // Sign out
    async signOut() {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }

        // Clear demo mode too
        localStorage.removeItem('hms_demo_user');
        localStorage.removeItem('hms_logged_in');
        localStorage.removeItem('hms_role');

        window.location.assign('index.html');
    },

    // Send OTP to phone (for patient login)
    async sendPhoneOTP(phone) {
        const supabase = getSupabase();
        if (!supabase) {
            return { error: { message: 'Supabase not configured for OTP' } };
        }

        // Supabase phone auth requires Twilio setup
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone.startsWith('+') ? phone : `+91${phone}`,
        });

        return { data, error };
    },

    // Verify phone OTP
    async verifyPhoneOTP(phone, token) {
        const supabase = getSupabase();
        if (!supabase) {
            return { error: { message: 'Supabase not configured' } };
        }

        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone.startsWith('+') ? phone : `+91${phone}`,
            token,
            type: 'sms',
        });

        return { data, error };
    },

    // Check if user is authenticated
    async isAuthenticated() {
        // Check Supabase session
        const session = await this.getSession();
        if (session) {
            return true;
        }

        // Check demo mode
        const demoUser = localStorage.getItem('hms_demo_user');
        return !!demoUser;
    },

    // Get user role
    async getUserRole() {
        // Try Supabase first
        const user = await this.getCurrentUser();
        if (user) {
            return user.role;
        }

        // Check demo mode
        const demoUser = localStorage.getItem('hms_demo_user');
        if (demoUser) {
            return JSON.parse(demoUser).role;
        }

        return null;
    },
};

// ============================================
// DATABASE MODULE
// ============================================
const SupabaseDB = {
    // Generic fetch
    async fetch(table, filters = {}) {
        const supabase = getSupabase();
        if (!supabase) {
            console.warn(`DB not configured. Using localStorage for ${table}`);
            return JSON.parse(localStorage.getItem(`hms_${table}`) || '[]');
        }

        let query = supabase.from(table).select('*');

        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        const { data, error } = await query;
        if (error) {
            console.error(`Error fetching ${table}:`, error);
            return [];
        }
        return data || [];
    },

    // Insert
    async insert(table, data) {
        const supabase = getSupabase();
        if (!supabase) {
            // Fallback to localStorage
            const existing = JSON.parse(localStorage.getItem(`hms_${table}`) || '[]');
            data.id = `LOCAL_${Date.now()}`;
            existing.push(data);
            localStorage.setItem(`hms_${table}`, JSON.stringify(existing));
            return { data };
        }

        const { data: result, error } = await supabase.from(table).insert(data).select().single();

        if (error) {
            return { error };
        }
        return { data: result };
    },

    // Update
    async update(table, id, data) {
        const supabase = getSupabase();
        if (!supabase) {
            const existing = JSON.parse(localStorage.getItem(`hms_${table}`) || '[]');
            const index = existing.findIndex((item) => item.id === id);
            if (index !== -1) {
                existing[index] = { ...existing[index], ...data };
                localStorage.setItem(`hms_${table}`, JSON.stringify(existing));
            }
            return { data: existing[index] };
        }

        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error };
        }
        return { data: result };
    },

    // Delete
    async delete(table, id) {
        const supabase = getSupabase();
        if (!supabase) {
            const existing = JSON.parse(localStorage.getItem(`hms_${table}`) || '[]');
            const filtered = existing.filter((item) => item.id !== id);
            localStorage.setItem(`hms_${table}`, JSON.stringify(filtered));
            return { success: true };
        }

        const { error } = await supabase.from(table).delete().eq('id', id);

        if (error) {
            return { error };
        }
        return { success: true };
    },
};

// ============================================
// APPOINTMENTS MODULE
// ============================================
const SupabaseAppointments = {
    async create(appointmentData) {
        return SupabaseDB.insert('appointments', {
            ...appointmentData,
            status: 'pending',
            created_at: new Date().toISOString(),
        });
    },

    async getByDoctor(doctorId, date = null) {
        const filters = { doctor_id: doctorId };
        if (date) {
            filters.date = date;
        }
        return SupabaseDB.fetch('appointments', filters);
    },

    async getByPatient(patientId) {
        return SupabaseDB.fetch('appointments', { patient_id: patientId });
    },

    async updateStatus(id, status) {
        return SupabaseDB.update('appointments', id, { status });
    },
};

// ============================================
// PATIENTS MODULE
// ============================================
const SupabasePatients = {
    async create(patientData) {
        return SupabaseDB.insert('patients', {
            ...patientData,
            created_at: new Date().toISOString(),
        });
    },

    async getById(id) {
        const patients = await SupabaseDB.fetch('patients', { id });
        return patients[0] || null;
    },

    async search(query) {
        const supabase = getSupabase();
        if (!supabase) {
            const all = JSON.parse(localStorage.getItem('hms_patients') || '[]');
            return all.filter(
                (p) =>
                    p.name?.toLowerCase().includes(query.toLowerCase()) || p.phone?.includes(query)
            );
        }

        const { data } = await supabase
            .from('patients')
            .select('*')
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%`);

        return data || [];
    },
};

// Export for use in browser
if (typeof window !== 'undefined') {
    window.SupabaseAuth = SupabaseAuth;
    window.SupabaseDB = SupabaseDB;
    window.SupabaseAppointments = SupabaseAppointments;
    window.SupabasePatients = SupabasePatients;

    // Log mode on load
    console.log(
        SupabaseAuth.isConfigured()
            ? '✅ Supabase configured - using real auth'
            : '⚠️ Supabase not configured - using demo mode'
    );
}

// Export for use in Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        SupabaseAuth,
        SupabaseDB,
        SupabaseAppointments,
        SupabasePatients,
        isDemoMode: () => !SupabaseAuth.isConfigured(),
        utils: {
            validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            generateId: () =>
                `id_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`,
        },
    };
}
