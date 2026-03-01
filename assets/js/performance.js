/**
 * Performance Optimization Script
 * Handles lazy loading, resource hints, and performance monitoring
 */

(function() {
    'use strict';

    /**
     * Lazy load images
     */
    function setupLazyLoading() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Load image
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Load srcset
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        // Remove loading class
                        img.classList.remove('lazy-loading');
                        img.classList.add('lazy-loaded');
                        
                        // Stop observing
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // Observe all lazy images
            document.querySelectorAll('img[data-src], img[data-srcset]').forEach((img) => {
                img.classList.add('lazy-loading');
                imageObserver.observe(img);
            });
        } else {
            // Fallback: load all images immediately
            document.querySelectorAll('img[data-src]').forEach((img) => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    /**
     * Preload critical resources
     */
    function preloadCriticalResources() {
        // Preload fonts
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];
        
        fonts.forEach((fontUrl) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = fontUrl;
            document.head.appendChild(link);
        });
    }

    /**
     * Defer non-critical CSS
     */
    function deferNonCriticalCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
        
        stylesheets.forEach((stylesheet) => {
            stylesheet.media = 'print';
            stylesheet.onload = function() {
                this.media = 'all';
            };
        });
    }

    /**
     * Monitor Core Web Vitals
     */
    function monitorWebVitals() {
        // Check if web-vitals library is available
        if (typeof webVitals !== 'undefined') {
            // Largest Contentful Paint
            webVitals.getLCP((metric) => {
                console.log('[Performance] LCP:', metric.value);
                sendToAnalytics('LCP', metric.value);
            });
            
            // First Input Delay
            webVitals.getFID((metric) => {
                console.log('[Performance] FID:', metric.value);
                sendToAnalytics('FID', metric.value);
            });
            
            // Cumulative Layout Shift
            webVitals.getCLS((metric) => {
                console.log('[Performance] CLS:', metric.value);
                sendToAnalytics('CLS', metric.value);
            });
            
            // First Contentful Paint
            webVitals.getFCP((metric) => {
                console.log('[Performance] FCP:', metric.value);
                sendToAnalytics('FCP', metric.value);
            });
            
            // Time to First Byte
            webVitals.getTTFB((metric) => {
                console.log('[Performance] TTFB:', metric.value);
                sendToAnalytics('TTFB', metric.value);
            });
        } else {
            // Fallback: Use Performance API
            monitorWithPerformanceAPI();
        }
    }

    /**
     * Monitor with Performance API
     */
    function monitorWithPerformanceAPI() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const connectTime = perfData.responseEnd - perfData.requestStart;
                    const renderTime = perfData.domComplete - perfData.domLoading;
                    
                    console.log('[Performance] Page Load Time:', pageLoadTime, 'ms');
                    console.log('[Performance] Connect Time:', connectTime, 'ms');
                    console.log('[Performance] Render Time:', renderTime, 'ms');
                    
                    sendToAnalytics('page_load_time', pageLoadTime);
                }, 0);
            });
        }
    }

    /**
     * Send metrics to analytics
     */
    function sendToAnalytics(metricName, value) {
        if (typeof gtag === 'function') {
            gtag('event', 'web_vitals', {
                'event_category': 'Performance',
                'event_label': metricName,
                'value': Math.round(value),
                'non_interaction': true
            });
        }
    }

    /**
     * Optimize third-party scripts
     */
    function optimizeThirdPartyScripts() {
        // Defer loading of non-critical scripts
        const scripts = document.querySelectorAll('script[data-defer]');
        
        scripts.forEach((script) => {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src || script.src;
            newScript.async = true;
            
            if (script.dataset.defer === 'idle') {
                // Load on idle
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        document.body.appendChild(newScript);
                    });
                } else {
                    setTimeout(() => {
                        document.body.appendChild(newScript);
                    }, 2000);
                }
            } else {
                // Load on interaction
                const loadScript = () => {
                    document.body.appendChild(newScript);
                    document.removeEventListener('scroll', loadScript);
                    document.removeEventListener('mousemove', loadScript);
                    document.removeEventListener('touchstart', loadScript);
                };
                
                document.addEventListener('scroll', loadScript, { once: true, passive: true });
                document.addEventListener('mousemove', loadScript, { once: true, passive: true });
                document.addEventListener('touchstart', loadScript, { once: true, passive: true });
            }
        });
    }

    /**
     * Prefetch next pages
     */
    function prefetchNextPages() {
        // Prefetch likely next pages on hover
        const links = document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]');
        
        links.forEach((link) => {
            link.addEventListener('mouseenter', function() {
                const href = this.getAttribute('href');
                
                // Check if already prefetched
                if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                    return;
                }
                
                // Create prefetch link
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
            }, { once: true });
        });
    }

    /**
     * Optimize animations
     */
    function optimizeAnimations() {
        // Respect prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
            
            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
                .reduce-motion *,
                .reduce-motion *::before,
                .reduce-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Resource hints for external domains
     */
    function addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];
        
        hints.forEach((hint) => {
            // Check if hint already exists
            const selector = `link[rel="${hint.rel}"][href="${hint.href}"]`;
            if (document.querySelector(selector)) {
                return;
            }
            
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossorigin) {
                link.crossOrigin = '';
            }
            document.head.appendChild(link);
        });
    }

    /**
     * Optimize scroll performance
     */
    function optimizeScrollPerformance() {
        // Use passive event listeners for scroll
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Handle scroll events here
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Memory management
     */
    function setupMemoryManagement() {
        // Clear caches on memory pressure (if supported)
        if ('memory' in performance && 'onmemorywarning' in window) {
            window.addEventListener('memorywarning', () => {
                console.log('[Performance] Memory warning - clearing caches');
                
                // Clear image cache
                document.querySelectorAll('img.lazy-loaded').forEach((img) => {
                    if (!isInViewport(img)) {
                        img.src = '';
                        img.dataset.src = img.currentSrc;
                        img.classList.remove('lazy-loaded');
                        img.classList.add('lazy-loading');
                    }
                });
            });
        }
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Performance budget monitoring
     */
    function monitorPerformanceBudget() {
        if ('PerformanceObserver' in window) {
            // Monitor long tasks
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('[Performance] Long task detected:', entry.duration, 'ms');
                            sendToAnalytics('long_task', entry.duration);
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }
        }
    }

    /**
     * Initialize performance optimizations
     */
    function init() {
        // Run immediately
        addResourceHints();
        optimizeAnimations();
        optimizeScrollPerformance();
        
        // Run on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setupLazyLoading();
                deferNonCriticalCSS();
                optimizeThirdPartyScripts();
                prefetchNextPages();
                setupMemoryManagement();
            });
        } else {
            setupLazyLoading();
            deferNonCriticalCSS();
            optimizeThirdPartyScripts();
            prefetchNextPages();
            setupMemoryManagement();
        }
        
        // Run on load
        window.addEventListener('load', () => {
            monitorWebVitals();
            monitorPerformanceBudget();
        });
    }

    // Initialize
    init();

    // Public API
    window.Performance = {
        prefetch: (url) => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        },
        preload: (url, as) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = as;
            document.head.appendChild(link);
        },
        getMetrics: () => {
            if ('performance' in window) {
                return {
                    navigation: performance.getEntriesByType('navigation')[0],
                    paint: performance.getEntriesByType('paint'),
                    resources: performance.getEntriesByType('resource')
                };
            }
            return null;
        }
    };

})();
