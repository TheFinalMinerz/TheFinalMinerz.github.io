// Remove FOUC class natively on startup
window.addEventListener('load', () => {
    setTimeout(() => {
        document.documentElement.classList.remove('preload');
        document.body.classList.remove('preload'); 
    }, 100);
});

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

// Scroll Progress Bar & Back to Top Logic
const handleScroll = throttle(() => {
    const winScroll = window.scrollY;
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

window.addEventListener('scroll', handleScroll, { passive: true });

// Scrollspy (Active Nav Link Tracker)
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

const handleScrollspy = throttle(() => {
    let current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 250) {
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

window.addEventListener("scroll", handleScrollspy, { passive: true });

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
        const firstMenuItem = mobileDropdown.querySelector('a');
        if (firstMenuItem) firstMenuItem.focus();
    } else {
        mobileToggle.innerHTML = '☰';
        mobileToggle.focus();
    }
});

document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDropdown.classList.remove('active');
        mobileToggle.classList.remove('is-open');
        mobileToggle.innerHTML = '☰';
    });
});

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
        if (e.shiftKey) { 
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else { 
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mobileDropdown.classList.contains('active')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDropdown.classList.remove('active');
        mobileToggle.classList.remove('is-open');
        
        setTimeout(() => {
            mobileToggle.innerHTML = '☰';
        }, 400);
    }
}, { passive: true });

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
            } else {
                const errorData = await response.json().catch(() => ({}));
                btn.innerHTML = errorData.message || 'Error submitting form';
                btn.style.background = '#ef4444';
            }
        } catch (error) {
            btn.innerHTML = 'Network error - please try again';
            btn.style.background = '#ef4444';
        }

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = ''; 
            btn.style.opacity = '1';
        }, 3000);
    });
}

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

document.querySelectorAll('.hover-spotlight').forEach(element => {
    element.addEventListener('mousemove', e => {
        updateSpotlightPosition(element, e.clientX, e.clientY);
    });
});

document.addEventListener('touchmove', (e) => {
    if (window.isMarqueeDragging) return;

    const touch = e.touches[0];
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (!elementUnderFinger) return;

    const card = elementUnderFinger.closest('.hover-spotlight');

    if (currentSpotlightCard && currentSpotlightCard !== card) {
        const oldOverlay = currentSpotlightCard.querySelector('.spotlight-overlay');
        if (oldOverlay) oldOverlay.style.opacity = '0';
    }

    if (card) {
        const overlay = card.querySelector('.spotlight-overlay');
        if (overlay) overlay.style.opacity = '1';
        updateSpotlightPosition(card, touch.clientX, touch.clientY);
        currentSpotlightCard = card;
    } else {
        if(currentSpotlightCard) {
            const oldOverlay = currentSpotlightCard.querySelector('.spotlight-overlay');
            if (oldOverlay) oldOverlay.style.opacity = '0';
            currentSpotlightCard = null;
        }
    }
}, { passive: true });

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

const clearSpotlight = () => {
    if (currentSpotlightCard) {
        const overlay = currentSpotlightCard.querySelector('.spotlight-overlay');
        if (overlay) overlay.style.opacity = '0';
        currentSpotlightCard = null;
    }
};

document.addEventListener('touchend', clearSpotlight);
document.addEventListener('touchcancel', clearSpotlight);


// --- THE ULTIMATE PHYSICS-BASED INFINITE MARQUEE ENGINE ---
window.isMarqueeDragging = false; 

document.querySelectorAll('.trust-banner').forEach(banner => {
    const wrapper = banner.querySelector('.marquee-wrapper');
    if (!wrapper) return;
    
    const originalList = wrapper.querySelector('.tech-list');

    // Wait a brief moment to ensure the browser has painted the elements so offsetWidth isn't 0
    setTimeout(() => {
        const listWidth = originalList.offsetWidth || 600; 
        
        // Dynamic mega-cloning: Ensures at least 16,000 pixels of content for extreme 25% zoom outs
        const clonesNeeded = Math.ceil(16000 / listWidth); 

        for (let i = 0; i < clonesNeeded; i++) {
            const clone = originalList.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            wrapper.appendChild(clone);
        }

        let isDown = false;
        let startX;
        let isHovered = false;
        let dragWalk = 0;
        
        let velocity = 1.5; // Current moving speed
        const baseSpeed = 1.5; // Default cruising speed
        let lastX = 0;

        // Instantly force scroll to the center of the massive cloned block so users can drag left immediately
        wrapper.scrollLeft = listWidth * 2;

        // Hardware-Accelerated Momentum Physics Loop
        const playMarquee = () => {
            const singleWidth = originalList.offsetWidth;
            
            if (singleWidth > 0) {
                // If user is NOT touching the screen, apply Linear Interpolation (Lerp)
                if (!isDown) {
                    const targetSpeed = isHovered ? 0 : baseSpeed;
                    // This mathematically glides the momentum perfectly back to the target speed
                    velocity += (targetSpeed - velocity) * 0.05; 
                }
                
                wrapper.scrollLeft += velocity;

                // Seamless Infinite Looping Math
                if (wrapper.scrollLeft <= 0) {
                    wrapper.scrollLeft += singleWidth;
                } else if (wrapper.scrollLeft >= singleWidth * 3) {
                    wrapper.scrollLeft -= singleWidth;
                }
            }
            requestAnimationFrame(playMarquee);
        };
        requestAnimationFrame(playMarquee);

        // Input normalizer
        const getPageX = (e) => e.pageX || (e.touches && e.touches[0].pageX);

        // Global Event Handlers
        const handleDown = (e) => {
            isDown = true;
            window.isMarqueeDragging = true;
            wrapper.classList.add('active-drag');
            startX = getPageX(e);
            lastX = startX;
            velocity = 0; // Instantly halt momentum on grab
            dragWalk = 0;
            
            // CRITICAL FIX: Transfer drag tracking to the window so fast swiping doesn't escape the container
            window.addEventListener('mousemove', handleMove, { passive: false });
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleUp);
        };

        const handleMove = (e) => {
            if (!isDown) return;
            const currentX = getPageX(e);
            
            // Calculate pixel movement difference
            const deltaX = lastX - currentX; 
            
            wrapper.scrollLeft += deltaX;
            
            // Capture precise release momentum
            velocity = deltaX; 
            dragWalk += Math.abs(deltaX);
            lastX = currentX;
        };

        const handleUp = () => {
            if (!isDown) return;
            isDown = false;
            wrapper.classList.remove('active-drag');
            setTimeout(() => { window.isMarqueeDragging = false; }, 50); 
            
            // Clear global listeners to preserve RAM
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };

        // Attach initial grab listeners to the wrapper
        wrapper.addEventListener('mousedown', handleDown);
        wrapper.addEventListener('touchstart', handleDown, { passive: true });
        
        // Mouse-Only Hover pausing
        wrapper.addEventListener('mouseenter', () => { isHovered = true; });
        wrapper.addEventListener('mouseleave', () => { isHovered = false; });

        // Intelligent Click Routing (Blocks fake clicks if user was actively dragging)
        wrapper.querySelectorAll('.tech-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); 
                
                // If user dragged more than 5 pixels, it was a swipe, not a click
                if (Math.abs(dragWalk) > 5) {
                    dragWalk = 0;
                    return; 
                }
                
                this.classList.add('touch-active');
                const href = this.getAttribute('href');
                const target = this.getAttribute('target');
                
                setTimeout(() => {
                    if (href && href.startsWith('#')) {
                        window.location.href = href;
                    } else if (href) {
                        window.open(href, target || '_self', 'noopener,noreferrer');
                    }
                    
                    setTimeout(() => {
                        this.classList.remove('touch-active');
                    }, 1000); 
                    
                }, 50);
            });
        });
    }, 150); // Wait 150ms for CSS to render layout
});

// --- Theme Personalization Engine & Accessibility Tracker ---
const themeBtn = document.getElementById('themeToggleBtn');
const themePanel = document.getElementById('themePanel');
const closeThemeBtn = document.getElementById('closeTheme');
const themeModeToggle = document.getElementById('themeMode');
const color1Picker = document.getElementById('color1Picker');
const color2Picker = document.getElementById('color2Picker');
const animTypeSelect = document.getElementById('animType');
const animSpeedSlider = document.getElementById('animSpeed');
const animToggle = document.getElementById('animToggle');
const interactiveBgToggle = document.getElementById('interactiveBgToggle');
const resetThemeBtn = document.getElementById('resetTheme');

const defaultColor1 = '#3b82f6';
const defaultColor2 = '#8b5cf6';
const defaultSpeedVal = 50; 
const defaultAnimType = 'effect-float';

document.querySelectorAll('.theme-panel .switch input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
        }
    });
});

if (themeBtn && themePanel) {
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let focusableElements = [];
    let firstFocusableElement;
    let lastFocusableElement;

    const updateFocusableElements = () => {
        focusableElements = Array.from(themePanel.querySelectorAll(focusableElementsString));
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    };

    const closeThemePanel = () => {
        themePanel.classList.remove('active');
        themeBtn.setAttribute('aria-expanded', 'false');
        themeBtn.focus();
    };

    const openThemePanel = () => {
        themePanel.classList.add('active');
        themeBtn.setAttribute('aria-expanded', 'true');
        updateFocusableElements();
        setTimeout(() => { if (firstFocusableElement) firstFocusableElement.focus(); }, 100);
    };

    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = themePanel.classList.contains('active');
        if (isOpen) {
            closeThemePanel();
        } else {
            openThemePanel();
        }
    });

    if (closeThemeBtn) {
        closeThemeBtn.addEventListener('click', closeThemePanel);
    }

    document.addEventListener('click', (e) => {
        if (themePanel.classList.contains('active') && !themePanel.contains(e.target) && !themeBtn.contains(e.target)) {
            closeThemePanel();
        }
    });

    themePanel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeThemePanel();
            return;
        }

        if (e.key === 'Tab') {
            updateFocusableElements();
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
}

let interactiveCursorTicking = false;
const updateInteractiveCursor = (x, y) => {
    if (!document.body.classList.contains('interactive-bg')) return;
    if (!interactiveCursorTicking) {
        window.requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--cursor-x', `${x}px`);
            document.documentElement.style.setProperty('--cursor-y', `${y}px`);
            interactiveCursorTicking = false;
        });
        interactiveCursorTicking = true;
    }
};

document.addEventListener('mousemove', (e) => {
    updateInteractiveCursor(e.clientX, e.clientY);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        updateInteractiveCursor(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        updateInteractiveCursor(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

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

if (animTypeSelect) {
    animTypeSelect.addEventListener('change', (e) => {
        document.body.classList.remove('effect-float', 'effect-pulse', 'effect-orbit', 'effect-wave', 'effect-spin');
        document.body.classList.add(e.target.value);
        localStorage.setItem('animType', e.target.value);
    });
}

const updateSpeed = (val) => {
    const speedSecs = 40 - ((val - 1) * (35 / 99));
    document.documentElement.style.setProperty('--anim-duration', speedSecs + 's');
    localStorage.setItem('animSpeed', val);
}

if (animSpeedSlider) {
    animSpeedSlider.addEventListener('input', (e) => updateSpeed(e.target.value));
}

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

if (interactiveBgToggle) {
    interactiveBgToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('interactive-bg');
            localStorage.setItem('interactiveBg', 'enabled');
        } else {
            document.body.classList.remove('interactive-bg');
            localStorage.setItem('interactiveBg', 'disabled');
        }
    });
}

if (resetThemeBtn) {
    resetThemeBtn.addEventListener('click', () => {
        if(color1Picker) color1Picker.value = defaultColor1;
        if(color2Picker) color2Picker.value = defaultColor2;
        updateColors(defaultColor1, defaultColor2);
        
        if (animTypeSelect) animTypeSelect.value = defaultAnimType;
        document.body.classList.remove('effect-float', 'effect-pulse', 'effect-orbit', 'effect-wave', 'effect-spin');
        document.body.classList.add(defaultAnimType);
        localStorage.setItem('animType', defaultAnimType);
        
        if (animSpeedSlider) animSpeedSlider.value = defaultSpeedVal;
        updateSpeed(defaultSpeedVal);
        
        if(animToggle) animToggle.checked = true;
        document.body.classList.remove('disable-bg-animation');
        localStorage.setItem('bgAnimation', 'enabled');
        
        if(interactiveBgToggle) interactiveBgToggle.checked = false;
        document.body.classList.remove('interactive-bg');
        localStorage.setItem('interactiveBg', 'disabled');
        
        if(themeModeToggle) themeModeToggle.checked = false;
        document.body.classList.remove('light-mode');
        localStorage.setItem('themeMode', 'dark');
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const savedC1 = localStorage.getItem('themeColor1');
    const savedC2 = localStorage.getItem('themeColor2');
    const savedMode = localStorage.getItem('themeMode');
    const savedAnimType = localStorage.getItem('animType') || defaultAnimType;
    const savedSpeed = localStorage.getItem('animSpeed');
    const savedAnim = localStorage.getItem('bgAnimation');
    const savedInteractive = localStorage.getItem('interactiveBg');

    if (savedC1 && savedC2) {
        if(color1Picker) color1Picker.value = savedC1;
        if(color2Picker) color2Picker.value = savedC2;
    }
    
    if (savedMode === 'light') {
        if (themeModeToggle) themeModeToggle.checked = true;
    }

    if (animTypeSelect) animTypeSelect.value = savedAnimType;

    if (savedSpeed) {
        if (animSpeedSlider) animSpeedSlider.value = savedSpeed;
    } else {
        if (animSpeedSlider) animSpeedSlider.value = defaultSpeedVal;
    }

    if (savedAnim === 'disabled') {
        if(animToggle) animToggle.checked = false;
    }
    
    if (savedInteractive === 'enabled') {
        if(interactiveBgToggle) interactiveBgToggle.checked = true;
    }
});

// --- Visual Viewport Smart Zoom Engine ---
if (window.visualViewport) {
    let isZoomedIn = false;
    
    const handleZoom = () => {
        const currentScale = window.visualViewport.scale;
        
        if (currentScale > 1.05 && !isZoomedIn) {
            isZoomedIn = true;
            document.body.classList.add('is-zoomed');
            
            const themePanel = document.getElementById('themePanel');
            const closeThemeBtn = document.getElementById('closeTheme');
            if (themePanel && themePanel.classList.contains('active') && closeThemeBtn) {
                closeThemeBtn.click();
            }
            
            const mobileDropdown = document.getElementById('mobileDropdown');
            const mobileToggle = document.getElementById('mobileToggle');
            if (mobileDropdown && mobileDropdown.classList.contains('active')) {
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileDropdown.classList.remove('active');
                mobileToggle.classList.remove('is-open');
                mobileToggle.innerHTML = '☰';
            }
            
        } else if (currentScale <= 1.05 && isZoomedIn) {
            isZoomedIn = false;
            document.body.classList.remove('is-zoomed');
        }
    };

    window.visualViewport.addEventListener('resize', handleZoom, { passive: true });
    window.visualViewport.addEventListener('scroll', handleZoom, { passive: true });
}