const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

class Navigation {
    constructor() {
        this.nav = document.querySelector(".nav");
        this.toggle = document.querySelector(".nav-toggle");
        this.links = document.querySelector(".nav-links");
        this.toggleLabel = this.toggle?.querySelector(".sr-only");
        this.mobileQuery = window.matchMedia("(max-width: 800px)");
        this.scrollPosition = 0;

        if (!this.nav || !this.toggle || !this.links) return;

        this.toggle.addEventListener("click", () => this.setOpen(!this.links.classList.contains("open")));
        this.links.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => this.setOpen(false));
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.setOpen(false);
        });

        window.addEventListener("scroll", () => this.onScroll(), { passive: true });
        this.mobileQuery.addEventListener("change", (event) => {
            if (!event.matches) this.setOpen(false);
            else this.syncMenuAccess(false);
        });
        this.syncMenuAccess(false);
        this.onScroll();
    }

    setOpen(open) {
        const wasOpen = this.links.classList.contains("open");

        if (open && !wasOpen) {
            this.scrollPosition = window.scrollY;
            document.body.style.top = `-${this.scrollPosition}px`;
        }

        this.links.classList.toggle("open", open);
        this.toggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open);
        this.syncMenuAccess(open);

        if (this.toggleLabel) {
            this.toggleLabel.textContent = open ? "Close menu" : "Open menu";
        }

        if (!open && wasOpen) {
            document.body.style.top = "";
            window.scrollTo(0, this.scrollPosition);
        }
    }

    syncMenuAccess(open) {
        this.links.inert = this.mobileQuery.matches && !open;
    }

    onScroll() {
        this.nav.classList.toggle("scrolled", window.scrollY > 24);
    }
}

class SignalChart {
    constructor(canvas) {
        if (!canvas) return;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.phase = 0;
        this.frame = null;
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas.parentElement);
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
        this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.width = rect.width;
        this.height = rect.height;

        if (reduceMotion) {
            this.draw();
        } else if (!this.frame) {
            this.animate();
        }
    }

    points() {
        const base = [
            [0.02, 0.86],
            [0.11, 0.8],
            [0.2, 0.72],
            [0.3, 0.66],
            [0.4, 0.53],
            [0.49, 0.58],
            [0.58, 0.43],
            [0.68, 0.34],
            [0.78, 0.39],
            [0.9, 0.2],
            [0.98, 0.15]
        ];

        return base.map(([x, y], index) => [
            x * this.width,
            y * this.height + Math.sin(this.phase + index * 0.8) * (reduceMotion ? 0 : 3)
        ]);
    }

    draw() {
        const ctx = this.context;
        const points = this.points();
        ctx.clearRect(0, 0, this.width, this.height);

        const fill = ctx.createLinearGradient(0, 0, 0, this.height);
        fill.addColorStop(0, "rgba(214, 255, 103, 0.25)");
        fill.addColorStop(1, "rgba(214, 255, 103, 0)");

        ctx.beginPath();
        ctx.moveTo(points[0][0], this.height);
        points.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(points[points.length - 1][0], this.height);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.beginPath();
        points.forEach(([x, y], index) => {
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "#d6ff67";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 16;
        ctx.shadowColor = "rgba(214, 255, 103, 0.45)";
        ctx.stroke();
        ctx.shadowBlur = 0;

        points.forEach(([x, y], index) => {
            if (![2, 4, 6, 8, 10].includes(index)) return;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = index === 10 ? "#88aef5" : "#d6ff67";
            ctx.fill();
        });
    }

    animate() {
        this.phase += 0.012;
        this.draw();
        this.frame = requestAnimationFrame(() => this.animate());
    }
}

class Reveal {
    constructor() {
        const groups = [
            ".section-heading",
            ".approach-card",
            ".case-copy",
            ".case-visual",
            ".social-proof-intro",
            ".linkedin-feed",
            ".social-profile-link",
            ".experience-aside",
            ".role",
            ".about-copy",
            ".capability-board",
            ".contact > *:not(.contact-orbit)"
        ];

        this.elements = document.querySelectorAll(groups.join(","));
        this.elements.forEach((element) => element.setAttribute("data-reveal", ""));

        if (reduceMotion || !("IntersectionObserver" in window)) {
            this.elements.forEach((element) => element.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -7% 0px"
        });

        this.elements.forEach((element) => observer.observe(element));
    }
}

class SocialFeed {
    constructor(feed) {
        if (!feed) return;
        this.feed = feed;
        this.cards = [...feed.querySelectorAll(".linkedin-post")];
        this.previous = document.getElementById("feed-prev");
        this.next = document.getElementById("feed-next");
        this.index = document.getElementById("feed-index");
        this.current = 0;
        this.scrollFrame = null;

        this.previous?.addEventListener("click", () => this.go(this.current - 1));
        this.next?.addEventListener("click", () => this.go(this.current + 1));
        this.feed.addEventListener("scroll", () => this.onScroll(), { passive: true });
        this.feed.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                this.go(this.current - 1);
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                this.go(this.current + 1);
            }
        });
    }

    go(index) {
        const target = Math.max(0, Math.min(index, this.cards.length - 1));
        this.feed.scrollTo({
            left: this.cards[target].offsetLeft,
            behavior: reduceMotion ? "auto" : "smooth"
        });
        this.setCurrent(target);
    }

    onScroll() {
        if (this.scrollFrame) return;
        this.scrollFrame = requestAnimationFrame(() => {
            let closest = 0;
            let distance = Infinity;

            this.cards.forEach((card, index) => {
                const nextDistance = Math.abs(card.offsetLeft - this.feed.scrollLeft);
                if (nextDistance < distance) {
                    closest = index;
                    distance = nextDistance;
                }
            });

            this.setCurrent(closest);
            this.scrollFrame = null;
        });
    }

    setCurrent(index) {
        this.current = index;
        if (this.index) this.index.textContent = String(index + 1).padStart(2, "0");
        if (this.previous) this.previous.disabled = index === 0;
        if (this.next) this.next.disabled = index === this.cards.length - 1;
    }
}

class Counter {
    constructor() {
        this.items = document.querySelectorAll("[data-count]");
        if (!this.items.length) return;

        if (reduceMotion || !("IntersectionObserver" in window)) {
            this.items.forEach((item) => this.setValue(item, Number(item.dataset.count)));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                this.animate(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        this.items.forEach((item) => observer.observe(item));
    }

    setValue(item, value) {
        item.textContent = `${Math.round(value)}%`;
    }

    animate(item) {
        const target = Number(item.dataset.count);
        const start = performance.now();
        const duration = 900;

        const tick = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.setValue(item, target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}

class SubtleTilt {
    constructor(element) {
        if (!element || reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
        this.element = element;

        element.addEventListener("pointermove", (event) => {
            const rect = element.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            element.style.transform = `rotate(${2 + x * 1.2}deg) translateY(${-y * 6}px)`;
        });

        element.addEventListener("pointerleave", () => {
            element.style.transform = "";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Navigation();
    new SignalChart(document.getElementById("signal-canvas"));
    new Reveal();
    new SocialFeed(document.getElementById("linkedin-feed"));
    new Counter();
    new SubtleTilt(document.querySelector(".signal-board"));

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});
