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
}, 16); // ~60fps throttle

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
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDropdown.classList.contains('active')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDropdown.classList.remove('active');
        mobileToggle.classList.remove('is-open');
        mobileToggle.innerHTML = '☰';
        mobileToggle.focus();
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

// High-Performance Universal Hover Spotlight Effect Tracker
document.querySelectorAll('.hover-spotlight').forEach(element => {
    let ticking = false;
    element.addEventListener('mousemove', e => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                element.style.setProperty('--mouse-x', `${x}px`);
                element.style.setProperty('--mouse-y', `${y}px`);
                ticking = false;
            });
            ticking = true;
        }
    });
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