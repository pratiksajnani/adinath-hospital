/**
 * BOOKING WIZARD Unit Tests
 */

// Mock SecurityUtils before loading module
global.SecurityUtils = {
    validateInput: jest.fn((value, type) => {
        if (!value || value.trim() === '') {
            return { valid: false, error: `${type} is required` };
        }
        return { valid: true, sanitized: value.trim() };
    }),
    escapeHTML: jest.fn((str) => str),
    logSecurityEvent: jest.fn(),
};

// Load module
const BookingWizard = require('../../js/booking-wizard.js');

beforeEach(() => {
    // Re-setup SecurityUtils mock (resetMocks clears implementations)
    global.SecurityUtils = {
        validateInput: jest.fn((value, type) => {
            if (!value || value.trim() === '') {
                return { valid: false, error: `${type} is required` };
            }
            return { valid: true, sanitized: value.trim() };
        }),
        escapeHTML: jest.fn((str) => str),
        logSecurityEvent: jest.fn(),
    };
});

describe('BookingWizard', () => {
    describe('Module Structure', () => {
        test('should be defined', () => {
            expect(BookingWizard).toBeDefined();
        });

        test('should have init method', () => {
            expect(typeof BookingWizard.init).toBe('function');
        });

        test('should have open method', () => {
            expect(typeof BookingWizard.open).toBe('function');
        });

        test('should have close method', () => {
            expect(typeof BookingWizard.close).toBe('function');
        });

        test('should have validateStep method', () => {
            expect(typeof BookingWizard.validateStep).toBe('function');
        });

        test('should have renderStep method', () => {
            expect(typeof BookingWizard.renderStep).toBe('function');
        });

        test('should have submitBooking method', () => {
            expect(typeof BookingWizard.submitBooking).toBe('function');
        });

        test('should have updateFormData method', () => {
            expect(typeof BookingWizard.updateFormData).toBe('function');
        });

        test('should have populateConfirmation method', () => {
            expect(typeof BookingWizard.populateConfirmation).toBe('function');
        });

        test('should have totalSteps of 4', () => {
            expect(BookingWizard.totalSteps).toBe(4);
        });
    });

    describe('formData', () => {
        test('should have doctorId field', () => {
            expect(BookingWizard.formData).toHaveProperty('doctorId');
        });

        test('should have date field', () => {
            expect(BookingWizard.formData).toHaveProperty('date');
        });

        test('should have time field', () => {
            expect(BookingWizard.formData).toHaveProperty('time');
        });

        test('should have patientName field', () => {
            expect(BookingWizard.formData).toHaveProperty('patientName');
        });

        test('should have patientEmail field', () => {
            expect(BookingWizard.formData).toHaveProperty('patientEmail');
        });

        test('should have patientPhone field', () => {
            expect(BookingWizard.formData).toHaveProperty('patientPhone');
        });

        test('should have patientAge field', () => {
            expect(BookingWizard.formData).toHaveProperty('patientAge');
        });

        test('should have reasonForVisit field', () => {
            expect(BookingWizard.formData).toHaveProperty('reasonForVisit');
        });
    });

    describe('_setError()', () => {
        test('should not throw if element not found', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(() => BookingWizard._setError('nonexistent', 'msg')).not.toThrow();
        });

        test('should set textContent on found element', () => {
            const el = document.createElement('span');
            jest.spyOn(document, 'getElementById').mockReturnValue(el);
            BookingWizard._setError('test-error', 'Error message');
            expect(el.textContent).toBe('Error message');
        });
    });

    describe('_validateDoctorStep()', () => {
        test('should push error when no doctor selected', () => {
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            const errors = [];
            BookingWizard._validateDoctorStep(errors);
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('_validateDateTimeStep()', () => {
        test('should push error when no date input found', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            const errors = [];
            BookingWizard._validateDateTimeStep(errors);
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('_validatePatientInfoStep()', () => {
        test('should call SecurityUtils.validateInput for name, email, phone', () => {
            const mockInput = { value: 'test' };
            jest.spyOn(document, 'getElementById').mockReturnValue(mockInput);

            const errors = [];
            BookingWizard._validatePatientInfoStep(errors);
            expect(SecurityUtils.validateInput).toHaveBeenCalledWith('test', 'name');
            expect(SecurityUtils.validateInput).toHaveBeenCalledWith('test', 'email');
            expect(SecurityUtils.validateInput).toHaveBeenCalledWith('test', 'phone');
        });

        test('should push error for empty age', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue({ value: '' });
            const errors = [];
            BookingWizard._validatePatientInfoStep(errors);
            expect(errors.some((e) => e.includes('age') || e.includes('Invalid'))).toBe(true);
        });

        test('should accept valid age 35', () => {
            SecurityUtils.validateInput = jest.fn(() => ({ valid: true, sanitized: 'test' }));
            jest.spyOn(document, 'getElementById').mockImplementation((id) => {
                if (id === 'patient-age') {
                    return { value: '35' };
                }
                return { value: 'valid' };
            });
            const errors = [];
            BookingWizard._validatePatientInfoStep(errors);
            expect(errors.length).toBe(0);
        });
    });

    describe('validateStep()', () => {
        test('should return false for step 1 without doctor', () => {
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(BookingWizard.validateStep(1)).toBe(false);
        });

        test('should return false for step 2 without date', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(BookingWizard.validateStep(2)).toBe(false);
        });

        test('should return true for step 4', () => {
            expect(BookingWizard.validateStep(4)).toBe(true);
        });

        test('should return true for unknown step', () => {
            expect(BookingWizard.validateStep(99)).toBe(true);
        });
    });

    describe('updateFormData()', () => {
        test('should not throw when elements are missing', () => {
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(() => BookingWizard.updateFormData()).not.toThrow();
        });

        test('should read selected doctor', () => {
            jest.spyOn(document, 'querySelector').mockReturnValue({ value: 'dr-ashok' });
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            BookingWizard.updateFormData();
            expect(BookingWizard.formData.doctorId).toBe('dr-ashok');
        });
    });

    describe('close()', () => {
        test('should reset currentStep', () => {
            BookingWizard.currentStep = 3;
            const mockModal = document.createElement('div');
            mockModal.id = 'booking-wizard-modal';
            jest.spyOn(document, 'getElementById').mockReturnValue(mockModal);
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            jest.spyOn(document, 'querySelectorAll').mockReturnValue([]);
            BookingWizard.close();
            expect(BookingWizard.currentStep).toBe(1);
        });

        test('should reset formData', () => {
            BookingWizard.formData.doctorId = 'dr-ashok';
            const mockModal = document.createElement('div');
            jest.spyOn(document, 'getElementById').mockReturnValue(mockModal);
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            jest.spyOn(document, 'querySelectorAll').mockReturnValue([]);
            BookingWizard.close();
            expect(BookingWizard.formData.doctorId).toBe('');
        });

        test('should not throw if modal missing', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(() => BookingWizard.close()).not.toThrow();
        });
    });

    describe('open()', () => {
        test('should remove hidden class', () => {
            const mockModal = document.createElement('div');
            mockModal.classList.add('hidden');
            jest.spyOn(document, 'getElementById').mockReturnValue(mockModal);
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            BookingWizard.open();
            expect(mockModal.classList.contains('hidden')).toBe(false);
        });

        test('should not throw if modal missing', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(() => BookingWizard.open()).not.toThrow();
        });
    });
});
