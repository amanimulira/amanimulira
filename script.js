const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

class Navigation {
    constructor() {
        this.nav = document.querySelector(".nav");
        this.toggle = document.querySelector(".nav-toggle");
        this.links = document.querySelector(".nav-links");
        this.toggleCopy = this.toggle?.querySelector(".toggle-copy");
        this.mobileQuery = window.matchMedia("(max-width: 850px)");
        this.scrollPosition = 0;

        if (!this.nav || !this.toggle || !this.links) return;

        this.toggle.addEventListener("click", () => this.setOpen(!this.links.classList.contains("open")));
        this.links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => this.setOpen(false)));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.setOpen(false);
        });
        window.addEventListener("scroll", () => this.onScroll(), { passive: true });

        const onBreakpoint = (event) => {
            if (!event.matches) this.setOpen(false);
            else this.syncAccess(false);
        };
        if (this.mobileQuery.addEventListener) this.mobileQuery.addEventListener("change", onBreakpoint);
        else this.mobileQuery.addListener(onBreakpoint);

        this.syncAccess(false);
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
        this.syncAccess(open);
        if (this.toggleCopy) this.toggleCopy.textContent = open ? "Close" : "Menu";

        if (!open && wasOpen) {
            document.body.style.top = "";
            window.scrollTo(0, this.scrollPosition);
        }
    }

    syncAccess(open) {
        this.links.inert = this.mobileQuery.matches && !open;
    }

    onScroll() {
        this.nav.classList.toggle("scrolled", window.scrollY > 30);
    }
}

class LondonClock {
    constructor(element) {
        this.element = element;
        if (!element) return;
        this.update();
        window.setInterval(() => this.update(), 30000);
    }

    update() {
        const time = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(new Date());
        this.element.textContent = `London ${time}`;
    }
}

class PageProgress {
    constructor(element) {
        this.element = element;
        if (!element) return;
        window.addEventListener("scroll", () => this.update(), { passive: true });
        window.addEventListener("resize", () => this.update(), { passive: true });
        this.update();
    }

    update() {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0;
        this.element.style.width = `${progress * 100}%`;
    }
}

class SignalField {
    constructor(canvas) {
        if (!canvas) return;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.pointer = { x: .72, y: .34 };
        this.nodes = [];
        this.phase = 0;
        this.frame = null;
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas.parentElement);

        canvas.parentElement.addEventListener("pointermove", (event) => {
            const rect = canvas.getBoundingClientRect();
            this.pointer.x = (event.clientX - rect.left) / rect.width;
            this.pointer.y = (event.clientY - rect.top) / rect.height;
        });

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
        this.nodes = Array.from({ length: this.width < 700 ? 8 : 15 }, (_, index) => ({
            x: ((index * 0.173) % 1) * this.width,
            y: ((index * 0.317 + .08) % 1) * this.height,
            drift: .6 + (index % 5) * .25,
            accent: index % 4
        }));
        if (reduceMotion) this.draw();
        else if (!this.frame) this.animate();
    }

    draw() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);
        const px = this.pointer.x * this.width;
        const py = this.pointer.y * this.height;

        this.nodes.forEach((node, index) => {
            const x = node.x + Math.sin(this.phase * node.drift + index) * 12;
            const y = node.y + Math.cos(this.phase * .8 + index) * 8;
            const distance = Math.hypot(x - px, y - py);
            if (distance < 280) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(px, py);
                ctx.strokeStyle = `rgba(215,255,84,${Math.max(0, .22 - distance / 1600)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(x, y, node.accent === 0 ? 4 : 2, 0, Math.PI * 2);
            ctx.fillStyle = node.accent === 0 ? "#ff4d1f" : node.accent === 1 ? "#3157ff" : "rgba(251,250,245,.5)";
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(215,255,84,.65)";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#d7ff54";
        ctx.fill();
    }

    animate() {
        this.phase += .008;
        this.draw();
        this.frame = requestAnimationFrame(() => this.animate());
    }
}

class ProjectLab {
    constructor() {
        this.tabs = [...document.querySelectorAll(".project-tab")];
        this.panels = [...document.querySelectorAll(".project-panel")];
        if (!this.tabs.length) return;

        this.tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => this.select(index));
            tab.addEventListener("keydown", (event) => {
                if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                let target = index;
                if (["ArrowDown", "ArrowRight"].includes(event.key)) target = (index + 1) % this.tabs.length;
                if (["ArrowUp", "ArrowLeft"].includes(event.key)) target = (index - 1 + this.tabs.length) % this.tabs.length;
                if (event.key === "Home") target = 0;
                if (event.key === "End") target = this.tabs.length - 1;
                this.select(target, true);
            });
        });
    }

    select(index, focus = false) {
        this.tabs.forEach((tab, tabIndex) => {
            const active = tabIndex === index;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
            if (active && focus) tab.focus();
        });

        this.panels.forEach((panel, panelIndex) => {
            const active = panelIndex === index;
            panel.hidden = !active;
            panel.classList.toggle("active", active);
        });
    }
}

class HorizontalFeed {
    constructor(feed) {
        if (!feed) return;
        this.feed = feed;
        this.cards = [...feed.querySelectorAll(".note-card")];
        this.previous = document.getElementById("notes-prev");
        this.next = document.getElementById("notes-next");
        this.index = document.getElementById("notes-index");
        this.current = 0;
        this.scrollFrame = null;

        this.previous?.addEventListener("click", () => this.go(this.current - 1));
        this.next?.addEventListener("click", () => this.go(this.current + 1));
        this.feed.addEventListener("scroll", () => this.onScroll(), { passive: true });
        this.feed.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); this.go(this.current - 1); }
            if (event.key === "ArrowRight") { event.preventDefault(); this.go(this.current + 1); }
        });
        this.setCurrent(0);
    }

    go(index) {
        const target = Math.max(0, Math.min(index, this.cards.length - 1));
        this.feed.scrollTo({ left: this.cards[target].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
        this.setCurrent(target);
    }

    onScroll() {
        if (this.scrollFrame) return;
        this.scrollFrame = requestAnimationFrame(() => {
            let closest = 0;
            let distance = Infinity;
            this.cards.forEach((card, index) => {
                const candidate = Math.abs(card.offsetLeft - this.feed.scrollLeft);
                if (candidate < distance) { distance = candidate; closest = index; }
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

class Reveal {
    constructor() {
        const selectors = [
            ".section-index", ".work-intro", ".project-lab", ".impact-heading",
            ".impact-ledger", ".impact-detail", ".notes-heading", ".notes-feed",
            ".profile-copy", ".capability-index", ".contact-section > *:not(.contact-grid)"
        ];
        this.elements = document.querySelectorAll(selectors.join(","));
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
        }, { threshold: .08, rootMargin: "0px 0px -7% 0px" });
        this.elements.forEach((element) => observer.observe(element));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Navigation();
    new LondonClock(document.getElementById("london-time"));
    new PageProgress(document.getElementById("page-progress-bar"));
    new SignalField(document.getElementById("field-canvas"));
    new ProjectLab();
    new HorizontalFeed(document.getElementById("notes-feed"));
    new Reveal();

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});
