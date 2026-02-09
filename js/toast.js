// ============================================
// ADINATH HOSPITAL - Toast Notification System
// Modern, accessible toast notifications
// ============================================

const Toast = {
    container: null,

    // Initialize toast container
    init() {
        if (this.container) {
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.setAttribute('role', 'alert');
        this.container.setAttribute('aria-live', 'polite');
        this.container.innerHTML = '';
        document.body.appendChild(this.container);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }
            
            @media (max-width: 480px) {
                #toast-container {
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
            }
            
            .toast {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                background: white;
                animation: toastSlideIn 0.3s ease-out;
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }
            
            .toast::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
            }
            
            .toast.success::before { background: #22c55e; }
            .toast.error::before { background: #ef4444; }
            .toast.warning::before { background: #c4704b; }
            .toast.info::before { background: #3b82f6; }
            
            .toast-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }
            
            .toast-content {
                flex: 1;
            }
            
            .toast-title {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 2px;
            }
            
            .toast-message {
                color: #64748b;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                color: #94a3b8;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .toast-close:hover {
                color: #475569;
            }
            
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                animation: toastProgress linear forwards;
            }
            
            @keyframes toastSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes toastSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes toastProgress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    },

    // Show toast
    show(options) {
        this.init();

        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            closable = true,
        } = typeof options === 'string' ? { message: options } : options;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            ${closable ? '<button class="toast-close" aria-label="Close">&times;</button>' : ''}
            ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms"></div>` : ''}
        `;

        // Close button handler
        if (closable) {
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.dismiss(toast);
            });
        }

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        this.container.appendChild(toast);
        return toast;
    },

    // Dismiss toast
    dismiss(toast) {
        if (!toast || !toast.parentNode) {
            return;
        }

        toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    // Convenience methods
    success(message, title = 'Success') {
        return this.show({ type: 'success', title, message });
    },

    error(message, title = 'Error') {
        return this.show({ type: 'error', title, message });
    },

    warning(message, title = 'Warning') {
        return this.show({ type: 'warning', title, message });
    },

    info(message, title = 'Info') {
        return this.show({ type: 'info', title, message });
    },
};

// Loading state manager
const Loading = {
    // Show loading on button
    start(button, text = 'Loading...') {
        if (!button) {
            return;
        }

        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            ${text}
        `;
        button.classList.add('is-loading');

        // Add spinner styles if not exists
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: currentColor;
                    animation: spin 0.8s linear infinite;
                    margin-right: 8px;
                }
                
                .is-loading {
                    opacity: 0.8;
                    cursor: not-allowed;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: skeleton 1.5s ease-in-out infinite;
                    border-radius: 4px;
                }
                
                @keyframes skeleton {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Stop loading on button
    stop(button) {
        if (!button) {
            return;
        }

        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
        button.classList.remove('is-loading');
        delete button.dataset.originalText;
    },

    // Show page-level loading overlay
    showOverlay(message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner-large"></div>
                    <div class="loading-text">${message}</div>
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                #loading-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                    backdrop-filter: blur(4px);
                }
                
                .loading-content {
                    text-align: center;
                }
                
                .loading-spinner-large {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e2e8f0;
                    border-radius: 50%;
                    border-top-color: #8b5cf6;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 16px;
                }
                
                .loading-text {
                    color: #64748b;
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-text').textContent = message;
            overlay.style.display = 'flex';
        }
    },

    // Hide page-level loading overlay
    hideOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },
};

// Export for global use
window.Toast = Toast;
window.Loading = Loading;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Toast.init());
} else {
    Toast.init();
}
