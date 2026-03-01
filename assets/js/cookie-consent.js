/**
 * Cookie Consent Manager
 * GDPR & CCPA Compliant Cookie Consent Solution
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // Configuration
    const COOKIE_NAME = 'cookieConsent';
    const COOKIE_EXPIRY_DAYS = 365;

    // State
    let consentData = {
        essential: true,  // Always true
        analytics: false,
        preference: true,
        timestamp: null,
        version: '1.0'
    };

    /**
     * Initialize Cookie Consent
     */
    function initCookieConsent() {
        // Check if consent already given
        const existingConsent = getConsent();
        
        if (existingConsent) {
            consentData = existingConsent;
            applyConsent();
            showSettingsButton();
        } else {
            showBanner();
        }

        // Setup event listeners
        setupEventListeners();
    }

    /**
     * Setup Event Listeners
     */
    function setupEventListeners() {
        // Banner buttons
        const acceptAllBtn = document.getElementById('cookieAcceptAll');
        const rejectBtn = document.getElementById('cookieReject');
        const customizeBtn = document.getElementById('cookieCustomize');

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', acceptAll);
        }
        if (rejectBtn) {
            rejectBtn.addEventListener('click', rejectNonEssential);
        }
        if (customizeBtn) {
            customizeBtn.addEventListener('click', showPreferences);
        }

        // Modal buttons
        const savePrefsBtn = document.getElementById('cookieSavePreferences');
        const acceptAllModalBtn = document.getElementById('cookieAcceptAllModal');
        const closeModalBtn = document.getElementById('cookieModalClose');
        const modalOverlay = document.getElementById('cookieModalOverlay');

        if (savePrefsBtn) {
            savePrefsBtn.addEventListener('click', savePreferences);
        }
        if (acceptAllModalBtn) {
            acceptAllModalBtn.addEventListener('click', acceptAllFromModal);
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hidePreferences);
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', hidePreferences);
        }

        // Settings button
        const settingsBtn = document.getElementById('cookieSettingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', showPreferences);
        }

        // Keyboard accessibility for modal
        document.addEventListener('keydown', function(e) {
            const modal = document.getElementById('cookiePreferences');
            if (modal && modal.style.display !== 'none' && e.key === 'Escape') {
                hidePreferences();
            }
        });
    }

    /**
     * Accept All Cookies
     */
    function acceptAll() {
        consentData = {
            essential: true,
            analytics: true,
            preference: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        saveConsent();
        hideBanner();
        applyConsent();
        showSettingsButton();
        
        // Track consent
        trackConsentEvent('accept_all');
    }

    /**
     * Reject Non-Essential Cookies
     */
    function rejectNonEssential() {
        consentData = {
            essential: true,
            analytics: false,
            preference: false,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        saveConsent();
        hideBanner();
        applyConsent();
        showSettingsButton();
        
        // Track consent
        trackConsentEvent('reject_non_essential');
    }

    /**
     * Show Preferences Modal
     */
    function showPreferences() {
        hideBanner();
        const modal = document.getElementById('cookiePreferences');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Set current preferences
            const analyticsToggle = document.getElementById('analyticsToggle');
            const preferenceToggle = document.getElementById('preferenceToggle');
            
            if (analyticsToggle) {
                analyticsToggle.checked = consentData.analytics;
            }
            if (preferenceToggle) {
                preferenceToggle.checked = consentData.preference;
            }

            // Focus first interactive element
            const firstButton = modal.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }
    }

    /**
     * Hide Preferences Modal
     */
    function hidePreferences() {
        const modal = document.getElementById('cookiePreferences');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Save Preferences from Modal
     */
    function savePreferences() {
        const analyticsToggle = document.getElementById('analyticsToggle');
        const preferenceToggle = document.getElementById('preferenceToggle');

        consentData = {
            essential: true,
            analytics: analyticsToggle ? analyticsToggle.checked : false,
            preference: preferenceToggle ? preferenceToggle.checked : true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        saveConsent();
        hidePreferences();
        applyConsent();
        showSettingsButton();
        
        // Track consent
        trackConsentEvent('save_preferences');
    }

    /**
     * Accept All from Modal
     */
    function acceptAllFromModal() {
        consentData = {
            essential: true,
            analytics: true,
            preference: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        saveConsent();
        hidePreferences();
        applyConsent();
        showSettingsButton();
        
        // Track consent
        trackConsentEvent('accept_all_modal');
    }

    /**
     * Show Banner
     */
    function showBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'block';
            // Announce to screen readers
            banner.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide Banner
     */
    function hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'none';
            banner.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Show Settings Button
     */
    function showSettingsButton() {
        const btn = document.getElementById('cookieSettingsBtn');
        if (btn) {
            btn.style.display = 'flex';
        }
    }

    /**
     * Save Consent to Storage
     */
    function saveConsent() {
        try {
            localStorage.setItem(COOKIE_NAME, JSON.stringify(consentData));
            
            // Also set a cookie for server-side detection
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
            document.cookie = `${COOKIE_NAME}=${JSON.stringify(consentData)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax; Secure`;
        } catch (e) {
            console.error('Failed to save cookie consent:', e);
        }
    }

    /**
     * Get Consent from Storage
     */
    function getConsent() {
        try {
            const stored = localStorage.getItem(COOKIE_NAME);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to read cookie consent:', e);
        }
        return null;
    }

    /**
     * Apply Consent Settings
     */
    function applyConsent() {
        // Analytics
        if (consentData.analytics) {
            enableAnalytics();
        } else {
            disableAnalytics();
        }

        // Preferences
        if (consentData.preference) {
            enablePreferences();
        } else {
            disablePreferences();
        }

        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: consentData
        }));
    }

    /**
     * Enable Analytics
     */
    function enableAnalytics() {
        // Load Google Analytics if not already loaded
        if (typeof gtag === 'undefined' && !document.querySelector('script[src*="googletagmanager"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
            document.head.appendChild(script);

            script.onload = function() {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX', {
                    'anonymize_ip': true,
                    'cookie_flags': 'SameSite=None;Secure'
                });
            };
        }
    }

    /**
     * Disable Analytics
     */
    function disableAnalytics() {
        // Set GA opt-out
        window['ga-disable-G-XXXXXXXXXX'] = true;
        
        // Delete GA cookies
        deleteCookie('_ga');
        deleteCookie('_gid');
        deleteCookie('_gat');
    }

    /**
     * Enable Preferences
     */
    function enablePreferences() {
        // Preferences are enabled by default
        // This function is here for consistency
    }

    /**
     * Disable Preferences
     */
    function disablePreferences() {
        // Remove preference cookies
        deleteCookie('theme');
    }

    /**
     * Delete Cookie
     */
    function deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    /**
     * Track Consent Event
     */
    function trackConsentEvent(action) {
        if (typeof gtag === 'function' && consentData.analytics) {
            gtag('event', 'cookie_consent', {
                'event_category': 'Cookie Consent',
                'event_label': action
            });
        }
    }

    /**
     * Public API
     */
    window.CookieConsent = {
        init: initCookieConsent,
        getConsent: getConsent,
        updateConsent: function(newConsent) {
            consentData = { ...consentData, ...newConsent };
            saveConsent();
            applyConsent();
        },
        showPreferences: showPreferences,
        revokeConsent: function() {
            localStorage.removeItem(COOKIE_NAME);
            deleteCookie(COOKIE_NAME);
            consentData = {
                essential: true,
                analytics: false,
                preference: false,
                timestamp: null,
                version: '1.0'
            };
            showBanner();
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieConsent);
    } else {
        initCookieConsent();
    }

    // Make init function globally available
    window.initCookieConsent = initCookieConsent;

})();
