class DialogController {
    constructor() {
        this.cvDrawer = document.getElementById("cv-drawer");
        this.commandPalette = document.getElementById("command-palette");

        document.querySelectorAll("[data-open-cv]").forEach((button) => {
            button.addEventListener("click", () => this.open(this.cvDrawer));
        });

        document.querySelectorAll("[data-open-command]").forEach((button) => {
            button.addEventListener("click", () => this.open(this.commandPalette));
        });

        document.querySelectorAll("[data-close-dialog]").forEach((button) => {
            button.addEventListener("click", () => button.closest("dialog")?.close());
        });

        [this.cvDrawer, this.commandPalette].forEach((dialog) => {
            dialog?.addEventListener("click", (event) => {
                if (event.target === dialog) dialog.close();
            });
        });
    }

    open(dialog) {
        if (!dialog || dialog.open) return;
        dialog.showModal();
    }
}

class CommandPalette {
    constructor(dialog, cvDrawer) {
        this.dialog = dialog;
        this.cvDrawer = cvDrawer;
        this.input = dialog?.querySelector("input");
        this.commands = [...(dialog?.querySelectorAll("[data-command]") || [])];
        this.visibleCommands = [...this.commands];
        this.activeIndex = 0;

        if (!dialog || !this.input) return;

        document.addEventListener("keydown", (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (dialog.open) dialog.close();
                else dialog.showModal();
            }
        });

        dialog.addEventListener("close", () => this.reset());
        dialog.addEventListener("toggle", () => {
            if (dialog.open) requestAnimationFrame(() => this.input.focus());
        });
        this.input.addEventListener("input", () => this.filter());
        this.input.addEventListener("keydown", (event) => this.onKeydown(event));
        this.commands.forEach((command) => command.addEventListener("click", () => this.run(command.dataset.command)));
        this.updateSelection();
    }

    filter() {
        const query = this.input.value.trim().toLowerCase();
        this.visibleCommands = this.commands.filter((command) => {
            const visible = !query || command.dataset.commandLabel.includes(query);
            command.hidden = !visible;
            return visible;
        });
        this.activeIndex = 0;
        this.updateSelection();
    }

    onKeydown(event) {
        if (!this.visibleCommands.length) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.activeIndex = (this.activeIndex + 1) % this.visibleCommands.length;
            this.updateSelection();
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            this.activeIndex = (this.activeIndex - 1 + this.visibleCommands.length) % this.visibleCommands.length;
            this.updateSelection();
        }
        if (event.key === "Enter") {
            event.preventDefault();
            this.run(this.visibleCommands[this.activeIndex].dataset.command);
        }
    }

    updateSelection() {
        this.commands.forEach((command) => command.classList.remove("selected"));
        const selected = this.visibleCommands[this.activeIndex];
        if (selected) {
            selected.classList.add("selected");
            selected.scrollIntoView({ block: "nearest" });
        }
    }

    run(command) {
        this.dialog.close();
        if (command === "cv") {
            requestAnimationFrame(() => this.cvDrawer?.showModal());
            return;
        }
        document.getElementById(command)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    reset() {
        this.input.value = "";
        this.commands.forEach((command) => command.hidden = false);
        this.visibleCommands = [...this.commands];
        this.activeIndex = 0;
        this.updateSelection();
    }
}

class ExclusiveDetails {
    constructor(container) {
        this.items = [...container.querySelectorAll(":scope > details")];
        this.items.forEach((item) => this.syncAccess(item));
        this.items.forEach((item) => item.addEventListener("toggle", () => {
            if (item.open) {
                this.items.forEach((candidate) => {
                    if (candidate !== item) candidate.open = false;
                });
            }
            this.items.forEach((candidate) => this.syncAccess(candidate));
        }));
    }

    syncAccess(item) {
        const content = item.querySelector(".record-content");
        if (content) content.toggleAttribute("inert", !item.open);
    }
}

class SectionTracker {
    constructor() {
        this.root = document.querySelector(".editor-canvas");
        this.sections = [...document.querySelectorAll(".observed-section")];
        this.navLinks = [...document.querySelectorAll("[data-nav-section]")];
        this.tabs = [...document.querySelectorAll("[data-section-tab]")];
        this.currentFile = document.getElementById("current-file");
        this.sectionLine = document.getElementById("section-line");
        this.files = {
            overview: "overview.md",
            work: "selected-work.json",
            experience: "experience.md",
            notes: "public-notes.txt",
            profile: "profile.md",
            contact: "contact.txt"
        };

        if (!this.root || !this.sections.length) return;
        const observer = new IntersectionObserver((entries) => this.onIntersect(entries), {
            root: this.root,
            rootMargin: "-18% 0px -66% 0px",
            threshold: 0
        });
        this.sections.forEach((section) => observer.observe(section));
    }

    onIntersect(entries) {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        const id = visible.target.dataset.section;
        this.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.navSection === id));
        this.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.sectionTab === id));
        if (this.currentFile) this.currentFile.textContent = this.files[id] || "portfolio";
        if (this.sectionLine) this.sectionLine.textContent = String(this.sections.indexOf(visible.target) + 1);
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

class EmailCopy {
    constructor(button) {
        if (!button) return;
        this.button = button;
        this.original = button.innerHTML;
        button.addEventListener("click", () => this.copy());
    }

    async copy() {
        try {
            await navigator.clipboard.writeText(this.button.dataset.email);
            this.button.innerHTML = "Email copied <span>✓</span>";
        } catch {
            window.location.href = `mailto:${this.button.dataset.email}`;
            return;
        }
        window.setTimeout(() => this.button.innerHTML = this.original, 1800);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const dialogs = new DialogController();
    new CommandPalette(dialogs.commandPalette, dialogs.cvDrawer);
    document.querySelectorAll("[data-exclusive-details]").forEach((container) => new ExclusiveDetails(container));
    new SectionTracker();
    new LondonClock(document.getElementById("london-time"));
    new EmailCopy(document.getElementById("copy-email"));
});
