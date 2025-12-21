// ============================================
// ADINATH HOSPITAL MANAGEMENT SYSTEM (HMS)
// Client-side data management with localStorage
// ============================================

const HMS = {
    // Initialize default data
    init() {
        if (!localStorage.getItem('hms_initialized')) {
            this.seedData();
            localStorage.setItem('hms_initialized', 'true');
        }
    },

    // Seed demo data
    seedData() {
        // Default users (doctors, admin, staff)
        const users = [
            // Site Admin
            {
                id: 'U001',
                email: 'pratik.sajnani@gmail.com',
                password: 'admin123', // In production, this would be hashed
                name: 'Pratik Sajnani',
                role: 'admin',
                permissions: ['all'],
                photo: 'https://avatars.githubusercontent.com/u/7103539',
                phone: '9925450425',
                preferredLanguage: 'en',
                active: true,
                createdAt: '2025-01-01'
            },
            // Doctors
            {
                id: 'U002',
                email: 'drsajnani@gmail.com',
                password: 'doctor123',
                name: 'Dr. Ashok Sajnani',
                nameGu: 'ડૉ. અશોક સજનાની',
                nameHi: 'डॉ. अशोक सजनानी',
                role: 'doctor',
                specialty: 'Orthopedic Surgery',
                specialtyGu: 'હાડકાની સર્જરી',
                specialtyHi: 'हड्डी रोग विशेषज्ञ',
                permissions: ['patients', 'appointments', 'prescriptions', 'reports', 'content', 'images'],
                photo: 'images/1723730611450.jpeg',
                phone: '9925450425',
                linkedIn: 'https://www.linkedin.com/in/ashok-sajnani-11937322/',
                experience: '35+ years',
                preferredLanguage: 'en',
                notifyViaSMS: true,
                notifyViaWhatsApp: true,
                active: true,
                createdAt: '2025-01-01'
            },
            {
                id: 'U003',
                email: 'sunita.sajnani9@gmail.com',
                password: 'doctor123',
                name: 'Dr. Sunita Sajnani',
                nameGu: 'ડૉ. સુનિતા સજનાની',
                nameHi: 'डॉ. सुनीता सजनानी',
                role: 'doctor',
                specialty: 'Obstetrics & Gynecology',
                specialtyGu: 'પ્રસૂતિ અને સ્ત્રીરોગ',
                specialtyHi: 'प्रसूति एवं स्त्री रोग',
                permissions: ['patients', 'appointments', 'prescriptions', 'reports', 'content', 'images'],
                photo: 'images/1516926564161.jpeg',
                phone: '9925450425',
                linkedIn: 'https://www.linkedin.com/in/dr-sunita-sajnani-6b81b384/',
                experience: '30+ years',
                preferredLanguage: 'en',
                notifyViaSMS: true,
                notifyViaWhatsApp: true,
                active: true,
                createdAt: '2025-01-01'
            },
            // Staff
            {
                id: 'U004',
                email: 'nurse1@adinathhospital.com',
                password: 'staff123',
                name: 'Kavita Sharma',
                nameGu: 'કવિતા શર્મા',
                nameHi: 'कविता शर्मा',
                role: 'nurse',
                department: 'General',
                permissions: ['patients', 'appointments', 'send_patient_link'],
                photo: '',
                phone: '9876543001',
                preferredLanguage: 'gu',
                shift: 'morning',
                active: true,
                createdAt: '2025-01-15'
            },
            {
                id: 'U005',
                email: 'receptionist@adinathhospital.com',
                password: 'staff123',
                name: 'Priya Patel',
                nameGu: 'પ્રિયા પટેલ',
                nameHi: 'प्रिया पटेल',
                role: 'receptionist',
                department: 'Front Desk',
                permissions: ['appointments', 'patients', 'send_patient_link', 'queue'],
                photo: '',
                phone: '9876543002',
                preferredLanguage: 'gu',
                shift: 'morning',
                active: true,
                createdAt: '2025-01-15'
            },
            {
                id: 'U006',
                email: 'pharmacist@adinathhospital.com',
                password: 'staff123',
                name: 'Rahul Mehta',
                nameGu: 'રાહુલ મહેતા',
                nameHi: 'राहुल मेहता',
                role: 'pharmacist',
                department: 'Medical Store',
                permissions: ['inventory', 'sales', 'prescriptions', 'queue'],
                photo: '',
                phone: '9876543003',
                preferredLanguage: 'gu',
                shift: 'full-day',
                active: true,
                createdAt: '2025-01-15'
            }
        ];

        // Staff roles configuration
        const staffRoles = [
            { id: 'doctor', name: 'Doctor', icon: '👨‍⚕️', color: '#0f766e', permissions: ['patients', 'appointments', 'prescriptions', 'reports'] },
            { id: 'nurse', name: 'Nurse', icon: '👩‍⚕️', color: '#ec4899', permissions: ['patients', 'appointments'] },
            { id: 'receptionist', name: 'Receptionist', icon: '💁', color: '#8b5cf6', permissions: ['appointments', 'patients'] },
            { id: 'pharmacist', name: 'Pharmacist', icon: '💊', color: '#059669', permissions: ['inventory', 'sales', 'prescriptions'] },
            { id: 'lab_tech', name: 'Lab Technician', icon: '🔬', color: '#0ea5e9', permissions: ['reports', 'patients'] },
            { id: 'admin', name: 'Administrator', icon: '🔐', color: '#dc2626', permissions: ['all'] },
            { id: 'accountant', name: 'Accountant', icon: '📊', color: '#f59e0b', permissions: ['sales', 'reports'] },
            { id: 'housekeeping', name: 'Housekeeping', icon: '🧹', color: '#64748b', permissions: [] }
        ];

        localStorage.setItem('hms_users', JSON.stringify(users));
        localStorage.setItem('hms_staff_roles', JSON.stringify(staffRoles));

        // Sample patients
        const patients = [
            { id: 'P001', name: 'Rajesh Patel', phone: '9876543210', age: 55, gender: 'male', address: 'Shahibaug, Ahmedabad', createdAt: '2025-01-15', visits: 3 },
            { id: 'P002', name: 'Priya Shah', phone: '9876543211', age: 32, gender: 'female', address: 'Navrangpura, Ahmedabad', createdAt: '2025-02-20', visits: 2 },
            { id: 'P003', name: 'Meena Desai', phone: '9876543212', age: 45, gender: 'female', address: 'Satellite, Ahmedabad', createdAt: '2025-03-10', visits: 5 },
            { id: 'P004', name: 'Amit Kumar', phone: '9876543213', age: 28, gender: 'male', address: 'Maninagar, Ahmedabad', createdAt: '2025-04-05', visits: 1 },
        ];

        // Sample appointments
        const today = new Date().toISOString().split('T')[0];
        const appointments = [
            { id: 'A001', patientId: 'P001', patientName: 'Rajesh Patel', doctor: 'ashok', date: today, time: '11:00 AM', reason: 'Knee pain follow-up', status: 'confirmed', notes: '' },
            { id: 'A002', patientId: 'P002', patientName: 'Priya Shah', doctor: 'sunita', date: today, time: '12:00 PM', reason: 'Prenatal checkup', status: 'waiting', notes: '' },
            { id: 'A003', patientId: 'P003', patientName: 'Meena Desai', doctor: 'sunita', date: today, time: '2:00 PM', reason: 'Yoga class registration', status: 'pending', notes: '' },
            { id: 'A004', patientId: 'P004', patientName: 'Amit Kumar', doctor: 'ashok', date: today, time: '4:00 PM', reason: 'Sports injury consultation', status: 'pending', notes: '' },
        ];

        // Sample prescriptions
        const prescriptions = [
            { id: 'RX001', patientId: 'P001', patientName: 'Rajesh Patel', doctor: 'ashok', date: '2025-12-15', diagnosis: 'Osteoarthritis - Knee', medicines: [
                { name: 'Glucosamine Sulfate 500mg', dosage: '1-0-1', duration: '30 days' },
                { name: 'Diclofenac 50mg', dosage: '0-0-1', duration: '7 days' },
                { name: 'Calcium + Vitamin D3', dosage: '0-1-0', duration: '30 days' }
            ], advice: 'Avoid stairs, apply ice pack, continue physiotherapy' },
        ];

        // Sample inventory
        const inventory = [
            { id: 'M001', name: 'Paracetamol 500mg', category: 'General', stock: 500, unit: 'tablets', price: 2, reorderLevel: 100 },
            { id: 'M002', name: 'Diclofenac 50mg', category: 'Painkillers', stock: 200, unit: 'tablets', price: 5, reorderLevel: 50 },
            { id: 'M003', name: 'Glucosamine Sulfate 500mg', category: 'Orthopedic', stock: 150, unit: 'tablets', price: 15, reorderLevel: 30 },
            { id: 'M004', name: 'Calcium + D3 Tablets', category: 'Supplements', stock: 300, unit: 'tablets', price: 8, reorderLevel: 50 },
            { id: 'M005', name: 'Knee Support Brace', category: 'Orthopedic', stock: 25, unit: 'pieces', price: 450, reorderLevel: 5 },
            { id: 'M006', name: 'Folic Acid 5mg', category: 'Prenatal', stock: 400, unit: 'tablets', price: 3, reorderLevel: 100 },
            { id: 'M007', name: 'Iron + Folic Acid', category: 'Prenatal', stock: 350, unit: 'tablets', price: 5, reorderLevel: 80 },
            { id: 'M008', name: 'Crepe Bandage 4"', category: 'First Aid', stock: 50, unit: 'rolls', price: 45, reorderLevel: 10 },
        ];

        // Sample sales
        const sales = [
            { id: 'S001', date: today, patientName: 'Rajesh Patel', items: [{ name: 'Glucosamine', qty: 30, price: 450 }], total: 450, paymentMethod: 'cash' },
            { id: 'S002', date: today, patientName: 'Walk-in', items: [{ name: 'Paracetamol', qty: 10, price: 20 }], total: 20, paymentMethod: 'upi' },
        ];

        // Store all data
        localStorage.setItem('hms_patients', JSON.stringify(patients));
        localStorage.setItem('hms_appointments', JSON.stringify(appointments));
        localStorage.setItem('hms_prescriptions', JSON.stringify(prescriptions));
        localStorage.setItem('hms_inventory', JSON.stringify(inventory));
        localStorage.setItem('hms_sales', JSON.stringify(sales));
        localStorage.setItem('hms_queue', JSON.stringify([]));
    },

    // Patient Management
    patients: {
        getAll() { return JSON.parse(localStorage.getItem('hms_patients') || '[]'); },
        get(id) { return this.getAll().find(p => p.id === id); },
        add(patient) {
            const patients = this.getAll();
            patient.id = 'P' + String(patients.length + 1).padStart(3, '0');
            patient.createdAt = new Date().toISOString().split('T')[0];
            patient.visits = 0;
            patients.push(patient);
            localStorage.setItem('hms_patients', JSON.stringify(patients));
            return patient;
        },
        update(id, data) {
            const patients = this.getAll();
            const index = patients.findIndex(p => p.id === id);
            if (index !== -1) {
                patients[index] = { ...patients[index], ...data };
                localStorage.setItem('hms_patients', JSON.stringify(patients));
            }
        },
        search(query) {
            return this.getAll().filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.phone.includes(query)
            );
        }
    },

    // Appointment Management
    appointments: {
        getAll() { return JSON.parse(localStorage.getItem('hms_appointments') || '[]'); },
        get(id) { return this.getAll().find(a => a.id === id); },
        getByDate(date) { return this.getAll().filter(a => a.date === date); },
        getByDoctor(doctor, date) { return this.getAll().filter(a => a.doctor === doctor && a.date === date); },
        getByPatient(patientId) { return this.getAll().filter(a => a.patientId === patientId); },
        add(appointment) {
            const appointments = this.getAll();
            appointment.id = 'A' + String(appointments.length + 1).padStart(3, '0');
            appointment.status = 'pending';
            appointment.createdAt = new Date().toISOString();
            appointments.push(appointment);
            localStorage.setItem('hms_appointments', JSON.stringify(appointments));
            return appointment;
        },
        updateStatus(id, status, notes = '') {
            const appointments = this.getAll();
            const index = appointments.findIndex(a => a.id === id);
            if (index !== -1) {
                appointments[index].status = status;
                if (notes) appointments[index].notes = notes;
                localStorage.setItem('hms_appointments', JSON.stringify(appointments));
            }
        },
        getTodayStats() {
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = this.getByDate(today);
            return {
                total: todayAppts.length,
                pending: todayAppts.filter(a => a.status === 'pending').length,
                confirmed: todayAppts.filter(a => a.status === 'confirmed').length,
                waiting: todayAppts.filter(a => a.status === 'waiting').length,
                completed: todayAppts.filter(a => a.status === 'completed').length,
                cancelled: todayAppts.filter(a => a.status === 'cancelled').length
            };
        }
    },

    // Prescription Management
    prescriptions: {
        getAll() { return JSON.parse(localStorage.getItem('hms_prescriptions') || '[]'); },
        getByPatient(patientId) { return this.getAll().filter(rx => rx.patientId === patientId); },
        add(rx) {
            const prescriptions = this.getAll();
            rx.id = 'RX' + String(prescriptions.length + 1).padStart(3, '0');
            rx.date = new Date().toISOString().split('T')[0];
            prescriptions.push(rx);
            localStorage.setItem('hms_prescriptions', JSON.stringify(prescriptions));
            return rx;
        }
    },

    // Inventory Management
    inventory: {
        getAll() { return JSON.parse(localStorage.getItem('hms_inventory') || '[]'); },
        get(id) { return this.getAll().find(i => i.id === id); },
        getLowStock() { return this.getAll().filter(i => i.stock <= i.reorderLevel); },
        updateStock(id, quantity, operation = 'subtract') {
            const inventory = this.getAll();
            const index = inventory.findIndex(i => i.id === id);
            if (index !== -1) {
                if (operation === 'subtract') {
                    inventory[index].stock -= quantity;
                } else {
                    inventory[index].stock += quantity;
                }
                localStorage.setItem('hms_inventory', JSON.stringify(inventory));
            }
        },
        add(item) {
            const inventory = this.getAll();
            item.id = 'M' + String(inventory.length + 1).padStart(3, '0');
            inventory.push(item);
            localStorage.setItem('hms_inventory', JSON.stringify(inventory));
            return item;
        }
    },

    // Sales Management
    sales: {
        getAll() { return JSON.parse(localStorage.getItem('hms_sales') || '[]'); },
        getByDate(date) { return this.getAll().filter(s => s.date === date); },
        add(sale) {
            const sales = this.getAll();
            sale.id = 'S' + String(sales.length + 1).padStart(3, '0');
            sale.date = new Date().toISOString().split('T')[0];
            sale.time = new Date().toLocaleTimeString();
            sales.push(sale);
            localStorage.setItem('hms_sales', JSON.stringify(sales));
            return sale;
        },
        getTodayTotal() {
            const today = new Date().toISOString().split('T')[0];
            return this.getByDate(today).reduce((sum, s) => sum + s.total, 0);
        }
    },

    // Queue Management
    queue: {
        getAll() { return JSON.parse(localStorage.getItem('hms_queue') || '[]'); },
        add(patient) {
            const queue = this.getAll();
            patient.queueNumber = queue.length + 1;
            patient.addedAt = new Date().toISOString();
            patient.status = 'waiting';
            queue.push(patient);
            localStorage.setItem('hms_queue', JSON.stringify(queue));
            return patient;
        },
        remove(id) {
            const queue = this.getAll().filter(q => q.id !== id);
            localStorage.setItem('hms_queue', JSON.stringify(queue));
        },
        clear() {
            localStorage.setItem('hms_queue', JSON.stringify([]));
        }
    },

    // User & Authentication Management
    users: {
        getAll() { return JSON.parse(localStorage.getItem('hms_users') || '[]'); },
        get(id) { return this.getAll().find(u => u.id === id); },
        getByEmail(email) { return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()); },
        getByRole(role) { return this.getAll().filter(u => u.role === role); },
        getDoctors() { return this.getAll().filter(u => u.role === 'doctor'); },
        getStaff() { return this.getAll().filter(u => u.role !== 'doctor' && u.role !== 'admin'); },
        
        add(user) {
            const users = this.getAll();
            // Check if email already exists
            if (this.getByEmail(user.email)) {
                return { error: 'Email already registered' };
            }
            user.id = 'U' + String(users.length + 1).padStart(3, '0');
            user.createdAt = new Date().toISOString().split('T')[0];
            user.active = true;
            users.push(user);
            localStorage.setItem('hms_users', JSON.stringify(users));
            return user;
        },
        
        update(id, data) {
            const users = this.getAll();
            const index = users.findIndex(u => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...data };
                localStorage.setItem('hms_users', JSON.stringify(users));
                return users[index];
            }
            return null;
        },
        
        delete(id) {
            const users = this.getAll().filter(u => u.id !== id);
            localStorage.setItem('hms_users', JSON.stringify(users));
        },
        
        toggleActive(id) {
            const user = this.get(id);
            if (user) {
                this.update(id, { active: !user.active });
            }
        }
    },

    // Authentication
    auth: {
        currentUser: null,
        
        login(email, password) {
            const user = HMS.users.getByEmail(email);
            if (!user) {
                return { error: 'User not found' };
            }
            if (user.password !== password) {
                return { error: 'Incorrect password' };
            }
            if (!user.active) {
                return { error: 'Account is deactivated. Contact admin.' };
            }
            
            this.currentUser = user;
            localStorage.setItem('hms_current_user', JSON.stringify(user));
            localStorage.setItem('hms_logged_in', 'true');
            return { success: true, user };
        },
        
        logout() {
            this.currentUser = null;
            localStorage.removeItem('hms_current_user');
            localStorage.removeItem('hms_logged_in');
        },
        
        getCurrentUser() {
            if (this.currentUser) return this.currentUser;
            const stored = localStorage.getItem('hms_current_user');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                return this.currentUser;
            }
            return null;
        },
        
        isLoggedIn() {
            return !!this.getCurrentUser();
        },
        
        hasPermission(permission) {
            const user = this.getCurrentUser();
            if (!user) return false;
            if (user.permissions.includes('all')) return true;
            return user.permissions.includes(permission);
        },
        
        isAdmin() {
            const user = this.getCurrentUser();
            return user && user.role === 'admin';
        },
        
        isDoctor() {
            const user = this.getCurrentUser();
            return user && user.role === 'doctor';
        },
        
        signup(userData) {
            // For staff signup, requires admin approval
            userData.active = false; // Pending approval
            userData.password = userData.password || 'temp123';
            const result = HMS.users.add(userData);
            if (result.error) return result;
            return { success: true, message: 'Account created. Pending admin approval.', user: result };
        }
    },

    // Staff Roles Configuration
    staffRoles: {
        getAll() { return JSON.parse(localStorage.getItem('hms_staff_roles') || '[]'); },
        get(id) { return this.getAll().find(r => r.id === id); }
    },

    // Utility functions
    utils: {
        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('en-IN', { 
                day: 'numeric', month: 'short', year: 'numeric' 
            });
        },
        formatCurrency(amount) {
            return '₹' + amount.toLocaleString('en-IN');
        },
        generateId(prefix) {
            return prefix + Date.now().toString(36).toUpperCase();
        },
        generateToken() {
            return Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
    },

    // Multilingual SMS Templates
    smsTemplates: {
        templates: {
            appointment_confirmation: {
                en: 'Dear {name}, your appointment with {doctor} is confirmed for {date} at {time}. Adinath Hospital, Shahibaug. Call: 9925450425',
                hi: 'प्रिय {name}, {doctor} के साथ आपका अपॉइंटमेंट {date} को {time} बजे कन्फर्म है। आदिनाथ हॉस्पिटल, शाहीबाग। कॉल: 9925450425',
                gu: 'પ્રિય {name}, {doctor} સાથે તમારી એપોઇન્ટમેન્ટ {date} ના રોજ {time} વાગ્યે કન્ફર્મ છે। આદિનાથ હોસ્પિટલ, શાહીબાગ. કૉલ: 9925450425'
            },
            appointment_reminder: {
                en: 'Reminder: Your appointment with {doctor} is tomorrow at {time}. Please arrive 15 mins early. Adinath Hospital.',
                hi: 'रिमाइंडर: {doctor} के साथ आपका अपॉइंटमेंट कल {time} बजे है। कृपया 15 मिनट पहले आएं। आदिनाथ हॉस्पिटल।',
                gu: 'રીમાઇન્ડર: {doctor} સાથે તમારી એપોઇન્ટમેન્ટ આવતીકાલે {time} વાગ્યે છે। કૃપા કરીને 15 મિનિટ વહેલા આવો. આદિનાથ હોસ્પિટલ.'
            },
            prescription_ready: {
                en: 'Your prescription is ready at Adinath Hospital pharmacy. Show this SMS to collect. Ref: {rxId}',
                hi: 'आपका प्रिस्क्रिप्शन आदिनाथ हॉस्पिटल फार्मेसी में तैयार है। लेने के लिए यह SMS दिखाएं। रेफ: {rxId}',
                gu: 'તમારું પ્રિસ્ક્રિપ્શન આદિનાથ હોસ્પિટલ ફાર્મસીમાં તૈયાર છે। લેવા માટે આ SMS બતાવો. રેફ: {rxId}'
            },
            patient_signup_link: {
                en: 'Welcome to Adinath Hospital! Create your patient account here: {link} - Dr. {doctor}',
                hi: 'आदिनाथ हॉस्पिटल में आपका स्वागत है! यहां अपना पेशेंट अकाउंट बनाएं: {link} - डॉ. {doctor}',
                gu: 'આદિનાથ હોસ્પિટલમાં આપનું સ્વાગત છે! અહીં તમારું પેશન્ટ એકાઉન્ટ બનાવો: {link} - ડૉ. {doctor}'
            },
            medicine_reminder: {
                en: 'Time to take your medicine: {medicine}. Dosage: {dosage}. Stay healthy! - Adinath Hospital',
                hi: 'दवाई लेने का समय: {medicine}। खुराक: {dosage}। स्वस्थ रहें! - आदिनाथ हॉस्पिटल',
                gu: 'દવા લેવાનો સમય: {medicine}. ડોઝ: {dosage}. સ્વસ્થ રહો! - આદિનાથ હોસ્પિટલ'
            },
            followup_reminder: {
                en: 'It\'s time for your follow-up visit. Please book at: {link} or call 9925450425. - Dr. {doctor}',
                hi: 'आपके फॉलो-अप विजिट का समय है। कृपया यहां बुक करें: {link} या कॉल करें 9925450425। - डॉ. {doctor}',
                gu: 'તમારી ફોલો-અપ મુલાકાતનો સમય છે. કૃપા કરીને અહીં બુક કરો: {link} અથવા કૉલ કરો 9925450425. - ડૉ. {doctor}'
            },
            yoga_class: {
                en: 'Join our yoga class tomorrow at {time}. Bring a mat and wear comfortable clothes. - Dr. Sunita, Adinath Hospital',
                hi: 'कल {time} बजे हमारी योग क्लास में शामिल हों। मैट लाएं और आरामदायक कपड़े पहनें। - डॉ. सुनीता, आदिनाथ हॉस्पिटल',
                gu: 'આવતીકાલે {time} વાગ્યે અમારી યોગ ક્લાસમાં જોડાઓ. મેટ લાવો અને આરામદાયક કપડાં પહેરો. - ડૉ. સુનિતા, આદિનાથ હોસ્પિટલ'
            },
            health_tip: {
                en: '{tip} - Stay healthy! Dr. {doctor}, Adinath Hospital',
                hi: '{tip} - स्वस्थ रहें! डॉ. {doctor}, आदिनाथ हॉस्पिटल',
                gu: '{tip} - સ્વસ્થ રહો! ડૉ. {doctor}, આદિનાથ હોસ્પિટલ'
            }
        },
        
        generate(templateKey, data, language = 'en') {
            let template = this.templates[templateKey]?.[language] || this.templates[templateKey]?.['en'];
            if (!template) return null;
            
            Object.keys(data).forEach(key => {
                template = template.replace(new RegExp(`{${key}}`, 'g'), data[key]);
            });
            return template;
        }
    },

    // Notification System
    notifications: {
        queue: [],
        
        add(notification) {
            notification.id = HMS.utils.generateId('N');
            notification.createdAt = new Date().toISOString();
            notification.read = false;
            this.queue.push(notification);
            this.saveQueue();
            return notification;
        },
        
        getForUser(userId) {
            return this.getAll().filter(n => n.userId === userId);
        },
        
        getAll() {
            return JSON.parse(localStorage.getItem('hms_notifications') || '[]');
        },
        
        saveQueue() {
            const existing = this.getAll();
            localStorage.setItem('hms_notifications', JSON.stringify([...existing, ...this.queue]));
            this.queue = [];
        },
        
        markRead(id) {
            const notifications = this.getAll();
            const index = notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                notifications[index].read = true;
                localStorage.setItem('hms_notifications', JSON.stringify(notifications));
            }
        },
        
        sendSMS(phone, message, language = 'en') {
            // In production, this would call an SMS API (MSG91, Twilio, etc.)
            console.log(`📱 SMS to ${phone} [${language}]: ${message}`);
            return { success: true, message: 'SMS queued', preview: message };
        },
        
        sendWhatsApp(phone, message) {
            // Generate WhatsApp link
            const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
            return { success: true, url };
        },
        
        notifyDoctor(doctorId, type, data) {
            const doctor = HMS.users.get(doctorId);
            if (!doctor) return;
            
            const message = this.formatNotification(type, data, doctor.preferredLanguage || 'en');
            
            if (doctor.notifyViaSMS) {
                this.sendSMS(doctor.phone, message);
            }
            
            this.add({
                userId: doctorId,
                type,
                message,
                data
            });
        },
        
        formatNotification(type, data, lang) {
            const messages = {
                new_appointment: {
                    en: `New appointment: ${data.patientName} at ${data.time}`,
                    hi: `नया अपॉइंटमेंट: ${data.patientName} ${data.time} बजे`,
                    gu: `નવી એપોઇન્ટમેન્ટ: ${data.patientName} ${data.time} વાગ્યે`
                },
                patient_arrived: {
                    en: `Patient arrived: ${data.patientName} is waiting`,
                    hi: `मरीज आ गया: ${data.patientName} इंतजार कर रहा है`,
                    gu: `દર્દી આવ્યા: ${data.patientName} રાહ જોઈ રહ્યા છે`
                }
            };
            return messages[type]?.[lang] || messages[type]?.['en'] || type;
        }
    },

    // Patient Link System (for staff to send signup links)
    patientLinks: {
        generate(patientData, staffId) {
            const token = HMS.utils.generateToken();
            const link = {
                token,
                patientPhone: patientData.phone,
                patientName: patientData.name,
                createdBy: staffId,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                used: false
            };
            
            const links = this.getAll();
            links.push(link);
            localStorage.setItem('hms_patient_links', JSON.stringify(links));
            
            // Generate the URL (in production, use actual domain)
            const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
            return {
                token,
                url: `${baseUrl}patient-signup.html?token=${token}`,
                shortUrl: `adinath.link/${token.substring(0, 8)}`
            };
        },
        
        getAll() {
            return JSON.parse(localStorage.getItem('hms_patient_links') || '[]');
        },
        
        validate(token) {
            const links = this.getAll();
            const link = links.find(l => l.token === token);
            if (!link) return { valid: false, error: 'Invalid link' };
            if (link.used) return { valid: false, error: 'Link already used' };
            if (new Date(link.expiresAt) < new Date()) return { valid: false, error: 'Link expired' };
            return { valid: true, link };
        },
        
        markUsed(token) {
            const links = this.getAll();
            const index = links.findIndex(l => l.token === token);
            if (index !== -1) {
                links[index].used = true;
                links[index].usedAt = new Date().toISOString();
                localStorage.setItem('hms_patient_links', JSON.stringify(links));
            }
        }
    },

    // QR Code URLs (for mobile app / easy access)
    qrCodes: {
        getUrl(type, params = {}) {
            const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
            const urls = {
                book_appointment: `${baseUrl}book.html`,
                patient_portal: `${baseUrl}portal/patient/index.html`,
                patient_signup: `${baseUrl}patient-signup.html`,
                upload_images: `${baseUrl}patient-upload.html?patientId=${params.patientId || ''}`,
                prescription: `${baseUrl}rx.html?id=${params.rxId || ''}`,
                yoga_registration: `${baseUrl}book.html?service=yoga`,
                feedback: `${baseUrl}feedback.html`,
                whatsapp: `https://wa.me/919925450425`
            };
            return urls[type] || baseUrl;
        },
        
        generateQRData(type, params) {
            return {
                url: this.getUrl(type, params),
                type,
                params
            };
        }
    },

    // Content Management (for doctor posts, health tips, etc.)
    content: {
        getAll() { return JSON.parse(localStorage.getItem('hms_content') || '[]'); },
        
        add(item) {
            const content = this.getAll();
            item.id = HMS.utils.generateId('C');
            item.createdAt = new Date().toISOString();
            item.published = false;
            content.push(item);
            localStorage.setItem('hms_content', JSON.stringify(content));
            return item;
        },
        
        getByDoctor(doctorId) {
            return this.getAll().filter(c => c.authorId === doctorId);
        },
        
        getPublished() {
            return this.getAll().filter(c => c.published);
        },
        
        publish(id) {
            const content = this.getAll();
            const index = content.findIndex(c => c.id === id);
            if (index !== -1) {
                content[index].published = true;
                content[index].publishedAt = new Date().toISOString();
                localStorage.setItem('hms_content', JSON.stringify(content));
            }
        }
    },

    // Image Management
    images: {
        getAll() { return JSON.parse(localStorage.getItem('hms_images') || '[]'); },
        
        add(image) {
            const images = this.getAll();
            image.id = HMS.utils.generateId('IMG');
            image.uploadedAt = new Date().toISOString();
            images.push(image);
            localStorage.setItem('hms_images', JSON.stringify(images));
            return image;
        },
        
        getByPatient(patientId) {
            return this.getAll().filter(i => i.patientId === patientId);
        },
        
        getByUploader(userId) {
            return this.getAll().filter(i => i.uploadedBy === userId);
        }
    },

    // Reset all data
    reset() {
        localStorage.removeItem('hms_initialized');
        localStorage.removeItem('hms_patients');
        localStorage.removeItem('hms_appointments');
        localStorage.removeItem('hms_prescriptions');
        localStorage.removeItem('hms_inventory');
        localStorage.removeItem('hms_sales');
        localStorage.removeItem('hms_queue');
        localStorage.removeItem('hms_users');
        localStorage.removeItem('hms_staff_roles');
        localStorage.removeItem('hms_current_user');
        localStorage.removeItem('hms_logged_in');
        this.init();
    }
};

// Initialize on load
HMS.init();

