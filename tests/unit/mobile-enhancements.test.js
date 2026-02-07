/**
 * MOBILE ENHANCEMENTS Unit Tests
 */

// Mock BookingWizard
global.BookingWizard = { open: jest.fn() };

// Set mobile width before loading module
window.innerWidth = 375;
window.innerHeight = 667;

// Load module
const MobileEnhancements = require('../../js/mobile-enhancements.js');

describe('MobileEnhancements', () => {
    describe('Module Structure', () => {
        test('should be defined', () => {
            expect(MobileEnhancements).toBeDefined();
        });

        test('should have init method', () => {
            expect(typeof MobileEnhancements.init).toBe('function');
        });

        test('should have createStickyActionButtons method', () => {
            expect(typeof MobileEnhancements.createStickyActionButtons).toBe('function');
        });

        test('should have setupScrollListener method', () => {
            expect(typeof MobileEnhancements.setupScrollListener).toBe('function');
        });

        test('should have improveMobileNav method', () => {
            expect(typeof MobileEnhancements.improveMobileNav).toBe('function');
        });

        test('should have optimizeTouchTargets method', () => {
            expect(typeof MobileEnhancements.optimizeTouchTargets).toBe('function');
        });

        test('should have setStickyEnabled method', () => {
            expect(typeof MobileEnhancements.setStickyEnabled).toBe('function');
        });

        test('should have isMobile method', () => {
            expect(typeof MobileEnhancements.isMobile).toBe('function');
        });

        test('should have getViewport method', () => {
            expect(typeof MobileEnhancements.getViewport).toBe('function');
        });
    });

    describe('Config', () => {
        test('should have stickyButtonsThreshold of 300', () => {
            expect(MobileEnhancements.config.stickyButtonsThreshold).toBe(300);
        });

        test('should have stickEnabled true by default', () => {
            expect(MobileEnhancements.config.stickEnabled).toBe(true);
        });
    });

    describe('isMobile()', () => {
        test('should return true for 375px', () => {
            window.innerWidth = 375;
            expect(MobileEnhancements.isMobile()).toBe(true);
        });

        test('should return true at 768px', () => {
            window.innerWidth = 768;
            expect(MobileEnhancements.isMobile()).toBe(true);
        });

        test('should return false for 1200px', () => {
            window.innerWidth = 1200;
            expect(MobileEnhancements.isMobile()).toBe(false);
        });

        test('should return false for 769px', () => {
            window.innerWidth = 769;
            expect(MobileEnhancements.isMobile()).toBe(false);
        });
    });

    describe('getViewport()', () => {
        test('should detect mobile', () => {
            window.innerWidth = 375;
            window.innerHeight = 667;
            const vp = MobileEnhancements.getViewport();
            expect(vp.width).toBe(375);
            expect(vp.height).toBe(667);
            expect(vp.isMobile).toBe(true);
            expect(vp.isTablet).toBe(false);
            expect(vp.isDesktop).toBe(false);
        });

        test('should detect tablet at 900px', () => {
            window.innerWidth = 900;
            const vp = MobileEnhancements.getViewport();
            expect(vp.isTablet).toBe(true);
            expect(vp.isMobile).toBe(false);
            expect(vp.isDesktop).toBe(false);
        });

        test('should detect desktop at 1200px', () => {
            window.innerWidth = 1200;
            const vp = MobileEnhancements.getViewport();
            expect(vp.isDesktop).toBe(true);
            expect(vp.isMobile).toBe(false);
            expect(vp.isTablet).toBe(false);
        });

        test('should detect tablet at 1024px', () => {
            window.innerWidth = 1024;
            const vp = MobileEnhancements.getViewport();
            expect(vp.isTablet).toBe(true);
            expect(vp.isDesktop).toBe(false);
        });

        test('should detect desktop at 1025px', () => {
            window.innerWidth = 1025;
            const vp = MobileEnhancements.getViewport();
            expect(vp.isDesktop).toBe(true);
        });
    });

    describe('setStickyEnabled()', () => {
        test('should set config to disabled', () => {
            MobileEnhancements.setStickyEnabled(false);
            expect(MobileEnhancements.config.stickEnabled).toBe(false);
        });

        test('should set config to enabled', () => {
            MobileEnhancements.config.stickEnabled = false;
            MobileEnhancements.setStickyEnabled(true);
            expect(MobileEnhancements.config.stickEnabled).toBe(true);
        });

        test('should add hidden class when disabled', () => {
            const mockEl = document.createElement('div');
            jest.spyOn(document, 'getElementById').mockReturnValue(mockEl);
            MobileEnhancements.setStickyEnabled(false);
            expect(mockEl.classList.contains('hidden')).toBe(true);
        });

        test('should remove hidden class when enabled', () => {
            const mockEl = document.createElement('div');
            mockEl.classList.add('hidden');
            jest.spyOn(document, 'getElementById').mockReturnValue(mockEl);
            MobileEnhancements.setStickyEnabled(true);
            expect(mockEl.classList.contains('hidden')).toBe(false);
        });

        test('should handle missing element', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(() => MobileEnhancements.setStickyEnabled(false)).not.toThrow();
        });
    });

    describe('createStickyActionButtons()', () => {
        test('should not append to body on desktop', () => {
            window.innerWidth = 1024;
            const spy = jest.spyOn(document.body, 'appendChild');
            MobileEnhancements.createStickyActionButtons();
            expect(spy).not.toHaveBeenCalled();
        });

        test('should append to body on mobile', () => {
            window.innerWidth = 375;
            const spy = jest.spyOn(document.body, 'appendChild');
            MobileEnhancements.createStickyActionButtons();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('setupScrollListener()', () => {
        test('should not throw when no sticky-actions', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            expect(() => MobileEnhancements.setupScrollListener()).not.toThrow();
        });
    });

    describe('improveMobileNav()', () => {
        test('should not throw when elements missing', () => {
            jest.spyOn(document, 'querySelector').mockReturnValue(null);
            expect(() => MobileEnhancements.improveMobileNav()).not.toThrow();
        });
    });
});
