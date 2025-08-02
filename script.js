// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll to top functionality
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.style.display = 'flex';
            } else {
                scrollBtn.style.display = 'none';
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'נשלח...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = 'הודעה נשלחה בהצלחה!';
                submitBtn.style.background = '#27ae60';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }

    // Scroll animations for cards
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.card, .service-card, .testimonial');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial styles for animation
    document.querySelectorAll('.card, .service-card, .testimonial').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    // Trigger once on load
    setTimeout(animateOnScroll, 100);
});


// Video play/pause on click
document.querySelectorAll('video').forEach(video => {
    video.addEventListener('click', function() {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.content-section, .testimonials, .pricing-table-wrapper, #services').forEach(el => {
    observer.observe(el);
});

// High contrast mode toggle (accessibility)
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

// Load high contrast preference
if (localStorage.getItem('highContrast') === 'true') {
    document.body.classList.add('high-contrast');
}

// Font size adjustment
let currentFontSize = 16;

function increaseFontSize() {
    if (currentFontSize < 24) {
        currentFontSize += 2;
        document.documentElement.style.fontSize = currentFontSize + 'px';
        localStorage.setItem('fontSize', currentFontSize);
    }
}

function decreaseFontSize() {
    if (currentFontSize > 12) {
        currentFontSize -= 2;
        document.documentElement.style.fontSize = currentFontSize + 'px';
        localStorage.setItem('fontSize', currentFontSize);
    }
}

// Load font size preference
const savedFontSize = localStorage.getItem('fontSize');
if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize);
    document.documentElement.style.fontSize = currentFontSize + 'px';
}

// Add CSS for high contrast mode
const style = document.createElement('style');
style.innerHTML = `
.high-contrast {
    background: #000 !important;
    color: #fff !important;
}
.high-contrast * {
    background: #000 !important;
    color: #fff !important;
    border-color: #fff !important;
}
.high-contrast a, 
.high-contrast .btn, 
.high-contrast .nav-cta {
    color: #000 !important;
    background: #fff !important;
    border: 2px solid #fff !important;
}
.high-contrast input, 
.high-contrast textarea, 
.high-contrast select {
    background: #111 !important;
    color: #fff !important;
    border: 2px solid #fff !important;
}
.high-contrast .card,
.high-contrast .content-section,
.high-contrast .testimonials,
.high-contrast .contact {
    background: #111 !important;
    border: 1px solid #fff !important;
}
`;
document.head.appendChild(style);

// Accessibility menu functionality
const accessibilityBtn = document.querySelector('.accessibility-btn');
const accessibilityMenu = document.querySelector('.accessibility-menu');

if (accessibilityBtn && accessibilityMenu) {
    accessibilityBtn.addEventListener('click', () => {
        accessibilityMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!accessibilityBtn.contains(e.target) && !accessibilityMenu.contains(e.target)) {
            accessibilityMenu.classList.remove('active');
        }
    });
}

// Add smooth scrolling to WhatsApp button
const whatsappFloat = document.querySelector('.whatsapp-float');
if (whatsappFloat) {
    whatsappFloat.addEventListener('click', function(e) {
        // Let the default behavior happen (open WhatsApp)
        // Add a small animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
}