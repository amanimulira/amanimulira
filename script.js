// ============================================================
// Amani Mulira — Interactive Experience
// ============================================================

const lerp = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.innerWidth <= 768;

// ============================================================
// Loader
// ============================================================
class Loader {
    constructor() {
        this.el = document.getElementById('loader');
        if (!this.el) return;
        document.body.classList.add('loading');
        window.addEventListener('load', () => this.dismiss());
        setTimeout(() => this.dismiss(), 2500);
    }

    dismiss() {
        if (this.dismissed) return;
        this.dismissed = true;
        setTimeout(() => {
            this.el.classList.add('done');
            document.body.classList.remove('loading');
            heroAnimation.start();
        }, 400);
    }
}

// ============================================================
// Custom Cursor
// ============================================================
class Cursor {
    constructor() {
        if (isMobile()) return;

        this.dot = document.createElement('div');
        this.dot.className = 'cursor-dot';
        this.ring = document.createElement('div');
        this.ring.className = 'cursor-ring';
        document.body.appendChild(this.dot);
        document.body.appendChild(this.ring);

        this.pos = { x: -100, y: -100 };
        this.target = { x: -100, y: -100 };
        this.ringPos = { x: -100, y: -100 };
        this.visible = false;

        document.addEventListener('mousemove', (e) => {
            this.target.x = e.clientX;
            this.target.y = e.clientY;
            if (!this.visible) {
                this.visible = true;
                this.pos.x = e.clientX;
                this.pos.y = e.clientY;
                this.ringPos.x = e.clientX;
                this.ringPos.y = e.clientY;
            }
        });

        document.addEventListener('mousedown', () => this.ring.classList.add('click'));
        document.addEventListener('mouseup', () => this.ring.classList.remove('click'));

        // Hover detection
        const hoverEls = 'a, button, [data-magnetic], .project-link, .btn-primary, .btn-ghost, .contact-card, .service-item, .nav-links a';
        document.querySelectorAll(hoverEls).forEach(el => {
            el.addEventListener('mouseenter', () => this.ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.ring.classList.remove('hover'));
        });

        this.render();
    }

    render() {
        this.pos.x = lerp(this.pos.x, this.target.x, 0.9);
        this.pos.y = lerp(this.pos.y, this.target.y, 0.9);
        this.ringPos.x = lerp(this.ringPos.x, this.target.x, 0.15);
        this.ringPos.y = lerp(this.ringPos.y, this.target.y, 0.15);

        this.dot.style.left = this.pos.x + 'px';
        this.dot.style.top = this.pos.y + 'px';
        this.ring.style.left = this.ringPos.x + 'px';
        this.ring.style.top = this.ringPos.y + 'px';

        requestAnimationFrame(() => this.render());
    }
}

// ============================================================
// Hero Animation
// ============================================================
class HeroAnimation {
    constructor() {
        this.nameWrap = document.querySelector('.hero-name-wrap');
        this.fadeEls = document.querySelectorAll('.hero-fade-el');
    }

    start() {
        // Name marquee scales in
        setTimeout(() => {
            if (this.nameWrap) this.nameWrap.classList.add('visible');
        }, 200);

        // Stagger fade-in elements
        this.fadeEls.forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), 500 + i * 150);
        });
    }
}

// ============================================================
// Particle Network (Hero Background)
// ============================================================
class ParticleNetwork {
    constructor(canvas) {
        if (!canvas || isMobile()) return;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.animating = true;

        this.resize();
        this.create();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        this.canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.parentElement.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.create();
    }

    create() {
        const area = this.canvas.width * this.canvas.height;
        const count = Math.min(Math.floor(area / 18000), 80);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.15 + 0.1,
                radius: Math.random() * 1.8 + 0.5,
                opacity: Math.random() * 0.4 + 0.2
            });
        }
    }

    animate() {
        if (!this.animating) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Mouse repulsion
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.8;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
            }

            // Wrap around
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.canvas.height + 10;
            if (p.y > this.canvas.height + 10) p.y = -10;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(193, 165, 85, ${p.opacity})`;
            this.ctx.fill();
        });

        // Draw connections
        const maxDist = 100;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i];
                const b = this.particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = 0.08 * (1 - dist / maxDist);
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.strokeStyle = `rgba(193, 165, 85, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================================
// Magnetic Buttons
// ============================================================
class MagneticButton {
    constructor(el) {
        if (isMobile()) return;
        this.el = el;
        this.strength = 0.3;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;

            el.style.transform = `translate(${dx * this.strength}px, ${dy * this.strength}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { el.style.transition = ''; }, 400);
        });
    }
}

// ============================================================
// 3D Tilt Effect
// ============================================================
class TiltEffect {
    constructor(el) {
        if (isMobile()) return;
        this.el = el;
        this.intensity = parseInt(el.dataset.tiltIntensity) || 12;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const rotateY = (x - 0.5) * this.intensity;
            const rotateX = (0.5 - y) * this.intensity;

            el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { el.style.transition = ''; }, 600);
        });
    }
}

// ============================================================
// Card Glow (follows mouse)
// ============================================================
class CardGlow {
    constructor() {
        if (isMobile()) return;
        document.querySelectorAll('.card-glow').forEach(glow => {
            const parent = glow.parentElement;
            parent.addEventListener('mousemove', (e) => {
                const rect = parent.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                glow.style.setProperty('--glow-x', x + 'px');
                glow.style.setProperty('--glow-y', y + 'px');
            });
        });
    }
}

// ============================================================
// Text Scramble Effect
// ============================================================
class TextScramble {
    constructor() {
        if (isMobile()) return;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

        document.querySelectorAll('[data-scramble]').forEach(el => {
            const original = el.textContent;
            el.addEventListener('mouseenter', () => this.scramble(el, original));
        });
    }

    scramble(el, text) {
        if (el._scrambling) return;
        el._scrambling = true;
        let iteration = 0;
        const maxIterations = text.length;

        const interval = setInterval(() => {
            el.textContent = text
                .split('')
                .map((char, i) => {
                    if (char === ' ' || char === '—' || char === '&') return char;
                    if (i < iteration) return text[i];
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');

            iteration += 1.2;

            if (iteration >= maxIterations) {
                clearInterval(interval);
                el.textContent = text;
                el._scrambling = false;
            }
        }, 30);
    }
}

// ============================================================
// Scroll Progress Bar
// ============================================================
class ScrollProgress {
    constructor() {
        this.el = document.getElementById('scroll-progress');
        if (!this.el) return;

        window.addEventListener('scroll', () => this.update(), { passive: true });
    }

    update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        this.el.style.width = progress + '%';
    }
}

// ============================================================
// Active Nav Section Tracking
// ============================================================
class ActiveNav {
    constructor() {
        this.links = document.querySelectorAll('.nav-links a[href^="#"]');
        this.sections = [];

        this.links.forEach(link => {
            const id = link.getAttribute('href').slice(1);
            const section = document.getElementById(id);
            if (section) this.sections.push({ link, section });
        });

        window.addEventListener('scroll', () => this.update(), { passive: true });
        this.update();
    }

    update() {
        const scrollPos = window.scrollY + 150;

        let current = null;
        this.sections.forEach(({ link, section }) => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                current = link;
            }
        });

        this.links.forEach(link => link.classList.remove('active'));
        if (current) current.classList.add('active');
    }
}

// ============================================================
// Nav Hide/Show on Scroll
// ============================================================
class NavScroll {
    constructor() {
        this.nav = document.getElementById('nav');
        this.lastScroll = 0;
        this.threshold = 80;

        window.addEventListener('scroll', () => this.update(), { passive: true });
    }

    update() {
        const scrollY = window.scrollY;
        if (scrollY > this.threshold && scrollY > this.lastScroll) {
            this.nav.classList.add('hidden');
        } else {
            this.nav.classList.remove('hidden');
        }
        this.lastScroll = scrollY;
    }
}

// ============================================================
// Noise Overlay (generated canvas texture)
// ============================================================
class NoiseOverlay {
    constructor() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        const imageData = ctx.createImageData(256, 256);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        const overlay = document.createElement('div');
        overlay.className = 'noise-overlay';
        overlay.style.backgroundImage = `url(${canvas.toDataURL()})`;
        overlay.style.backgroundRepeat = 'repeat';
        document.body.appendChild(overlay);
    }
}

// ============================================================
// Enhanced Scroll Reveal
// ============================================================
class Carousel {
    constructor() {
        this.track = document.getElementById('carousel-track');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        this.dotsWrap = document.getElementById('carousel-dots');
        if (!this.track) return;

        this.cards = [...this.track.querySelectorAll('.project-card')];
        this.current = 0;

        this.buildDots();
        this.prevBtn.addEventListener('click', () => this.go(this.current - 1));
        this.nextBtn.addEventListener('click', () => this.go(this.current + 1));
        this.track.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    buildDots() {
        this.cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to project ${i + 1}`);
            dot.addEventListener('click', () => this.go(i));
            this.dotsWrap.appendChild(dot);
        });
        this.dots = [...this.dotsWrap.querySelectorAll('.carousel-dot')];
    }

    go(index) {
        const i = Math.max(0, Math.min(index, this.cards.length - 1));
        this.cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }

    onScroll() {
        const trackLeft = this.track.scrollLeft;
        let closest = 0;
        let minDist = Infinity;
        this.cards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - trackLeft - parseInt(getComputedStyle(this.track).paddingLeft));
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        if (closest !== this.current) {
            this.current = closest;
            this.dots.forEach((d, i) => d.classList.toggle('active', i === closest));
        }
    }
}

class ScrollReveal {
    constructor() {
        // Standard reveals for labels and intros
        document.querySelectorAll('.section-label, .section-intro').forEach(el => el.classList.add('reveal'));
        document.querySelectorAll('.contact-text').forEach(el => el.classList.add('reveal'));

        // Alternate section titles: some from left, some from right
        const titles = document.querySelectorAll('.section-title');
        titles.forEach((el, i) => {
            el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
        });

        // Carousel cards reveal
        document.querySelectorAll('.project-card').forEach(el => {
            el.classList.add('reveal-scale');
        });

        // Scale reveals for service items
        document.querySelectorAll('.service-item').forEach((el, i) => {
            el.classList.add(i % 2 === 0 ? 'reveal-scale' : 'reveal-right');
        });

        // Alternate contact cards from right
        document.querySelectorAll('.contact-card').forEach((el, i) => {
            el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
        });

        // Section dividers
        document.querySelectorAll('.section-divider').forEach(el => el.classList.add('reveal'));

        // Decorative elements
        document.querySelectorAll('.deco').forEach(el => el.classList.add('reveal'));

        // Stagger groups
        document.querySelectorAll('.experience-card').forEach(el => el.classList.add('reveal'));

        const stackColumns = document.querySelector('.stack-columns');
        if (stackColumns) stackColumns.classList.add('reveal-stagger');

        // Observe all
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-stagger').forEach(el => {
            observer.observe(el);
        });
    }
}

// ============================================================
// Smooth Parallax (orb + decorative elements + horizontal text)
// ============================================================
class Parallax {
    constructor() {
        if (isMobile()) return;
        this.decos = document.querySelectorAll('[data-parallax-deco]');
        this.scrollText = document.querySelector('[data-scroll-speed]');
        window.addEventListener('scroll', () => this.update(), { passive: true });
    }

    update() {
        const scrollY = window.scrollY;

        // Decorative elements parallax
        this.decos.forEach(el => {
            const speed = parseFloat(el.dataset.parallaxDeco) || 0;
            const rect = el.closest('.section, section')?.getBoundingClientRect();
            if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = (scrollY - el.closest('.section, section').offsetTop) * speed;
                el.style.transform = `translateY(${offset}px)`;
            }
        });

        // Horizontal scroll text — offset relative to its own section position
        if (this.scrollText) {
            const parent = this.scrollText.closest('.horizontal-scroll-text');
            if (parent) {
                const rect = parent.getBoundingClientRect();
                const progress = -rect.top / window.innerHeight;
                const offset = progress * 200;
                this.scrollText.style.transform = `translateX(${50 - offset}px)`;
            }
        }
    }
}

// ============================================================
// Mobile Nav
// ============================================================
class MobileNav {
    constructor() {
        this.toggle = document.getElementById('nav-toggle');
        this.links = document.getElementById('nav-links');

        this.toggle.addEventListener('click', () => {
            this.toggle.classList.toggle('active');
            this.links.classList.toggle('open');
        });

        this.links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                this.toggle.classList.remove('active');
                this.links.classList.remove('open');
            });
        });
    }
}

// ============================================================
// Smooth Scroll
// ============================================================
class SmoothScroll {
    constructor() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const y = target.getBoundingClientRect().top + window.scrollY - 72;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        });
    }
}

// ============================================================
// Initialize Everything
// ============================================================
const heroAnimation = new HeroAnimation();

document.addEventListener('DOMContentLoaded', () => {
    // Core
    new Loader();
    new SmoothScroll();
    new MobileNav();

    // Cursor & interactions (desktop only)
    new Cursor();
    new CardGlow();
    new TextScramble();

    // Magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach(el => new MagneticButton(el));

    // 3D tilt
    document.querySelectorAll('[data-tilt]').forEach(el => new TiltEffect(el));

    // Visual effects
    new ParticleNetwork(document.getElementById('hero-canvas'));
    new NoiseOverlay();
    new Parallax();

    // Scroll-driven
    new ScrollProgress();
    new ActiveNav();
    new NavScroll();
    new ScrollReveal();
    new Carousel();

    // Mark mobile
    if (isMobile()) document.body.classList.add('is-mobile');
    window.addEventListener('resize', () => {
        if (isMobile()) document.body.classList.add('is-mobile');
        else document.body.classList.remove('is-mobile');
    });
});
