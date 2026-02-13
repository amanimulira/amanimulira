// ============================================================
// Amani Mulira — Script
// Minimal, elegant interactions
// ============================================================

// --- Mobile nav ---
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const y = target.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
});

// --- Scroll reveal ---
const revealEls = [
    ...document.querySelectorAll('.section-label, .section-title, .section-intro'),
    ...document.querySelectorAll('.project'),
    ...document.querySelectorAll('.service-item'),
    ...document.querySelectorAll('.stack-col'),
    ...document.querySelectorAll('.contact-card'),
    ...document.querySelectorAll('.contact-text'),
];

revealEls.forEach(el => el.classList.add('reveal'));

const approachGrid = document.querySelector('.approach-grid');
if (approachGrid) approachGrid.classList.add('reveal-stagger');

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
