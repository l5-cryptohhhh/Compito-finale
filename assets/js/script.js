/* ── LOADING SIMULATION ── */
const fill = document.getElementById('progress-fill');
const pct = document.getElementById('progress-pct');
const txt = document.getElementById('loading-text');
const ps = document.getElementById('press-start');
const vs = document.getElementById('var-status');
const flash = document.getElementById('flash');

const phases = [
    { at: 15, label: 'Caricamento stadio…' },
    { at: 35, label: 'Inizializzazione VAR…' },
    { at: 55, label: 'Caricamento giocatori…' },
    { at: 72, label: 'Configurazione arbitro…' },
    { at: 88, label: 'Preparazione partita…' },
    { at: 100, label: 'Pronto!' },
];
const varMessages = [
    'Analisi in corso…',
    'Revisione filmato…',
    'Check VAR attivo…',
    'Decisione in attesa…',
    'GOL confermato ✓',
];

let progress = 0;
let phaseIdx = 0;
let varIdx = 0;
let done = false;

// VAR status cycling
setInterval(() => {
    vs.textContent = varMessages[varIdx % varMessages.length];
    varIdx++;
}, 1800);

// Progress ticker
const tick = setInterval(() => {
    if (progress >= 100) {
        clearInterval(tick);
        done = true;
        ps.style.opacity = '1';
        txt.textContent = 'Pronto!';
        return;
    }

    // Variable speed
    const inc = progress < 30 ? Math.random() * 4 + 1
        : progress < 70 ? Math.random() * 2.5 + .5
            : Math.random() * 1.5 + .3;

    progress = Math.min(100, progress + inc);

    fill.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';

    // Phase labels
    if (phaseIdx < phases.length && progress >= phases[phaseIdx].at) {
        txt.textContent = phases[phaseIdx].label;
        phaseIdx++;
    }
}, 90);

/* ── PRESS ANY KEY / TAP ── */
function startGame(e) {
    if (!done) return;
    // flash effect
    flash.classList.add('active');
    setTimeout(() => {
        flash.classList.remove('active');
        // Here you'd transition to the actual game screen
        // For demo: reset loading
        resetDemo();
    }, 300);
}

function resetDemo() {
    progress = 0;
    phaseIdx = 0;
    done = false;
    fill.style.width = '0%';
    pct.textContent = '0%';
    txt.textContent = 'Caricamento partita…';
    ps.style.opacity = '0';
    // restart ticker
    const t2 = setInterval(() => {
        if (progress >= 100) { clearInterval(t2); done = true; ps.style.opacity = '1'; txt.textContent = 'Pronto!'; return; }
        const inc = progress < 30 ? Math.random() * 4 + 1 : progress < 70 ? Math.random() * 2.5 + .5 : Math.random() * 1.5 + .3;
        progress = Math.min(100, progress + inc);
        fill.style.width = progress + '%';
        pct.textContent = Math.floor(progress) + '%';
        if (phaseIdx < phases.length && progress >= phases[phaseIdx].at) {
            txt.textContent = phases[phaseIdx].label; phaseIdx++;
        }
    }, 90);
}

document.addEventListener('keydown', startGame);
document.addEventListener('touchstart', startGame, { passive: true });
document.addEventListener('click', startGame);