// ============================================
// BOOKING WIZARD
// Step-by-step appointment booking flow
// ============================================

const BookingWizard = {
    // Wizard state
    currentStep: 1,
    totalSteps: 4,
    formData: {
        doctorId: '',
        date: '',
        time: '',
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        patientAge: '',
        reasonForVisit: '',
    },

    /**
     * Initialize booking wizard
     */
    init() {
        this.createModal();
        this.attachEventListeners();
        this.renderStep(1);
    },

    /**
     * Create modal HTML structure
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'booking-wizard-modal';
        modal.className = 'booking-modal hidden';

        // Create modal content with textContent for non-dynamic parts
        const modalContent = document.createElement('div');
        modalContent.className = 'booking-modal-overlay';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'booking-modal-content';

        // Header
        const header = document.createElement('div');
        header.className = 'booking-modal-header';
        const title = document.createElement('h2');
        title.textContent = 'Book an Appointment';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'booking-close-btn';
        closeBtn.setAttribute('aria-label', 'Close booking wizard');
        closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Progress indicator
        const progress = document.createElement('div');
        progress.className = 'booking-progress';
        progress.innerHTML = `
            <div class="progress-steps">
                <div class="progress-step active" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-label">Doctor</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-label">Date & Time</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-label">Your Info</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="4">
                    <div class="step-number">4</div>
                    <div class="step-label">Confirm</div>
                </div>
            </div>
        `;

        // Form
        const form = document.createElement('form');
        form.id = 'booking-form';
        form.className = 'booking-form';

        // Step 1: Doctor Selection
        const step1 = document.createElement('div');
        step1.className = 'booking-step active';
        step1.setAttribute('data-step', '1');
        step1.innerHTML = `
            <div class="step-content">
                <h3>Select a Doctor</h3>
                <div id="doctors-list" class="doctors-options"></div>
                <div id="step1-error" class="error-message" role="alert"></div>
            </div>
        `;

        // Step 2: Date & Time
        const step2 = document.createElement('div');
        step2.className = 'booking-step';
        step2.setAttribute('data-step', '2');
        step2.innerHTML = `
            <div class="step-content">
                <h3>Choose Date & Time</h3>
                <div class="form-group">
                    <label for="appointment-date">Appointment Date *</label>
                    <input type="date" id="appointment-date" name="date" required min="" aria-describedby="date-help">
                    <small id="date-help">Select a date at least 2 days from now</small>
                    <div id="date-error" class="error-message" role="alert"></div>
                </div>
                <div class="form-group">
                    <label for="appointment-time">Appointment Time *</label>
                    <select id="appointment-time" name="time" required aria-describedby="time-help">
                        <option value="">Select a time slot</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="09:30">09:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="15:30">03:30 PM</option>
                        <option value="16:00">04:00 PM</option>
                    </select>
                    <small id="time-help">Available time slots shown here</small>
                    <div id="time-error" class="error-message" role="alert"></div>
                </div>
            </div>
        `;

        // Step 3: Patient Info
        const step3 = document.createElement('div');
        step3.className = 'booking-step';
        step3.setAttribute('data-step', '3');
        step3.innerHTML = `
            <div class="step-content">
                <h3>Your Information</h3>
                <div class="form-group">
                    <label for="patient-name">Full Name *</label>
                    <input type="text" id="patient-name" name="patientName" placeholder="John Doe" required aria-describedby="name-help">
                    <small id="name-help">As it appears on your ID</small>
                    <div id="name-error" class="error-message" role="alert"></div>
                </div>
                <div class="form-group">
                    <label for="patient-email">Email Address *</label>
                    <input type="email" id="patient-email" name="patientEmail" placeholder="john@example.com" required aria-describedby="email-help">
                    <small id="email-help">Confirmation will be sent here</small>
                    <div id="email-error" class="error-message" role="alert"></div>
                </div>
                <div class="form-group">
                    <label for="patient-phone">Phone Number *</label>
                    <input type="tel" id="patient-phone" name="patientPhone" placeholder="9876543210" required aria-describedby="phone-help">
                    <small id="phone-help">10-digit phone number (India)</small>
                    <div id="phone-error" class="error-message" role="alert"></div>
                </div>
                <div class="form-group">
                    <label for="patient-age">Age *</label>
                    <input type="number" id="patient-age" name="patientAge" min="1" max="150" placeholder="35" required aria-describedby="age-help">
                    <small id="age-help">Must be between 1 and 150</small>
                    <div id="age-error" class="error-message" role="alert"></div>
                </div>
                <div class="form-group">
                    <label for="reason-visit">Reason for Visit</label>
                    <textarea id="reason-visit" name="reasonForVisit" placeholder="Brief description of your health concern" maxlength="250" rows="3"></textarea>
                    <small>Optional - helps doctor prepare</small>
                    <div id="reason-error" class="error-message" role="alert"></div>
                </div>
            </div>
        `;

        // Step 4: Confirmation
        const step4 = document.createElement('div');
        step4.className = 'booking-step';
        step4.setAttribute('data-step', '4');
        step4.innerHTML = `
            <div class="step-content">
                <h3>Confirm Your Appointment</h3>
                <div class="confirmation-summary">
                    <div class="summary-section">
                        <h4>Doctor</h4>
                        <p id="confirm-doctor">-</p>
                    </div>
                    <div class="summary-section">
                        <h4>Date & Time</h4>
                        <p id="confirm-datetime">-</p>
                    </div>
                    <div class="summary-section">
                        <h4>Your Details</h4>
                        <p id="confirm-details">-</p>
                    </div>
                </div>
                <div class="confirmation-note">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>You'll receive a confirmation email with appointment details</span>
                </div>
                <div id="step4-error" class="error-message" role="alert"></div>
            </div>
        `;

        // Form actions
        const actions = document.createElement('div');
        actions.className = 'booking-actions';
        const prevBtn = document.createElement('button');
        prevBtn.id = 'prev-btn';
        prevBtn.className = 'btn-secondary';
        prevBtn.type = 'button';
        prevBtn.textContent = '← Back';
        prevBtn.style.display = 'none';

        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn';
        nextBtn.className = 'btn-primary';
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next →';

        actions.appendChild(prevBtn);
        actions.appendChild(nextBtn);

        form.appendChild(step1);
        form.appendChild(step2);
        form.appendChild(step3);
        form.appendChild(step4);
        form.appendChild(actions);

        contentDiv.appendChild(header);
        contentDiv.appendChild(progress);
        contentDiv.appendChild(form);

        modal.appendChild(modalContent);
        modal.appendChild(contentDiv);

        document.body.appendChild(modal);
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const modal = document.getElementById('booking-wizard-modal');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const closeBtn = document.querySelector('.booking-close-btn');
        const overlay = document.querySelector('.booking-modal-overlay');

        nextBtn.addEventListener('click', (e) => this.handleNext(e));
        prevBtn.addEventListener('click', (e) => this.handlePrev(e));
        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());

        // Load doctors and populate the list
        this.loadDoctors();
    },

    /**
     * Load doctors from DOM or API
     */
    loadDoctors() {
        const doctorsContainer = document.getElementById('doctors-list');

        // Find doctors from the page
        const doctors = [];
        const doctorCards = document.querySelectorAll('.doctor-card');

        if (doctorCards.length === 0) {
            // Fallback to sample doctors
            doctors.push(
                { id: 'dr-ashok', name: 'Dr. Ashok Jain', specialty: 'Orthopedic Surgeon, General Practitioner' },
                { id: 'dr-sunita', name: 'Dr. Sunita Sharma', specialty: 'Gynecologist, Yoga Therapist' }
            );
        } else {
            doctorCards.forEach((card) => {
                const name = card.querySelector('h3')?.textContent || '';
                const specialty = card.querySelector('.specialty')?.textContent || '';
                const id = card.getAttribute('data-doctor-id') || `dr-${name.toLowerCase().replace(/\s+/g, '-')}`;

                if (name) {
                    doctors.push({ id, name, specialty });
                }
            });
        }

        // Render doctor options
        doctorsContainer.innerHTML = '';
        doctors.forEach(doc => {
            const label = document.createElement('label');
            label.className = 'doctor-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'doctorId';
            input.value = doc.id;
            input.required = true;

            const content = document.createElement('div');
            content.className = 'option-content';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'option-name';
            nameDiv.textContent = doc.name;

            const specialtyDiv = document.createElement('div');
            specialtyDiv.className = 'option-specialty';
            specialtyDiv.textContent = doc.specialty;

            content.appendChild(nameDiv);
            content.appendChild(specialtyDiv);

            label.appendChild(input);
            label.appendChild(content);
            doctorsContainer.appendChild(label);

            input.addEventListener('change', (e) => {
                this.formData.doctorId = e.target.value;
                this.validateStep(1);
            });
        });
    },

    /**
     * Render specific step
     */
    renderStep(step) {
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(el => el.classList.remove('active'));

        // Show current step
        const currentStepEl = document.querySelector(`.booking-step[data-step="${step}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach(el => {
            el.classList.toggle('active', parseInt(el.getAttribute('data-step')) <= step);
        });

        // Update button states
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (step === 1) {
            prevBtn.style.display = 'none';
            nextBtn.textContent = 'Next →';
        } else if (step === this.totalSteps) {
            prevBtn.style.display = 'block';
            nextBtn.textContent = 'Confirm Booking';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.textContent = 'Next →';
        }

        // If step 4, populate confirmation
        if (step === 4) {
            this.populateConfirmation();
        }

        this.currentStep = step;
    },

    /**
     * Handle next button click
     */
    handleNext(e) {
        e.preventDefault();

        // Validate current step
        if (!this.validateStep(this.currentStep)) {
            return;
        }

        // Update form data from inputs
        this.updateFormData();

        // If on last step, submit
        if (this.currentStep === this.totalSteps) {
            this.submitBooking();
            return;
        }

        // Move to next step
        this.renderStep(this.currentStep + 1);
    },

    /**
     * Handle prev button click
     */
    handlePrev(e) {
        e.preventDefault();

        if (this.currentStep > 1) {
            this.renderStep(this.currentStep - 1);
        }
    },

    /**
     * Validate current step
     */
    validateStep(step) {
        const errors = [];

        switch (step) {
            case 1:
                if (!this.formData.doctorId) {
                    errors.push('Please select a doctor');
                    const errorEl = document.getElementById('step1-error');
                    if (errorEl) errorEl.textContent = errors[0];
                }
                break;

            case 2:
                const dateInput = document.getElementById('appointment-date');
                const timeInput = document.getElementById('appointment-time');
                const dateValue = dateInput.value;
                const timeValue = timeInput.value;

                if (!dateValue) {
                    errors.push('Please select a date');
                    const errorEl = document.getElementById('date-error');
                    if (errorEl) errorEl.textContent = errors[0];
                }

                if (!timeValue) {
                    errors.push('Please select a time');
                    const errorEl = document.getElementById('time-error');
                    if (errorEl) errorEl.textContent = errors[0];
                }

                // Validate date is at least 2 days in future
                if (dateValue) {
                    const selectedDate = new Date(dateValue);
                    const minDate = new Date();
                    minDate.setDate(minDate.getDate() + 2);

                    if (selectedDate < minDate) {
                        errors.push('Please select a date at least 2 days from now');
                        const errorEl = document.getElementById('date-error');
                        if (errorEl) errorEl.textContent = errors[0];
                    }
                }
                break;

            case 3:
                const nameInput = document.getElementById('patient-name');
                const emailInput = document.getElementById('patient-email');
                const phoneInput = document.getElementById('patient-phone');
                const ageInput = document.getElementById('patient-age');

                // Validate name
                const nameValidation = SecurityUtils.validateInput(nameInput.value, 'name');
                if (!nameValidation.valid) {
                    const errorEl = document.getElementById('name-error');
                    if (errorEl) errorEl.textContent = nameValidation.error;
                    errors.push(nameValidation.error);
                }

                // Validate email
                const emailValidation = SecurityUtils.validateInput(emailInput.value, 'email');
                if (!emailValidation.valid) {
                    const errorEl = document.getElementById('email-error');
                    if (errorEl) errorEl.textContent = emailValidation.error;
                    errors.push(emailValidation.error);
                }

                // Validate phone
                const phoneValidation = SecurityUtils.validateInput(phoneInput.value, 'phone');
                if (!phoneValidation.valid) {
                    const errorEl = document.getElementById('phone-error');
                    if (errorEl) errorEl.textContent = phoneValidation.error;
                    errors.push(phoneValidation.error);
                }

                // Validate age
                const age = parseInt(ageInput.value);
                if (!age || age < 1 || age > 150) {
                    const errorEl = document.getElementById('age-error');
                    if (errorEl) errorEl.textContent = 'Please enter a valid age';
                    errors.push('Invalid age');
                }
                break;
        }

        return errors.length === 0;
    },

    /**
     * Update form data from inputs
     */
    updateFormData() {
        // Get selected doctor
        const doctorRadio = document.querySelector('input[name="doctorId"]:checked');
        if (doctorRadio) {
            this.formData.doctorId = doctorRadio.value;
        }

        // Get date and time
        this.formData.date = document.getElementById('appointment-date')?.value || '';
        this.formData.time = document.getElementById('appointment-time')?.value || '';

        // Get patient info
        this.formData.patientName = document.getElementById('patient-name')?.value || '';
        this.formData.patientEmail = document.getElementById('patient-email')?.value || '';
        this.formData.patientPhone = document.getElementById('patient-phone')?.value || '';
        this.formData.patientAge = document.getElementById('patient-age')?.value || '';
        this.formData.reasonForVisit = document.getElementById('reason-visit')?.value || '';
    },

    /**
     * Populate confirmation step
     */
    populateConfirmation() {
        // Find doctor name
        const doctorRadio = document.querySelector(`input[value="${this.formData.doctorId}"]`);
        const doctorName = doctorRadio?.closest('.doctor-option')?.querySelector('.option-name')?.textContent || 'Doctor';

        // Format date
        const dateObj = new Date(this.formData.date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format time
        const [hours, minutes] = this.formData.time.split(':');
        const timeObj = new Date(2024, 0, 1, parseInt(hours), parseInt(minutes));
        const formattedTime = timeObj.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Update confirmation display
        document.getElementById('confirm-doctor').textContent = doctorName;
        document.getElementById('confirm-datetime').textContent = `${formattedDate}, ${formattedTime}`;

        const detailsEl = document.getElementById('confirm-details');
        detailsEl.innerHTML = '';

        const nameEl = document.createElement('strong');
        nameEl.textContent = this.formData.patientName;
        detailsEl.appendChild(nameEl);

        const br1 = document.createElement('br');
        detailsEl.appendChild(br1);

        const emailEl = document.createElement('span');
        emailEl.textContent = this.formData.patientEmail;
        detailsEl.appendChild(emailEl);

        const br2 = document.createElement('br');
        detailsEl.appendChild(br2);

        const phoneEl = document.createElement('span');
        phoneEl.textContent = this.formData.patientPhone;
        detailsEl.appendChild(phoneEl);
    },

    /**
     * Submit booking
     */
    submitBooking() {
        const submitBtn = document.getElementById('next-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';

        // Log event
        SecurityUtils.logSecurityEvent('appointment_booking_submitted', {
            doctor: this.formData.doctorId,
            date: this.formData.date,
        });

        // Simulate API call
        setTimeout(() => {
            // Show success message
            const stepContent = document.querySelector('.booking-step.active .step-content');
            if (stepContent) {
                stepContent.innerHTML = `
                    <div class="booking-success">
                        <div class="success-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3>Booking Confirmed!</h3>
                        <p>Your appointment has been successfully booked. A confirmation email has been sent.</p>
                        <div class="success-details"></div>
                    </div>
                `;
            }

            // Update buttons
            document.getElementById('prev-btn').style.display = 'none';
            submitBtn.style.display = 'none';

            // Auto-close after 3 seconds
            setTimeout(() => {
                this.close();
            }, 3000);
        }, 1500);
    },

    /**
     * Open booking wizard modal
     */
    open() {
        const modal = document.getElementById('booking-wizard-modal');
        if (modal) {
            modal.classList.remove('hidden');

            // Set minimum date to 2 days from now
            const dateInput = document.getElementById('appointment-date');
            if (dateInput) {
                const minDate = new Date();
                minDate.setDate(minDate.getDate() + 2);
                const dateStr = minDate.toISOString().split('T')[0];
                dateInput.setAttribute('min', dateStr);
            }

            // Focus on first input
            setTimeout(() => {
                const firstRadio = document.querySelector('input[name="doctorId"]');
                if (firstRadio) firstRadio.focus();
            }, 100);
        }
    },

    /**
     * Close booking wizard modal
     */
    close() {
        const modal = document.getElementById('booking-wizard-modal');
        if (modal) {
            modal.classList.add('hidden');
            // Reset wizard
            this.currentStep = 1;
            this.formData = {
                doctorId: '',
                date: '',
                time: '',
                patientName: '',
                patientEmail: '',
                patientPhone: '',
                patientAge: '',
                reasonForVisit: '',
            };
            // Re-render step 1
            this.renderStep(1);
        }
    },
};

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        BookingWizard.init();
    });
} else {
    BookingWizard.init();
}
