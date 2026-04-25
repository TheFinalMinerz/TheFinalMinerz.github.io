// Detect touch devices on the first tap to permanently disable conflicting desktop CSS hover effects
document.addEventListener('touchstart', function() {
    document.body.classList.add('is-touch-device');
}, { once: true });

// Utility: Throttle function for performance optimization
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}

// Utility: Debounce function for resize events
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Scroll Progress Bar & Back to Top Logic (Throttled)
const handleScroll = throttle(() => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scrollProgress').style.width = scrolled + '%';

    const backToTopBtn = document.getElementById('backToTop');
    if (winScroll > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}, 16);

window.addEventListener('scroll', handleScroll);

// Scrollspy (Active Nav Link Tracker - Throttled)
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

const handleScrollspy = throttle(() => {
    let current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 250) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active-link");
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active-link");
        }
    });
}, 16);

window.addEventListener("scroll", handleScrollspy);

// Cookie Banner Logic
window.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 2000); 
    }

    document.getElementById('acceptCookies').addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('show');
    });
});
    
// Smooth Mobile Menu Toggle Logic
const mobileToggle = document.getElementById('mobileToggle');
const mobileDropdown = document.getElementById('mobileDropdown');

mobileToggle.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    
    mobileDropdown.classList.toggle('active');
    mobileToggle.classList.toggle('is-open');
    
    if(mobileToggle.classList.contains('is-open')){
        mobileToggle.innerHTML = '✕'; 
        // Focus management: move focus to first menu item when opened
        const firstMenuItem = mobileDropdown.querySelector('a');
        if (firstMenuItem) firstMenuItem.focus();
    } else {
        mobileToggle.innerHTML = '☰';
        // Return focus to toggle button when closed
        mobileToggle.focus();
    }
});

// Close mobile dropdown when a link is clicked
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDropdown.classList.remove('active');
        mobileToggle.classList.remove('is-open');
        mobileToggle.innerHTML = '☰';
        mobileToggle.focus();
    });
});

// Keyboard navigation for mobile menu
// Accessibility: Mobile Menu Focus Trap & Escape Key
document.addEventListener('keydown', (e) => {
    if (!mobileDropdown.classList.contains('active')) return;
    
    const dropdownElements = Array.from(mobileDropdown.querySelectorAll('a, button'));
    const focusableElements = [mobileToggle, ...dropdownElements];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Escape') {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDropdown.classList.remove('active');
        mobileToggle.classList.remove('is-open');
        setTimeout(() => { if (!mobileToggle.classList.contains('is-open')) mobileToggle.innerHTML = '☰'; }, 400);
        mobileToggle.focus();
    }

    if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

// Smart Failsafe: Smoothly hide mobile menu if window is resized to desktop width
window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mobileDropdown.classList.contains('active')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDropdown.classList.remove('active');
        mobileToggle.classList.remove('is-open');
        
        setTimeout(() => {
            mobileToggle.innerHTML = '☰';
        }, 400);
    }
});

// High-Performance Smooth Scroll Reveal
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
});

window.addEventListener('load', () => {
    document.querySelectorAll('.reveal').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('active');
        }
    });
});

// Seamless AJAX Form Submission for Newsletter
const form = document.querySelector('.newsletter-form');
if (form) {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            emailInput.classList.add('touched');
        });
    }

    form.addEventListener('submit', async (e) => {
        if (emailInput) {
            emailInput.classList.add('touched');
        }
        if (!form.checkValidity()) {
            e.preventDefault();
            form.reportValidity();
            return;
        }

        e.preventDefault(); 
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = 'Sending...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                btn.innerHTML = 'Subscribed! ✓';
                btn.style.background = '#10b981'; 
                form.reset();
                console.log('Newsletter subscription successful');
            } else {
                const errorData = await response.json().catch(() => ({}));
                btn.innerHTML = errorData.message || 'Error submitting form';
                btn.style.background = '#ef4444';
                console.error('Subscription error:', errorData);
            }
        } catch (error) {
            btn.innerHTML = 'Network error - please try again';
            btn.style.background = '#ef4444';
            console.error('Newsletter submission error:', error);
        }

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = ''; 
            btn.style.opacity = '1';
        }, 3000);
    });
    
}

// Accessibility: Prevent marquee containers from auto-scrolling when tabbing quickly
document.querySelectorAll('.trust-banner').forEach(banner => {
    banner.addEventListener('scroll', function() {
        if (this.scrollLeft !== 0) {
            this.scrollLeft = 0;
        }
    }, { passive: true });
});

// --- High-Performance Universal Spotlight Effect Tracker ---
let currentSpotlightCard = null;

const updateSpotlightPosition = (card, clientX, clientY) => {
    window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
};

// 1. Desktop Mouse Tracking (Standard)
document.querySelectorAll('.hover-spotlight').forEach(element => {
    element.addEventListener('mousemove', e => {
        updateSpotlightPosition(element, e.clientX, e.clientY);
    });
});

// 2. Mobile Touch Tracking (Fluid cross-element dragging)
document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (!elementUnderFinger) return;

    const card = elementUnderFinger.closest('.hover-spotlight');

    // Fade out old card if we dragged onto a new one
    if (currentSpotlightCard && currentSpotlightCard !== card) {
        const oldOverlay = currentSpotlightCard.querySelector('.spotlight-overlay');
        if (oldOverlay) oldOverlay.style.opacity = '0';
    }

    // Update new card
    if (card) {
        const overlay = card.querySelector('.spotlight-overlay');
        if (overlay) overlay.style.opacity = '1';
        updateSpotlightPosition(card, touch.clientX, touch.clientY);
        currentSpotlightCard = card;
    } else {
        // If finger slides off all cards, clear the current one
        if(currentSpotlightCard) {
            const oldOverlay = currentSpotlightCard.querySelector('.spotlight-overlay');
            if (oldOverlay) oldOverlay.style.opacity = '0';
            currentSpotlightCard = null;
        }
    }
}, { passive: true });

// Show glow on initial tap
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementUnderFinger) return;
    
    const card = elementUnderFinger.closest('.hover-spotlight');
    if (card) {
        const overlay = card.querySelector('.spotlight-overlay');
        if (overlay) overlay.style.opacity = '1';
        updateSpotlightPosition(card, touch.clientX, touch.clientY);
        currentSpotlightCard = card;
    }
}, { passive: true });

// Clear glow when finger lifts
const clearSpotlight = () => {
    if (currentSpotlightCard) {
        const overlay = currentSpotlightCard.querySelector('.spotlight-overlay');
        if (overlay) overlay.style.opacity = '0';
        currentSpotlightCard = null;
    }
};

document.addEventListener('touchend', clearSpotlight);
document.addEventListener('touchcancel', clearSpotlight);

// --- Enterprise Mobile UX: Fluid Touch-Drag Highlighting (for marquee items) ---
let currentTouchedItem = null;
let isDragging = false;
let isNavigating = false; 

const clearAllTouches = () => {
    document.querySelectorAll('.tech-item.touch-active').forEach(item => {
        item.classList.remove('touch-active');
    });
    document.querySelectorAll('.marquee-wrapper.is-paused').forEach(wrapper => {
        wrapper.classList.remove('is-paused');
    });
    currentTouchedItem = null;
};

// Handle fluid finger dragging with GPU requestAnimationFrame for 60fps performance
document.addEventListener('touchmove', (e) => {
    if (isDragging || isNavigating) return;
    isDragging = true;
    
    window.requestAnimationFrame(() => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (!element) {
            clearAllTouches();
        } else {
            const techItem = element.closest('.tech-item');
            if (techItem !== currentTouchedItem) {
                clearAllTouches();
                if (techItem) {
                    techItem.classList.add('touch-active');
                    
                    const wrapper = techItem.closest('.marquee-wrapper');
                    if (wrapper) wrapper.classList.add('is-paused');
                    
                    currentTouchedItem = techItem;
                }
            }
        }
        isDragging = false;
    });
}, { passive: true });

// Handle initial tap
document.addEventListener('touchstart', (e) => {
    if (isNavigating) return;
    const techItem = e.target.closest('.tech-item');
    clearAllTouches(); 
    
    if (techItem) {
        techItem.classList.add('touch-active');
        
        const wrapper = techItem.closest('.marquee-wrapper');
        if (wrapper) wrapper.classList.add('is-paused');
        
        currentTouchedItem = techItem;
    }
}, { passive: true });

// Clean up when finger lifts 
document.addEventListener('touchend', () => {
    setTimeout(() => {
        if (!isNavigating) clearAllTouches();
    }, 300);
});

document.addEventListener('touchcancel', () => {
    setTimeout(() => {
        if (!isNavigating) clearAllTouches();
    }, 300);
});

// THE HOLY GRAIL: Defeating Mobile Focus-Snap natively
document.querySelectorAll('.tech-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        if (isNavigating) return;
        isNavigating = true; 
        
        this.classList.add('touch-active');
        const wrapper = this.closest('.marquee-wrapper');
        if (wrapper) wrapper.classList.add('is-paused');
        
        const href = this.getAttribute('href');
        const target = this.getAttribute('target');
        
        setTimeout(() => {
            if (href && href.startsWith('#')) {
                window.location.href = href;
            } else if (href) {
                window.open(href, target || '_self', 'noopener,noreferrer');
            }
            
            setTimeout(() => {
                isNavigating = false; 
                clearAllTouches();
            }, 1000); 
            
        }, 50);
    });
});

// --- Theme Personalization Engine ---
const themeBtn = document.querySelector('.theme-toggle-btn');
const themePanel = document.querySelector('.theme-panel');
const themeModeToggle = document.getElementById('themeMode');
const color1Picker = document.getElementById('color1Picker');
const color2Picker = document.getElementById('color2Picker');
const animTypeSelect = document.getElementById('animType');
const animSpeedSlider = document.getElementById('animSpeed');
const animToggle = document.getElementById('animToggle');
const resetThemeBtn = document.getElementById('resetTheme');

const defaultColor1 = '#3b82f6';
const defaultColor2 = '#8b5cf6';
const defaultSpeed = '20'; // Seconds
const defaultAnimType = 'effect-float';

// Toggle Panel Visibility
if (themeBtn && themePanel) {
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themePanel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!themePanel.contains(e.target) && !themeBtn.contains(e.target)) {
            themePanel.classList.remove('active');
        }
    });
}

// Global Color Application
const updateColors = (c1, c2) => {
    document.documentElement.style.setProperty('--color-1', c1);
    document.documentElement.style.setProperty('--color-2', c2);
    
    localStorage.setItem('themeColor1', c1);
    localStorage.setItem('themeColor2', c2);
}

if (color1Picker && color2Picker) {
    color1Picker.addEventListener('input', (e) => updateColors(e.target.value, color2Picker.value));
    color2Picker.addEventListener('input', (e) => updateColors(color1Picker.value, e.target.value));
}

// Light/Dark Mode
if (themeModeToggle) {
    themeModeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('light-mode');
            localStorage.setItem('themeMode', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('themeMode', 'dark');
        }
    });
}

// Background Animation Type
if (animTypeSelect) {
    animTypeSelect.addEventListener('change', (e) => {
        document.body.classList.remove('effect-float', 'effect-pulse', 'effect-orbit');
        document.body.classList.add(e.target.value);
        localStorage.setItem('animType', e.target.value);
    });
}

// Background Animation Speed
if (animSpeedSlider) {
    animSpeedSlider.addEventListener('input', (e) => {
        const speedStr = e.target.value + 's';
        document.documentElement.style.setProperty('--anim-duration', speedStr);
        localStorage.setItem('animSpeed', e.target.value);
    });
}

// Background Animation Enable/Disable
if (animToggle) {
    animToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.remove('disable-bg-animation');
            localStorage.setItem('bgAnimation', 'enabled');
        } else {
            document.body.classList.add('disable-bg-animation');
            localStorage.setItem('bgAnimation', 'disabled');
        }
    });
}

// Factory Reset
if (resetThemeBtn) {
    resetThemeBtn.addEventListener('click', () => {
        color1Picker.value = defaultColor1;
        color2Picker.value = defaultColor2;
        updateColors(defaultColor1, defaultColor2);
        
        if (animTypeSelect) animTypeSelect.value = defaultAnimType;
        document.body.classList.remove('effect-float', 'effect-pulse', 'effect-orbit');
        document.body.classList.add(defaultAnimType);
        localStorage.setItem('animType', defaultAnimType);
        
        animSpeedSlider.value = defaultSpeed;
        document.documentElement.style.setProperty('--anim-duration', defaultSpeed + 's');
        localStorage.setItem('animSpeed', defaultSpeed);
        
        animToggle.checked = true;
        document.body.classList.remove('disable-bg-animation');
        localStorage.setItem('bgAnimation', 'enabled');
        
        themeModeToggle.checked = false;
        document.body.classList.remove('light-mode');
        localStorage.setItem('themeMode', 'dark');
    });
}

// Boot Sequencer (Load User Preferences)
window.addEventListener('DOMContentLoaded', () => {
    const savedC1 = localStorage.getItem('themeColor1');
    const savedC2 = localStorage.getItem('themeColor2');
    const savedMode = localStorage.getItem('themeMode');
    const savedAnimType = localStorage.getItem('animType') || defaultAnimType;
    const savedSpeed = localStorage.getItem('animSpeed');
    const savedAnim = localStorage.getItem('bgAnimation');

    if (savedC1 && savedC2) {
        if(color1Picker) color1Picker.value = savedC1;
        if(color2Picker) color2Picker.value = savedC2;
        updateColors(savedC1, savedC2);
    }
    
    if (savedMode === 'light') {
        if (themeModeToggle) themeModeToggle.checked = true;
        document.body.classList.add('light-mode');
    }

    if (animTypeSelect) animTypeSelect.value = savedAnimType;
    document.body.classList.add(savedAnimType);

    if (savedSpeed) {
        if (animSpeedSlider) animSpeedSlider.value = savedSpeed;
        document.documentElement.style.setProperty('--anim-duration', savedSpeed + 's');
    }

    if (savedAnim === 'disabled') {
        if(animToggle) animToggle.checked = false;
        document.body.classList.add('disable-bg-animation');
    }
});