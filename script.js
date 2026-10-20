// ===== Quick Brief content =====
// Edit the text here. Each step shows its lines one after another.
// highlight = a word in that step drawn in the accent color. cta = label of the final button.
// Copy rules: no long dashes and no semicolons in visible text.
const QUICK_BRIEF = {
    steps: [
        {
            highlight: "Maor",
            lines: [
                "Hi, I'm Maor.",
                "I graduated with a B.A. in Technology Management from Bar-Ilan, alongside completing the Product Management Honors Program."
            ]
        },
        {
            lines: [
                "I know you may read a lot of these, so I put together a quick summary to save you some time :)"
            ]
        },
        {
            lines: [
                "My path started in the IDF, where I commanded a company of about 200 soldiers and commanders.",
                "Facing constantly shifting timelines taught me how to communicate clearly, lead through uncertainty, and keep momentum going."
            ]
        },
        {
            lines: [
                "Today at Blink, a fast-growing FinTech startup, I see technology from both sides.",
                "As a Customer Success Specialist, I solve real user challenges, and in my practicum, I drive discovery for new features."
            ]
        },
        {
            lines: [
                "What drives me most is the intersection of human behavior, business goals, and practical technology solutions.",
                "If that sounds like a mindset your team could use, I’d love to connect!"
            ],
            cta: "Contact Me"
        }
    ]
};

// Mark that JS is running (enables scroll-reveal styles without hiding content when JS is off)
document.documentElement.classList.add('js');

// ===== Track filter =====
// ?track=pm|prj|ops|bd|cs tailors the page to one role type. No visible UI — only the link decides.
// Content is tagged with data-tracks="pm:M prj:S" (M = main, S = secondary, missing = hidden).
const TRACKS = ['pm', 'prj', 'ops', 'bd', 'cs'];
const requestedTrack = new URLSearchParams(location.search).get('track')?.toLowerCase();
const track = TRACKS.includes(requestedTrack) ? requestedTrack : null;

// Hero: show the extra line that belongs to the current track
document.querySelectorAll('[data-show-track]').forEach(el => {
    el.hidden = el.dataset.showTrack !== track;
});

// 'M', 'S' or null (hidden) for an element in the current track.
// Default view (no track): anything that is M in some track counts as M, the rest as S.
function levelOf(el) {
    const tags = Object.fromEntries(
        el.dataset.tracks.trim().split(/\s+/).map(pair => pair.split(':'))
    );
    if (track) return tags[track] || null;
    return Object.values(tags).includes('M') ? 'M' : 'S';
}

// Experience: M bullets stay visible, S bullets move into "Read more", hidden ones are removed.
// A card with nothing for this track is hidden; a card with only S bullets moves to the bottom
// and shows them openly.
document.querySelectorAll('[data-exp]').forEach(card => {
    const main = card.querySelector('.exp-main');
    const more = card.querySelector('.exp-more');
    const toggle = card.querySelector('.toggle-btn');
    const bullets = [...main.querySelectorAll('li[data-tracks]')];
    const levels = bullets.map(levelOf);

    if (levels.every(level => level === null)) {
        card.hidden = true;
        return;
    }

    const hasMain = levels.includes('M');
    bullets.forEach((li, i) => {
        if (levels[i] === null) li.remove();
        else if (levels[i] === 'S' && hasMain) more.append(li);
    });

    if (!hasMain) card.classList.add('is-secondary');
    toggle.hidden = more.children.length === 0;
});

// Projects: same M/S/hidden rule per card. Cards without data-tracks (placeholders) always show.
document.querySelectorAll('.project[data-tracks]').forEach(card => {
    const level = levelOf(card);
    card.hidden = level === null;
    card.classList.toggle('is-secondary', level === 'S');
});

// Skills: nothing hidden. With a track, M skills move to the top of their category and get highlighted,
// then S skills, then the rest.
if (track) {
    const rank = li => {
        const level = li.dataset.tracks ? levelOf(li) : null;
        return level === 'M' ? 0 : level === 'S' ? 1 : 2;
    };
    document.querySelectorAll('.skill-list').forEach(list => {
        [...list.children]
            .sort((a, b) => rank(a) - rank(b))
            .forEach(li => {
                li.classList.toggle('is-main', rank(li) === 0);
                list.append(li);
            });
    });
}

// Education: always shown. An item with data-emphasis="<track>" moves to the top for that track.
document.querySelectorAll('[data-emphasis]').forEach(item => {
    if (item.dataset.emphasis !== track) return;
    item.classList.add('is-emphasis');
    item.parentElement.prepend(item);
});

// ===== Navbar: shadow on scroll + mobile menu =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

function setMenu(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
document.querySelectorAll('#navLinks a, .logo-btn').forEach(link => link.addEventListener('click', () => setMenu(false)));

// ===== Highlight the nav link of the section in view =====
const sectionLinks = new Map(
    [...navLinks.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a])
);

// The active section is the last one whose top has passed a line just under the navbar.
// At the very bottom of the page the last section wins (it may be too short to reach the top).
const navSections = [...sectionLinks.keys()].map(id => document.getElementById(id)).filter(Boolean);
let clickedSection = null;   // a nav click highlights its link right away, until that scroll settles
let clickTimer;

function setActiveLink(id) {
    sectionLinks.forEach((a, key) => a.classList.toggle('active', key === id));
}

function updateActiveLink() {
    if (clickedSection) return setActiveLink(clickedSection);
    const line = navbar.offsetHeight + 80;
    let current = null;
    navSections.forEach(section => {
        if (section.getBoundingClientRect().top <= line) current = section.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = navSections[navSections.length - 1].id;
    }
    setActiveLink(current);
}

sectionLinks.forEach((a, id) => a.addEventListener('click', () => {
    clickedSection = id;
    setActiveLink(id);
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickedSection = null; }, 1000);
}));
window.addEventListener('scroll', () => {
    if (clickedSection) {   // keep the clicked link until the smooth scroll has stopped
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickedSection = null; updateActiveLink(); }, 150);
    }
    updateActiveLink();
}, { passive: true });
updateActiveLink();

// ===== Scroll reveal =====
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Experience: Read more / Show less =====
// Cards in a row share one height. A closed card next to an open one keeps its natural height,
// so opening Read more grows only the clicked card.
function syncExpRows() {
    const cards = [...document.querySelectorAll('[data-exp]:not([hidden])')];
    const isOpen = card => card.querySelector('.details.open') !== null;
    const openRows = cards.filter(isOpen).map(card => card.offsetTop);
    cards.forEach(card => {
        card.classList.toggle('is-natural', !isOpen(card) && openRows.includes(card.offsetTop));
    });
}

document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const details = document.getElementById(btn.getAttribute('aria-controls'));
        const open = btn.getAttribute('aria-expanded') !== 'true';
        details.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Show less' : 'Read more';
        syncExpRows();
    });
});

// ===== Contact modal =====
const modal = document.getElementById('contactModal');
let lastFocused = null;

function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 250);
    lastFocused?.focus();
}

document.querySelectorAll('[data-open-modal]').forEach(btn => btn.addEventListener('click', openModal));
modal.querySelector('[data-close-modal]').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
    if (e.key === 'Escape' && navLinks.classList.contains('open')) setMenu(false);
});

// ===== Quick Brief =====
const brief = {
    overlay: document.getElementById('briefModal'),
    card: document.querySelector('.brief-card'),
    stage: document.getElementById('briefStage'),
    progress: document.getElementById('briefProgress'),
    count: document.getElementById('briefCount'),
    next: document.getElementById('briefNext'),
    back: document.getElementById('briefBack'),
    openBtn: document.getElementById('briefOpen'),
    step: 0,
    revealing: false,
    switching: false,
    timers: [],
    seen: new Set()
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lastStep = QUICK_BRIEF.steps.length - 1;

brief.card.tabIndex = -1;
QUICK_BRIEF.steps.forEach(() => brief.progress.append(document.createElement('span')));

// How long a line stays alone before the next one fades in (scales with length, capped)
const lineDelay = text => Math.min(2400, 450 + text.length * 11);

function clearBriefTimers() {
    brief.timers.forEach(clearTimeout);
    brief.timers = [];
}

function buildLine(text, highlight, isLead) {
    const p = document.createElement('p');
    p.className = 'brief-line' + (isLead ? ' is-lead' : '');
    const at = highlight ? text.indexOf(highlight) : -1;
    if (at === -1) {
        p.textContent = text;
    } else {
        const accent = document.createElement('span');
        accent.className = 'accent';
        accent.textContent = highlight;
        p.append(text.slice(0, at), accent, text.slice(at + highlight.length));
    }
    return p;
}

function finishReveal() {
    clearBriefTimers();
    brief.stage.querySelectorAll('.pending').forEach(line => line.classList.remove('pending'));
    brief.revealing = false;
    brief.next.classList.add('ready');
    brief.seen.add(brief.step);
}

function showStep(index) {
    clearBriefTimers();
    brief.step = index;
    const step = QUICK_BRIEF.steps[index];
    const isLast = index === lastStep;

    [...brief.progress.children].forEach((dot, i) => {
        dot.className = i < index ? 'done' : i === index ? 'current' : '';
    });
    brief.count.textContent = `· ${index + 1} of ${QUICK_BRIEF.steps.length}`;
    brief.back.disabled = index === 0;
    brief.next.classList.toggle('is-cta', isLast);
    brief.next.innerHTML = '';
    brief.next.append(isLast ? step.cta : 'Next', ' ');
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    brief.next.append(arrow);
    brief.next.classList.remove('ready');

    // Steps already seen (or reduced motion) appear at once; new steps reveal line by line
    const animate = !reduceMotion.matches && !brief.seen.has(index);
    const lines = step.lines.map((text, i) => buildLine(text, step.highlight, index === 0 && i === 0));
    brief.stage.replaceChildren(...lines);
    brief.stage.classList.toggle('is-dense', lines.length > 2);

    if (!animate) {
        finishReveal();
        return;
    }
    brief.revealing = true;
    lines.forEach(line => line.classList.add('pending'));
    let at = 120;
    lines.forEach((line, i) => {
        brief.timers.push(setTimeout(() => line.classList.remove('pending'), at));
        if (i < lines.length - 1) at += lineDelay(step.lines[i]);
    });
    brief.timers.push(setTimeout(finishReveal, at + 500));
}

// Outgoing text fades up and out, then the next step enters
function goToStep(index) {
    if (brief.switching || index < 0 || index > lastStep) return;
    if (reduceMotion.matches) {
        showStep(index);
        return;
    }
    brief.switching = true;
    brief.stage.classList.add('leaving');
    setTimeout(() => {
        brief.stage.classList.remove('leaving');
        showStep(index);
        brief.switching = false;
    }, 220);
}

function briefNext() {
    if (brief.switching) return;
    if (brief.revealing) {
        finishReveal();          // first click completes the reveal
    } else if (brief.step < lastStep) {
        goToStep(brief.step + 1);
    } else {
        briefToContact();
    }
}

function briefBack() {
    if (brief.step > 0) goToStep(brief.step - 1);
}

function openBrief() {
    brief.seen.clear();
    brief.overlay.hidden = false;
    requestAnimationFrame(() => brief.overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    showStep(0);
    brief.card.focus({ preventScroll: true });
}

function closeBrief() {
    clearBriefTimers();
    brief.revealing = false;
    brief.overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { brief.overlay.hidden = true; }, 300);
    brief.openBtn.focus();
}

// Last step: close the brief and hand over to the existing contact modal
function briefToContact() {
    closeBrief();
    openModal();
}

brief.openBtn.addEventListener('click', openBrief);
brief.next.addEventListener('click', briefNext);
brief.back.addEventListener('click', briefBack);
brief.overlay.querySelectorAll('[data-brief-close]').forEach(btn => btn.addEventListener('click', closeBrief));
brief.overlay.addEventListener('click', e => { if (e.target === brief.overlay) closeBrief(); });

brief.overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeBrief();
    } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && e.target === brief.card)) {
        e.preventDefault();
        briefNext();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        briefBack();
    } else if (e.key === 'Tab') {
        // Keep focus inside the dialog
        const focusable = [...brief.card.querySelectorAll('button:not([disabled])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === brief.card)) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// ===== Projects marquee =====
// The movement itself is a CSS animation (style.css, @keyframes projects-marquee).
// This script only: copies the 4 cards once (for a seamless loop), sets the speed from the real
// width, and toggles .is-paused for the Pause button, touch, off screen and a hidden tab.
// Hover and keyboard focus pause it in CSS.
const marquee = {
    box: document.getElementById('projCarousel'),
    track: document.getElementById('projTrack'),
    toggle: document.getElementById('projAutoplay'),
    userPaused: false,    // Pause/Play button: stays paused until Play
    touching: false,
    offScreen: false,
    touchTimer: null,
    resizeTimer: null
};
const MARQUEE_SPEED = 45;   // pixels per second

function setupMarquee() {
    const { box, track, toggle } = marquee;

    // Second half of the track: exact copies, hidden from screen readers and the Tab key
    [...track.children].forEach(card => {
        const copy = card.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.inert = true;
        copy.dataset.clone = '';
        track.append(copy);
    });

    // Duration = one half's width / speed, measured from the real layout (re-measured on resize)
    const setSpeed = () => {
        const half = track.scrollWidth / 2;
        if (half > 0) track.style.setProperty('--marquee-duration', `${(half / MARQUEE_SPEED).toFixed(2)}s`);
    };
    setSpeed();
    window.addEventListener('resize', () => {
        clearTimeout(marquee.resizeTimer);
        marquee.resizeTimer = setTimeout(setSpeed, 200);
    });

    const sync = () => {
        box.classList.toggle('is-paused', marquee.userPaused || marquee.touching || marquee.offScreen || document.hidden);
        toggle.classList.toggle('is-paused', marquee.userPaused);
        toggle.setAttribute('aria-label', marquee.userPaused ? 'Play automatic rotation' : 'Pause automatic rotation');
    };

    toggle.addEventListener('click', () => {
        marquee.userPaused = !marquee.userPaused;
        sync();
    });

    // Touch: pause while the finger is down, continue 3s after it lifts. Taps on links still work.
    box.addEventListener('touchstart', () => {
        clearTimeout(marquee.touchTimer);
        marquee.touching = true;
        sync();
    }, { passive: true });
    ['touchend', 'touchcancel'].forEach(type => box.addEventListener(type, () => {
        clearTimeout(marquee.touchTimer);
        marquee.touchTimer = setTimeout(() => { marquee.touching = false; sync(); }, 3000);
    }, { passive: true }));

    // Focus scrolled the box to show a card? Put it back when focus leaves, so the loop lines up again
    // (Not with reduced motion: there the visitor scrolls the cards by hand.)
    const manualScroll = window.matchMedia('(prefers-reduced-motion: reduce)');
    box.addEventListener('focusout', e => {
        if (!manualScroll.matches && !box.contains(e.relatedTarget)) box.scrollLeft = 0;
    });

    document.addEventListener('visibilitychange', sync);
    new IntersectionObserver(([entry]) => {
        marquee.offScreen = !entry.isIntersecting;
        sync();
    }).observe(box);

    sync();
}

if (marquee.track) setupMarquee();

// ===== Copy to clipboard =====
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(btn.dataset.copy);
            btn.textContent = 'Copied ✓';
            btn.classList.add('copied');
            showToast('Copied to clipboard');
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.classList.remove('copied');
            }, 2000);
        } catch {
            showToast('Copy failed — please copy manually');
        }
    });
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
