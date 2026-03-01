/**
 * PWA Installation Handler
 * Manages service worker registration and install prompts
 */

(function() {
    'use strict';

    let deferredPrompt;
    let installButton;

    /**
     * Register Service Worker
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/service-worker.js')
                    .then((registration) => {
                        console.log('[PWA] Service Worker registered:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New service worker available
                                    showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('[PWA] Service Worker registration failed:', error);
                    });
            });
        }
    }

    /**
     * Show update notification
     */
    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.id = 'pwa-update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgb(var(--bg-primary));
                border: 2px solid rgb(var(--accent-color));
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                max-width: 320px;
            ">
                <p style="margin: 0 0 12px 0; color: rgb(var(--text-primary)); font-size: 14px; font-weight: 600;">
                    Update Available
                </p>
                <p style="margin: 0 0 12px 0; color: rgb(var(--text-secondary)); font-size: 13px;">
                    A new version of this site is available.
                </p>
                <div style="display: flex; gap: 8px;">
                    <button id="pwa-update-btn" style="
                        flex: 1;
                        padding: 8px 16px;
                        background: rgb(var(--accent-color));
                        color: rgb(var(--bg-primary));
                        border: none;
                        border-radius: 4px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Refresh
                    </button>
                    <button id="pwa-dismiss-btn" style="
                        padding: 8px 16px;
                        background: transparent;
                        color: rgb(var(--text-secondary));
                        border: 1px solid rgb(var(--border-color));
                        border-radius: 4px;
                        font-size: 13px;
                        cursor: pointer;
                    ">
                        Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Handle install prompt
     */
    function setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default install prompt
            e.preventDefault();
            
            // Store the event for later use
            deferredPrompt = e;
            
            // Show custom install button
            showInstallButton();
            
            console.log('[PWA] Install prompt available');
        });
    }

    /**
     * Show install button
     */
    function showInstallButton() {
        // Check if button already exists
        if (document.getElementById('pwa-install-button')) {
            return;
        }
        
        // Create install button
        installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.innerHTML = `
            <span style="margin-right: 8px;">📱</span>
            Install App
        `;
        installButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            padding: 12px 20px;
            background: rgb(var(--accent-color));
            color: rgb(var(--bg-primary));
            border: none;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9997;
            display: flex;
            align-items: center;
            transition: all 0.2s;
        `;
        
        installButton.addEventListener('mouseenter', () => {
            installButton.style.transform = 'scale(1.05)';
            installButton.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
        });
        
        installButton.addEventListener('mouseleave', () => {
            installButton.style.transform = 'scale(1)';
            installButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
        
        installButton.addEventListener('click', handleInstallClick);
        
        document.body.appendChild(installButton);
    }

    /**
     * Handle install button click
     */
    async function handleInstallClick() {
        if (!deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`[PWA] User response: ${outcome}`);
        
        // Track installation
        if (typeof gtag === 'function') {
            gtag('event', 'pwa_install', {
                'event_category': 'PWA',
                'event_label': outcome
            });
        }
        
        // Clear the deferred prompt
        deferredPrompt = null;
        
        // Hide the install button
        if (installButton) {
            installButton.remove();
        }
    }

    /**
     * Handle app installed event
     */
    function setupAppInstalledHandler() {
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            
            // Hide install button
            if (installButton) {
                installButton.remove();
            }
            
            // Track installation
            if (typeof gtag === 'function') {
                gtag('event', 'pwa_installed', {
                    'event_category': 'PWA',
                    'event_label': 'success'
                });
            }
            
            // Show thank you message
            showInstallThankYou();
        });
    }

    /**
     * Show thank you message after installation
     */
    function showInstallThankYou() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgb(var(--bg-primary));
                border: 2px solid rgb(var(--accent-color));
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                max-width: 320px;
                animation: slideIn 0.3s ease-out;
            ">
                <p style="margin: 0; color: rgb(var(--text-primary)); font-size: 14px; font-weight: 600;">
                    ✅ App Installed!
                </p>
                <p style="margin: 8px 0 0 0; color: rgb(var(--text-secondary)); font-size: 13px;">
                    You can now access this portfolio from your home screen.
                </p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    /**
     * Check if running as PWA
     */
    function checkIfPWA() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone ||
                           document.referrer.includes('android-app://');
        
        if (isStandalone) {
            console.log('[PWA] Running as installed app');
            
            // Add PWA class to body
            document.body.classList.add('pwa-mode');
            
            // Track PWA usage
            if (typeof gtag === 'function') {
                gtag('event', 'pwa_usage', {
                    'event_category': 'PWA',
                    'event_label': 'standalone'
                });
            }
        }
    }

    /**
     * Handle offline/online status
     */
    function setupConnectionHandlers() {
        window.addEventListener('online', () => {
            console.log('[PWA] Back online');
            showConnectionStatus('online');
        });
        
        window.addEventListener('offline', () => {
            console.log('[PWA] Gone offline');
            showConnectionStatus('offline');
        });
    }

    /**
     * Show connection status
     */
    function showConnectionStatus(status) {
        const existing = document.getElementById('connection-status');
        if (existing) {
            existing.remove();
        }
        
        const statusBar = document.createElement('div');
        statusBar.id = 'connection-status';
        statusBar.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                padding: 12px;
                background: ${status === 'online' ? '#10b981' : '#ef4444'};
                color: white;
                text-align: center;
                font-size: 14px;
                font-weight: 600;
                z-index: 10001;
                animation: slideDown 0.3s ease-out;
            ">
                ${status === 'online' ? '✓ Back online' : '⚠ You are offline'}
            </div>
        `;
        
        document.body.appendChild(statusBar);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            statusBar.remove();
        }, 3000);
    }

    /**
     * Initialize PWA features
     */
    function init() {
        registerServiceWorker();
        setupInstallPrompt();
        setupAppInstalledHandler();
        checkIfPWA();
        setupConnectionHandlers();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    window.PWA = {
        showInstallPrompt: () => {
            if (deferredPrompt) {
                handleInstallClick();
            } else {
                console.log('[PWA] Install prompt not available');
            }
        },
        isInstalled: () => {
            return window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone;
        },
        getServiceWorkerVersion: async () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                return new Promise((resolve) => {
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = (event) => {
                        resolve(event.data.version);
                    };
                    navigator.serviceWorker.controller.postMessage(
                        { type: 'GET_VERSION' },
                        [messageChannel.port2]
                    );
                });
            }
            return null;
        }
    };

})();
