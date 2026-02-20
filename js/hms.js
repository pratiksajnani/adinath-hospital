// ============================================
// ADINATH HOSPITAL MANAGEMENT SYSTEM (HMS)
// Supabase-backed data layer
// ============================================
const HMS = {
    _supabase: null,

    // Initialize Supabase client
    async init() {
        if (this._supabase) {
            return this._supabase;
        }

        if (typeof supabase !== 'undefined' && supabase.createClient) {
            this._supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        } else if (typeof window !== 'undefined' && window.supabase?.createClient) {
            this._supabase = window.supabase.createClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_ANON_KEY
            );
        } else {
            console.error('HMS: Supabase client library not loaded');
        }
        return this._supabase;
    },

    // Get Supabase client (lazy init)
    _db() {
        if (!this._supabase) {
            throw new Error('HMS not initialized. Call await HMS.init() first.');
        }
        return this._supabase;
    },

    // ============================================
    // AUTHENTICATION (wraps Supabase Auth)
    // ============================================
    auth: {
        async signIn(email, password) {
            const { data, error } = await HMS._db().auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                return { error: error.message };
            }
            return { success: true, user: data.user, session: data.session };
        },

        async signInWithOAuth(provider, options = {}) {
            const { data, error } = await HMS._db().auth.signInWithOAuth({
                provider,
                options,
            });
            if (error) {
                return { error: error.message };
            }
            return { success: true, data };
        },

        async signInWithOtp(params) {
            const { data, error } = await HMS._db().auth.signInWithOtp(params);
            if (error) {
                return { error: error.message };
            }
            return { success: true, data };
        },

        async verifyOtp(params) {
            const { data, error } = await HMS._db().auth.verifyOtp(params);
            if (error) {
                return { error: error.message };
            }
            return { success: true, user: data.user, session: data.session };
        },

        async signOut() {
            const { error } = await HMS._db().auth.signOut();
            if (error) {
                console.error('Sign out error:', error.message);
            }
        },

        async getSession() {
            const {
                data: { session },
            } = await HMS._db().auth.getSession();
            return session;
        },

        async getUser() {
            const {
                data: { user },
            } = await HMS._db().auth.getUser();
            return user;
        },

        async getRole() {
            const session = await this.getSession();
            if (!session) {
                return null;
            }
            const { data } = await HMS._db()
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
            return data?.role || null;
        },

        async getProfile() {
            const session = await this.getSession();
            if (!session) {
                return null;
            }
            const { data } = await HMS._db()
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            return data;
        },

        async isLoggedIn() {
            const session = await this.getSession();
            return !!session;
        },

        onAuthStateChange(callback) {
            return HMS._db().auth.onAuthStateChange(callback);
        },
    },

    // ============================================
    // USERS / PROFILES
    // ============================================
    users: {
        async getAll() {
            const { data, error } = await HMS._db()
                .from('profiles')
                .select('*')
                .order('created_at');
            if (error) {
                console.error('HMS.users.getAll error:', error.message);
                return [];
            }
            return data;
        },

        async get(id) {
            const { data } = await HMS._db().from('profiles').select('*').eq('id', id).single();
            return data;
        },

        async getByEmail(email) {
            const { data } = await HMS._db()
                .from('profiles')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();
            return data;
        },

        async getStaff() {
            const { data, error } = await HMS._db()
                .from('profiles')
                .select('*')
                .not('role', 'in', '("doctor","admin")');
            if (error) {
                return [];
            }
            return data;
        },

        async add(user) {
            const existing = await this.getByEmail(user.email);
            if (existing) {
                return { error: 'Email already registered' };
            }

            const { data, error } = await HMS._db()
                .from('profiles')
                .insert({
                    id: user.id, // Must match auth.users.id
                    email: user.email,
                    name: user.name,
                    name_gu: user.nameGu,
                    name_hi: user.nameHi,
                    phone: user.phone,
                    role: user.role || 'patient',
                    photo_url: user.photo || user.photo_url,
                    department: user.department,
                    specialty: user.specialty,
                    specialty_gu: user.specialtyGu,
                    specialty_hi: user.specialtyHi,
                    permissions: user.permissions || [],
                    preferred_language: user.preferredLanguage || 'en',
                    active: user.active !== false,
                })
                .select()
                .single();
            if (error) {
                return { error: error.message };
            }
            return data;
        },

        async update(id, updates) {
            const { data, error } = await HMS._db()
                .from('profiles')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                return null;
            }
            return data;
        },

        async delete(id) {
            await HMS._db().from('profiles').delete().eq('id', id);
        },

        async toggleActive(id) {
            const user = await this.get(id);
            if (user) {
                await this.update(id, { active: !user.active });
            }
        },
    },

    // ============================================
    // PATIENTS
    // ============================================
    patients: {
        async getAll() {
            const { data, error } = await HMS._db()
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('HMS.patients.getAll error:', error.message);
                return [];
            }
            return data;
        },

        async get(id) {
            const { data } = await HMS._db().from('patients').select('*').eq('id', id).single();
            return data;
        },

        async add(patient) {
            const { data, error } = await HMS._db()
                .from('patients')
                .insert({
                    name: patient.name,
                    phone: patient.phone,
                    email: patient.email,
                    age: patient.age,
                    gender: patient.gender,
                    address: patient.address,
                    blood_group: patient.bloodGroup || patient.blood_group,
                    medical_history: patient.medicalHistory || patient.medical_history,
                    allergies: patient.allergies,
                    emergency_contact: patient.emergencyContact || patient.emergency_contact,
                    preferred_language:
                        patient.preferredLanguage || patient.preferred_language || 'hi',
                })
                .select()
                .single();
            if (error) {
                console.error('HMS.patients.add error:', error.message);
                return { error: error.message };
            }
            return data;
        },

        async update(id, updates) {
            const { data, error } = await HMS._db()
                .from('patients')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                return null;
            }
            return data;
        },

        async search(query) {
            const lower = query.toLowerCase();
            const { data, error } = await HMS._db()
                .from('patients')
                .select('*')
                .or(`name.ilike.%${lower}%,phone.ilike.%${lower}%`);
            if (error) {
                return [];
            }
            return data;
        },

        async delete(id) {
            await HMS._db().from('patients').delete().eq('id', id);
        },
    },

    // ============================================
    // APPOINTMENTS
    // ============================================
    appointments: {
        async getAll() {
            const { data, error } = await HMS._db()
                .from('appointments')
                .select('*')
                .order('date', { ascending: false });
            if (error) {
                console.error('HMS.appointments.getAll error:', error.message);
                return [];
            }
            return data;
        },

        async get(id) {
            const { data } = await HMS._db().from('appointments').select('*').eq('id', id).single();
            return data;
        },

        async getByDate(date) {
            const { data, error } = await HMS._db()
                .from('appointments')
                .select('*')
                .eq('date', date)
                .order('time');
            if (error) {
                return [];
            }
            return data;
        },

        async getByDoctor(doctor, date) {
            let query = HMS._db().from('appointments').select('*').eq('doctor_id', doctor);
            if (date) {
                query = query.eq('date', date);
            }
            const { data, error } = await query.order('time');
            if (error) {
                return [];
            }
            return data;
        },

        async getByPatient(patientId) {
            const { data, error } = await HMS._db()
                .from('appointments')
                .select('*')
                .eq('patient_id', patientId)
                .order('date', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async add(appointment) {
            const { data, error } = await HMS._db()
                .from('appointments')
                .insert({
                    patient_id: appointment.patientId || appointment.patient_id,
                    patient_name:
                        appointment.patientName || appointment.patient_name || appointment.name,
                    patient_phone:
                        appointment.patientPhone || appointment.patient_phone || appointment.phone,
                    doctor_id: appointment.doctor || appointment.doctor_id,
                    date: appointment.date,
                    time: appointment.time,
                    reason: appointment.reason,
                    notes: appointment.notes,
                    status: 'pending',
                })
                .select()
                .single();
            if (error) {
                console.error('HMS.appointments.add error:', error.message);
                return { error: error.message };
            }
            return data;
        },

        async updateStatus(id, status, notes = '') {
            const updates = { status };
            if (notes) {
                updates.notes = notes;
            }
            const { error } = await HMS._db().from('appointments').update(updates).eq('id', id);
            if (error) {
                console.error('HMS.appointments.updateStatus error:', error.message);
            }
        },

        async getTodayStats() {
            const today = new Date().toISOString().split('T')[0];
            const appts = await this.getByDate(today);
            return {
                total: appts.length,
                pending: appts.filter((a) => a.status === 'pending').length,
                confirmed: appts.filter((a) => a.status === 'confirmed').length,
                waiting: appts.filter((a) => a.status === 'waiting').length,
                completed: appts.filter((a) => a.status === 'completed').length,
                cancelled: appts.filter((a) => a.status === 'cancelled').length,
            };
        },
    },

    // ============================================
    // PRESCRIPTIONS
    // ============================================
    prescriptions: {
        async getAll() {
            const { data, error } = await HMS._db()
                .from('prescriptions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async getByPatient(patientId) {
            const { data, error } = await HMS._db()
                .from('prescriptions')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async add(rx) {
            const { data, error } = await HMS._db()
                .from('prescriptions')
                .insert({
                    patient_id: rx.patientId || rx.patient_id,
                    doctor_id: rx.doctorId || rx.doctor_id || rx.doctor,
                    appointment_id: rx.appointmentId || rx.appointment_id,
                    diagnosis: rx.diagnosis,
                    medicines: rx.medicines || [],
                    advice: rx.advice,
                    follow_up_date: rx.followUpDate || rx.follow_up_date,
                })
                .select()
                .single();
            if (error) {
                console.error('HMS.prescriptions.add error:', error.message);
                return { error: error.message };
            }
            return data;
        },
    },

    // ============================================
    // INVENTORY
    // ============================================
    inventory: {
        async getAll() {
            const { data, error } = await HMS._db().from('inventory').select('*').order('name');
            if (error) {
                return [];
            }
            return data;
        },

        async get(id) {
            const { data } = await HMS._db().from('inventory').select('*').eq('id', id).single();
            return data;
        },

        async getLowStock() {
            const items = await this.getAll();
            return items.filter((i) => i.stock <= i.reorder_level);
        },

        async updateStock(id, quantity, operation = 'subtract') {
            const item = await this.get(id);
            if (!item) {
                return;
            }
            const newStock =
                operation === 'subtract' ? item.stock - quantity : item.stock + quantity;
            await HMS._db().from('inventory').update({ stock: newStock }).eq('id', id);
        },

        async add(item) {
            const { data, error } = await HMS._db()
                .from('inventory')
                .insert({
                    name: item.name,
                    category: item.category,
                    stock: item.stock || 0,
                    unit: item.unit,
                    price: item.price,
                    expiry_date: item.expiryDate || item.expiry_date,
                    reorder_level: item.reorderLevel || item.reorder_level || 10,
                    supplier: item.supplier,
                })
                .select()
                .single();
            if (error) {
                return { error: error.message };
            }
            return data;
        },
    },

    // ============================================
    // SALES
    // ============================================
    sales: {
        async getAll() {
            const { data, error } = await HMS._db()
                .from('sales')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async getByDate(date) {
            const { data, error } = await HMS._db().from('sales').select('*').eq('date', date);
            if (error) {
                return [];
            }
            return data;
        },

        async add(sale) {
            const { data, error } = await HMS._db()
                .from('sales')
                .insert({
                    patient_name: sale.patientName || sale.patient_name,
                    items: sale.items || [],
                    total: sale.total,
                    payment_method: sale.paymentMethod || sale.payment_method || 'cash',
                    date: sale.date || new Date().toISOString().split('T')[0],
                    time: sale.time || new Date().toLocaleTimeString(),
                })
                .select()
                .single();
            if (error) {
                return { error: error.message };
            }
            return data;
        },

        async getTodayTotal() {
            const today = new Date().toISOString().split('T')[0];
            const todaySales = await this.getByDate(today);
            return todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
        },
    },

    // ============================================
    // QUEUE
    // ============================================
    queue: {
        async getAll() {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await HMS._db()
                .from('queue')
                .select('*')
                .eq('date', today)
                .order('queue_number');
            if (error) {
                return [];
            }
            return data;
        },

        async add(entry) {
            const existing = await this.getAll();
            const queueNumber = existing.length + 1;

            const { data, error } = await HMS._db()
                .from('queue')
                .insert({
                    appointment_id: entry.appointmentId || entry.appointment_id,
                    patient_name: entry.patientName || entry.patient_name || entry.name,
                    patient_phone: entry.patientPhone || entry.patient_phone || entry.phone,
                    doctor_id: entry.doctorId || entry.doctor_id || entry.doctor,
                    queue_number: queueNumber,
                    status: 'waiting',
                })
                .select()
                .single();
            if (error) {
                return { error: error.message };
            }
            return data;
        },

        async remove(id) {
            await HMS._db().from('queue').delete().eq('id', id);
        },

        async clear() {
            const today = new Date().toISOString().split('T')[0];
            await HMS._db().from('queue').delete().eq('date', today);
        },
    },

    // ============================================
    // PATIENT LINKS (QR-code registration links)
    // ============================================
    patientLinks: {
        async generate(patientData, staffId) {
            const token = HMS.utils.generateToken();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await HMS._db()
                .from('patient_links')
                .insert({
                    token,
                    patient_phone: patientData.phone,
                    patient_name: patientData.name,
                    created_by: staffId,
                    expires_at: expiresAt,
                })
                .select()
                .single();

            if (error) {
                return { error: error.message };
            }

            const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
            return {
                token: data.token,
                url: `${baseUrl}patient-signup.html?token=${data.token}`,
                shortUrl: `adinath.link/${data.token.substring(0, 8)}`,
            };
        },

        async getAll() {
            const { data, error } = await HMS._db()
                .from('patient_links')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async validate(token) {
            const { data: link } = await HMS._db()
                .from('patient_links')
                .select('*')
                .eq('token', token)
                .single();

            if (!link) {
                return { valid: false, error: 'Invalid link' };
            }
            if (link.used) {
                return { valid: false, error: 'Link already used' };
            }
            if (new Date(link.expires_at) < new Date()) {
                return { valid: false, error: 'Link expired' };
            }
            return { valid: true, link };
        },

        async markUsed(token) {
            await HMS._db()
                .from('patient_links')
                .update({ used: true, used_at: new Date().toISOString() })
                .eq('token', token);
        },
    },

    // ============================================
    // TOKENS (onboarding invitation tokens)
    // ============================================
    tokens: {
        generateUUID() {
            if (crypto && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        },

        async getAll() {
            const { data, error } = await HMS._db()
                .from('tokens')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async create(params) {
            const { targetEmail, targetRole, purpose, expiresInHours = 72, createdBy } = params;
            const tokenValue = this.generateUUID();

            const { data, error } = await HMS._db()
                .from('tokens')
                .insert({
                    token: tokenValue,
                    target_email: targetEmail,
                    target_role: targetRole,
                    purpose: purpose || 'registration',
                    created_by: createdBy || 'system',
                    expires_at: new Date(
                        Date.now() + expiresInHours * 60 * 60 * 1000
                    ).toISOString(),
                })
                .select()
                .single();

            if (error) {
                return { error: error.message };
            }
            return data;
        },

        async validate(tokenString) {
            const { data: token } = await HMS._db()
                .from('tokens')
                .select('*')
                .eq('token', tokenString)
                .single();

            if (!token) {
                return { valid: false, error: 'Token not found' };
            }
            if (token.used) {
                return { valid: false, error: 'Token already used', token };
            }
            if (new Date(token.expires_at) < new Date()) {
                return { valid: false, error: 'Token expired', token };
            }
            return { valid: true, token };
        },

        async markUsed(tokenString) {
            const { error } = await HMS._db()
                .from('tokens')
                .update({ used: true, used_at: new Date().toISOString() })
                .eq('token', tokenString);
            return !error;
        },

        async getByEmail(email) {
            const { data, error } = await HMS._db()
                .from('tokens')
                .select('*')
                .eq('target_email', email)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString());
            if (error) {
                return [];
            }
            return data;
        },

        async generateLink(params) {
            const { targetEmail, targetRole, baseUrl } = params;

            const existingTokens = await this.getByEmail(targetEmail);
            if (existingTokens.length > 0) {
                const existing = existingTokens[0];
                return {
                    token: existing.token,
                    link: `${baseUrl || window.location.origin}/onboard/${targetRole}.html?token=${existing.token}`,
                    expiresAt: existing.expires_at,
                    isExisting: true,
                };
            }

            const token = await this.create(params);
            if (token.error) {
                return token;
            }
            return {
                token: token.token,
                link: `${baseUrl || window.location.origin}/onboard/${targetRole}.html?token=${token.token}`,
                expiresAt: token.expires_at,
                isExisting: false,
            };
        },
    },

    // ============================================
    // FEEDBACK
    // ============================================
    feedback: {
        async getAll() {
            const { data, error } = await HMS._db()
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                return [];
            }
            return data;
        },

        async add(fb) {
            const { data, error } = await HMS._db()
                .from('feedback')
                .insert({
                    role: fb.role,
                    page: fb.page,
                    type: fb.type,
                    priority: fb.priority || 'medium',
                    description: fb.description,
                    name: fb.name || 'Anonymous',
                    user_agent: fb.userAgent || fb.user_agent,
                    screen_size: fb.screenSize || fb.screen_size,
                })
                .select()
                .single();
            if (error) {
                return { error: error.message };
            }
            return data;
        },

        async getByRole(role) {
            const { data, error } = await HMS._db().from('feedback').select('*').eq('role', role);
            if (error) {
                return [];
            }
            return data;
        },

        async getByStatus(status) {
            const { data, error } = await HMS._db()
                .from('feedback')
                .select('*')
                .eq('status', status);
            if (error) {
                return [];
            }
            return data;
        },

        async getOpen() {
            const { data, error } = await HMS._db()
                .from('feedback')
                .select('*')
                .in('status', ['open', 'in_progress']);
            if (error) {
                return [];
            }
            return data;
        },

        async updateStatus(id, status, note = '') {
            const updates = { status };
            if (note) {
                updates.resolution_note = note;
            }
            await HMS._db().from('feedback').update(updates).eq('id', id);
        },

        async stats() {
            const all = await this.getAll();
            return {
                total: all.length,
                open: all.filter((f) => f.status === 'open').length,
                inProgress: all.filter((f) => f.status === 'in_progress').length,
                resolved: all.filter((f) => f.status === 'resolved').length,
                byRole: {
                    patient: all.filter((f) => f.role === 'patient').length,
                    staff: all.filter((f) => f.role === 'staff').length,
                    doctor: all.filter((f) => f.role === 'doctor').length,
                    admin: all.filter((f) => f.role === 'admin').length,
                },
                byType: {
                    bug: all.filter((f) => f.type === 'bug').length,
                    feature: all.filter((f) => f.type === 'feature').length,
                    question: all.filter((f) => f.type === 'question').length,
                    other: all.filter((f) => f.type === 'other').length,
                },
            };
        },
    },

    // ============================================
    // NOTIFICATIONS (SMS stubs)
    // ============================================
    notifications: {
        sendSMS(phone, message, language = 'en') {
            console.log(`📱 SMS to ${phone} [${language}]: ${message}`);
            return { success: true, message: 'SMS queued', preview: message };
        },
    },

    // ============================================
    // SMS TEMPLATES (static data, no DB needed)
    // ============================================
    smsTemplates: {
        templates: {
            appointment_confirmation: {
                en: 'Dear {name}, your appointment with {doctor} is confirmed for {date} at {time}. Adinath Hospital, Shahibaug. Call: 9925450425',
                hi: 'प्रिय {name}, {doctor} के साथ आपका अपॉइंटमेंट {date} को {time} बजे कन्फर्म है। आदिनाथ हॉस्पिटल, शाहीबाग। कॉल: 9925450425',
                gu: 'પ્રિય {name}, {doctor} સાથે તમારી એપોઇન્ટમેન્ટ {date} ના રોજ {time} વાગ્યે કન્ફર્મ છે। આદિનાથ હોસ્પિટલ, શાહીબાગ. કૉલ: 9925450425',
            },
            appointment_reminder: {
                en: 'Reminder: Your appointment with {doctor} is tomorrow at {time}. Please arrive 15 mins early. Adinath Hospital.',
                hi: 'रिमाइंडर: {doctor} के साथ आपका अपॉइंटमेंट कल {time} बजे है। कृपया 15 मिनट पहले आएं। आदिनाथ हॉस्पिटल।',
                gu: 'રીમાઇન્ડર: {doctor} સાથે તમારી એપોઇન્ટમેન્ટ આવતીકાલે {time} વાગ્યે છે। કૃપા કરીને 15 મિનિટ વહેલા આવો. આદિનાથ હોસ્પિટલ.',
            },
            prescription_ready: {
                en: 'Your prescription is ready at Adinath Hospital pharmacy. Show this SMS to collect. Ref: {rxId}',
                hi: 'आपका प्रिस्क्रिप्शन आदिनाथ हॉस्पिटल फार्मेसी में तैयार है। लेने के लिए यह SMS दिखाएं। रेफ: {rxId}',
                gu: 'તમારું પ્રિસ્ક્રિપ્શન આદિનાથ હોસ્પિટલ ફાર્મસીમાં તૈયાર છે। લેવા માટે આ SMS બતાવો. રેફ: {rxId}',
            },
            patient_signup_link: {
                en: 'Welcome to Adinath Hospital! Create your patient account here: {link} - Dr. {doctor}',
                hi: 'आदिनाथ हॉस्पिटल में आपका स्वागत है! यहां अपना पेशेंट अकाउंट बनाएं: {link} - डॉ. {doctor}',
                gu: 'આદિનાથ હોસ્પિટલમાં આપનું સ્વાગત છે! અહીં તમારું પેશન્ટ એકાઉન્ટ બનાવો: {link} - ડૉ. {doctor}',
            },
            medicine_reminder: {
                en: 'Time to take your medicine: {medicine}. Dosage: {dosage}. Stay healthy! - Adinath Hospital',
                hi: 'दवाई लेने का समय: {medicine}। खुराक: {dosage}। स्वस्थ रहें! - आदिनाथ हॉस्पिटल',
                gu: 'દવા લેવાનો સમય: {medicine}. ડોઝ: {dosage}. સ્વસ્થ રહો! - આદિનાથ હોસ્પિટલ',
            },
            followup_reminder: {
                en: "It's time for your follow-up visit. Please book at: {link} or call 9925450425. - Dr. {doctor}",
                hi: 'आपके फॉलो-अप विजिट का समय है। कृपया यहां बुक करें: {link} या कॉल करें 9925450425। - डॉ. {doctor}',
                gu: 'તમારી ફોલો-અપ મુલાકાતનો સમય છે. કૃપા કરીને અહીં બુક કરો: {link} અથવા કૉલ કરો 9925450425. - ડૉ. {doctor}',
            },
            yoga_class: {
                en: 'Join our yoga class tomorrow at {time}. Bring a mat and wear comfortable clothes. - Dr. Sunita, Adinath Hospital',
                hi: 'कल {time} बजे हमारी योग क्लास में शामिल हों। मैट लाएं और आरामदायक कपड़े पहनें। - डॉ. सुनीता, आदिनाथ हॉस्पिटल',
                gu: 'આવતીકાલે {time} વાગ્યે અમારી યોગ ક્લાસમાં જોડાઓ. મેટ લાવો અને આરામદાયક કપડાં પહેરો. - ડૉ. સુનિતા, આદિનાથ હોસ્પિટલ',
            },
            health_tip: {
                en: '{tip} - Stay healthy! Dr. {doctor}, Adinath Hospital',
                hi: '{tip} - स्वस्थ रहें! डॉ. {doctor}, आदिनाथ हॉस्पिटल',
                gu: '{tip} - સ્વસ્થ રહો! ડૉ. {doctor}, આદિનાથ હોસ્પિટલ',
            },
        },

        generate(templateKey, data, language = 'en') {
            let template =
                this.templates[templateKey]?.[language] || this.templates[templateKey]?.['en'];
            if (!template) {
                return null;
            }

            Object.keys(data).forEach((key) => {
                // eslint-disable-next-line security/detect-non-literal-regexp
                template = template.replace(new RegExp(`{${key}}`, 'g'), data[key]);
            });
            return template;
        },
    },

    // ============================================
    // UTILITY FUNCTIONS (pure, no DB)
    // ============================================
    utils: {
        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        },
        formatCurrency(amount) {
            return `₹${Number(amount).toLocaleString('en-IN')}`;
        },
        generateId(prefix) {
            return prefix + Date.now().toString(36).toUpperCase();
        },
        generateToken() {
            return Math.random().toString(36).substring(2) + Date.now().toString(36);
        },
    },
};

// ============================================
// FEEDBACK WIDGET - uses safe DOM methods
// ============================================
window.initFeedbackWidget = function initFeedbackWidget(role = 'visitor') {
    const btn = document.createElement('button');
    btn.textContent = '💬 Feedback';
    btn.id = 'feedback-btn';
    btn.style.cssText =
        'position: fixed; bottom: 80px; left: 20px; z-index: 9999; background: #236b48; color: white; border: none; padding: 12px 20px; border-radius: 25px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';

    // Build feedback modal using safe DOM methods
    const modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.style.cssText =
        'display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; justify-content: center; align-items: center;';

    const card = document.createElement('div');
    card.style.cssText =
        'background: white; border-radius: 16px; padding: 30px; max-width: 450px; width: 90%; max-height: 80vh; overflow-y: auto;';

    const form = document.createElement('form');
    form.id = 'feedback-form';

    // Hidden inputs
    const roleInput = Object.assign(document.createElement('input'), {
        type: 'hidden',
        id: 'fb-role',
        value: role,
    });
    const pageInput = Object.assign(document.createElement('input'), {
        type: 'hidden',
        id: 'fb-page',
        value: window.location.pathname,
    });
    form.append(roleInput, pageInput);

    // Helper to create form groups
    const makeGroup = (labelText, inputEl) => {
        const group = document.createElement('div');
        group.style.marginBottom = '15px';
        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.cssText = 'display: block; margin-bottom: 5px; font-weight: 500;';
        inputEl.style.cssText =
            'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;';
        group.append(label, inputEl);
        return group;
    };

    const typeSelect = Object.assign(document.createElement('select'), {
        id: 'fb-type',
        required: true,
    });
    [
        'bug:🐛 Bug / Problem',
        'feature:💡 Feature Request',
        'question:❓ Question',
        'other:📝 Other',
    ].forEach((opt) => {
        const [val, text] = opt.split(':');
        typeSelect.append(
            Object.assign(document.createElement('option'), { value: val, textContent: text })
        );
    });

    const prioritySelect = Object.assign(document.createElement('select'), { id: 'fb-priority' });
    ['low:🟢 Low', 'medium:🟡 Medium', 'high:🔴 High'].forEach((opt) => {
        const [val, text] = opt.split(':');
        const option = Object.assign(document.createElement('option'), {
            value: val,
            textContent: text,
        });
        if (val === 'medium') {
            option.selected = true;
        }
        prioritySelect.append(option);
    });

    const descArea = Object.assign(document.createElement('textarea'), {
        id: 'fb-description',
        required: true,
        rows: 4,
        placeholder: 'Describe the issue or suggestion...',
    });
    descArea.style.resize = 'vertical';

    const nameInput = Object.assign(document.createElement('input'), {
        type: 'text',
        id: 'fb-name',
        placeholder: 'Your name',
    });

    form.append(
        makeGroup('Type', typeSelect),
        makeGroup('Priority', prioritySelect),
        makeGroup('Description *', descArea),
        makeGroup('Your Name (optional)', nameInput)
    );

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit Feedback';
    submitBtn.style.cssText =
        'width: 100%; padding: 12px; background: #236b48; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;';
    form.append(submitBtn);

    // Header with close button
    const header = document.createElement('div');
    header.style.cssText =
        'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;';
    const title = document.createElement('h3');
    title.textContent = '💬 Send Feedback';
    title.style.cssText = 'margin: 0; color: #236b48;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'background: none; border: none; font-size: 24px; cursor: pointer;';
    closeBtn.onclick = () => closeFeedbackModal();
    header.append(title, closeBtn);

    const footer = document.createElement('p');
    footer.textContent = 'Feedback is sent to the admin for review.';
    footer.style.cssText = 'text-align: center; margin-top: 15px; font-size: 12px; color: #666;';

    card.append(header, form, footer);
    modal.append(card);
    document.body.append(btn, modal);

    btn.onclick = () => {
        modal.style.display = 'flex';
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeFeedbackModal();
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const feedback = {
            role: document.getElementById('fb-role').value,
            page: document.getElementById('fb-page').value,
            type: document.getElementById('fb-type').value,
            priority: document.getElementById('fb-priority').value,
            description: document.getElementById('fb-description').value,
            name: document.getElementById('fb-name').value || 'Anonymous',
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
        };

        await HMS.feedback.add(feedback);
        // eslint-disable-next-line no-alert
        alert('✅ Thank you! Your feedback has been submitted.');
        closeFeedbackModal();
        form.reset();
    };
};

function closeFeedbackModal() {
    document.getElementById('feedback-modal').style.display = 'none';
}

// Export for Node.js/Jest testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HMS;
}
