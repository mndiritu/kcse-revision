/* ---------- Tabs (topic pages) ---------- */
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    if (!tabs || tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');

            populateQuickJump();
        });
    });
}

/* ---------- MCQ Quiz (existing) ---------- */
function loadQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container || typeof quizData === 'undefined') return;

    container.innerHTML = '';
    quizData.forEach((item, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'question-block';

        const qTitle = document.createElement('p');
        qTitle.innerHTML = `<strong>${index + 1}. ${item.question}</strong>`;
        qDiv.appendChild(qTitle);

        const optionsDiv = document.createElement('div');
        item.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(btn, optIndex, item.correct, item.explanation, optionsDiv);
            optionsDiv.appendChild(btn);
        });
        qDiv.appendChild(optionsDiv);

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback';
        qDiv.appendChild(feedbackDiv);

        container.appendChild(qDiv);
    });
}

function checkAnswer(btn, selectedIndex, correctIndex, explanation, parentDiv) {
    const buttons = parentDiv.querySelectorAll('.option-btn');
    const feedback = parentDiv.nextSibling;

    buttons.forEach(b => b.disabled = true);

    if (selectedIndex === correctIndex) {
        btn.classList.add('correct');
        feedback.innerHTML = `✅ Correct! ${explanation}`;
        feedback.style.color = "green";
    } else {
        btn.classList.add('wrong');
        buttons[correctIndex].classList.add('correct');
        feedback.innerHTML = `❌ Incorrect. ${explanation}`;
        feedback.style.color = "red";
    }
}

/* ---------- Index: Subject → Topics (from topics.js) ---------- */
function loadSubjectLibrary() {
    const grid = document.getElementById('subject-grid');
    if (!grid) return;

    const data = window.KCSE_TOPICS;
    const cards = document.querySelectorAll('.subject-card');

    cards.forEach(card => {
        const subject = card.getAttribute('data-subject');
        const topicsBox = card.querySelector('.topics');

        card.addEventListener('click', () => {
            if (!topicsBox) return;
            const isHidden = topicsBox.hasAttribute('hidden');
            if (isHidden) topicsBox.removeAttribute('hidden');
            else topicsBox.setAttribute('hidden', '');
        });

        if (!topicsBox) return;

        if (!data || !data[subject] || data[subject].length === 0) {
            topicsBox.innerHTML = `<div class="topic-meta">No topics yet. Add an .html topic file, then regenerate <strong>topics.js</strong>.</div>`;
            return;
        }

        const list = data[subject].map(t => {
            const tags = (t.tags && t.tags.length) ? `Tags: ${t.tags.join(", ")}` : "";
            return `
                <a href="${t.path}">
                    ${t.title}
                    ${tags ? `<span class="topic-meta">${tags}</span>` : ""}
                </a>
            `;
        }).join("");

        topicsBox.innerHTML = list;
    });
}

/* ---------- Topic tools: Quick jump + Expand/Collapse + Back to top ---------- */
function getActiveSection() {
    return document.querySelector('.content-section.active') || null;
}

function getJumpTargetsForActiveSection() {
    const active = getActiveSection();
    if (!active) return [];

    const summaries = Array.from(active.querySelectorAll('summary[id]'));
    if (summaries.length > 0) {
        return summaries.map(el => ({ id: el.id, text: el.textContent.trim() }));
    }

    const headings = Array.from(active.querySelectorAll('h2[id], h3[id]'));
    return headings.map(el => ({ id: el.id, text: el.textContent.trim() }));
}

function populateQuickJump() {
    const select = document.getElementById('quick-jump');
    if (!select) return;

    const targets = getJumpTargetsForActiveSection();
    select.innerHTML = `<option value="">Select a section…</option>`;

    targets.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.text;
        select.appendChild(opt);
    });
}

function jumpToSelected() {
    const select = document.getElementById('quick-jump');
    if (!select || !select.value) return;

    const el = document.getElementById(select.value);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setAllDetails(open) {
    const notes = document.getElementById('writing-notes');
    const isNotesActive = notes && notes.classList.contains('active');
    if (!isNotesActive) return;

    document.querySelectorAll('#writing-notes details.note-section').forEach(d => {
        d.open = open;
    });
}

function setupTools() {
    const jumpBtn = document.getElementById('jump-btn');
    if (jumpBtn) jumpBtn.addEventListener('click', jumpToSelected);

    const expandAll = document.getElementById('expand-all');
    if (expandAll) expandAll.addEventListener('click', () => setAllDetails(true));

    const collapseAll = document.getElementById('collapse-all');
    if (collapseAll) collapseAll.addEventListener('click', () => setAllDetails(false));
}

function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const toggle = () => {
        if (window.scrollY > 500) btn.style.display = 'block';
        else btn.style.display = 'none';
    };

    window.addEventListener('scroll', toggle);
    toggle();

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---------- KCSE Drill (Adaptive Random Sets) ---------- */
function shuffleArray(arr) {
    // Fisher–Yates shuffle
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function roundToHalf(x) {
    return Math.round(x * 2) / 2;
}

function loadKCSEDrill() {
    const container = document.getElementById('kcse-container');
    if (!container || typeof kcseData === 'undefined' || !Array.isArray(kcseData)) return;

    // State
    let mode = 'set'; // 'set' or 'all'
    let setSize = 5;
    let currentIndices = [];

    // Build base UI
    container.innerHTML = `
        <div class="concept-box">
            <h3>KCSE Drill Mode (fast + effective)</h3>
            <ul>
                <li>Attempt on paper first.</li>
                <li>Use <strong>Random Sets</strong> to avoid “I know this because I just saw it” illusions.</li>
                <li>Self-mark using the marking points. Score updates in <strong>marks</strong>.</li>
            </ul>

            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px;">
                <span class="badge" id="kcse-mode-badge">Mode: Random Set</span>

                <label style="font-weight:800; color:#334155;">
                    Set size:
                    <select id="kcse-set-size" style="margin-left:6px; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;">
                        <option value="3">3</option>
                        <option value="5" selected>5</option>
                        <option value="8">8</option>
                        <option value="10">10</option>
                    </select>
                </label>

                <button class="reveal-btn" id="kcse-new-set" type="button">New Set</button>
                <button class="reveal-btn" id="kcse-show-all" type="button">Show All</button>
                <button class="reveal-btn" id="kcse-back-set" type="button" style="display:none;">Back to Random Set</button>

                <span class="score-pill" id="kcse-score">Score: 0/0</span>
            </div>
        </div>

        <div id="kcse-questions"></div>
    `;

    const questionsHost = container.querySelector('#kcse-questions');
    const scoreEl = container.querySelector('#kcse-score');
    const modeBadge = container.querySelector('#kcse-mode-badge');

    const setSizeSelect = container.querySelector('#kcse-set-size');
    const btnNewSet = container.querySelector('#kcse-new-set');
    const btnShowAll = container.querySelector('#kcse-show-all');
    const btnBackSet = container.querySelector('#kcse-back-set');

    // Score state: computed from checked boxes
    function computeAndRenderScore() {
        const allChecks = questionsHost.querySelectorAll('input.kcse-check');
        let earned = 0;
        let total = 0;

        // Each checkbox has a "data-value" which is how many marks it contributes
        allChecks.forEach(chk => {
            const value = parseFloat(chk.getAttribute('data-value') || '0');
            total += value;
            if (chk.checked) earned += value;
        });

        // Cleaner display: round to 0.5 marks
        earned = roundToHalf(earned);
        total = roundToHalf(total);

        scoreEl.textContent = `Score: ${earned}/${total}`;
    }

    function renderQuestions(indices) {
        questionsHost.innerHTML = '';

        indices.forEach((idx, order) => {
            const q = kcseData[idx];

            const marks = Number(q.marks || 0);
            const points = Array.isArray(q.points) ? q.points : [];

            // Avoid division by zero
            const perPoint = (points.length > 0 && marks > 0) ? (marks / points.length) : 0;

            const card = document.createElement('div');
            card.className = 'drill-card';

            card.innerHTML = `
                <div class="drill-top">
                    <div>
                        <span class="badge">Q${order + 1} • ${marks} marks</span>
                    </div>
                    <button class="reveal-btn" type="button">Reveal marking points</button>
                </div>

                <p style="margin: 10px 0 0 0;"><strong>${q.prompt || ''}</strong></p>

                <div class="marking" hidden>
                    <div style="font-weight: 900; margin-bottom: 6px;">Marking points (tick what you got):</div>
                    <div class="marking-points"></div>
                    <div style="margin-top:10px; color:#64748b; font-weight:700; font-size:0.9rem;">
                        Tip: tick points honestly. It’s training the brain, not pleasing the teacher.
                    </div>
                </div>
            `;

            const revealBtn = card.querySelector('.reveal-btn');
            const markingBox = card.querySelector('.marking');
            const pointsBox = card.querySelector('.marking-points');

            const pointChecks = points.map(pt => {
                // Each point contributes a fraction of marks; rounded to 0.5 for sanity
                const value = roundToHalf(perPoint);
                return `
                    <label style="display:block; margin:6px 0; font-weight:700;">
                        <input type="checkbox" class="kcse-check" data-value="${value}" />
                        ${pt}
                        <span style="color:#64748b; font-weight:800; font-size:0.85rem; margin-left:6px;">(${value}m)</span>
                    </label>
                `;
            }).join("");

            pointsBox.innerHTML = pointChecks || `<em>No marking points provided.</em>`;

            revealBtn.addEventListener('click', () => {
                const isHidden = markingBox.hasAttribute('hidden');
                if (isHidden) {
                    markingBox.removeAttribute('hidden');
                    revealBtn.textContent = "Hide marking points";
                } else {
                    markingBox.setAttribute('hidden', '');
                    revealBtn.textContent = "Reveal marking points";
                }
            });

            // score update
            card.addEventListener('change', (e) => {
                if (e.target && e.target.classList.contains('kcse-check')) {
                    computeAndRenderScore();
                }
            });

            questionsHost.appendChild(card);
        });

        computeAndRenderScore();
    }

    function pickRandomSet(n) {
        const all = Array.from({ length: kcseData.length }, (_, i) => i);
        const shuffled = shuffleArray(all);
        return shuffled.slice(0, Math.min(n, kcseData.length));
    }

    function setMode(newMode) {
        mode = newMode;

        if (mode === 'all') {
            modeBadge.textContent = 'Mode: Show All';
            btnBackSet.style.display = 'inline-block';
            btnNewSet.disabled = true;
            setSizeSelect.disabled = true;

            currentIndices = Array.from({ length: kcseData.length }, (_, i) => i);
            renderQuestions(currentIndices);
        } else {
            modeBadge.textContent = 'Mode: Random Set';
            btnBackSet.style.display = 'none';
            btnNewSet.disabled = false;
            setSizeSelect.disabled = false;

            currentIndices = pickRandomSet(setSize);
            renderQuestions(currentIndices);
        }
    }

    // Wire controls
    setSizeSelect.addEventListener('change', () => {
        setSize = parseInt(setSizeSelect.value, 10) || 5;
        if (mode === 'set') {
            currentIndices = pickRandomSet(setSize);
            renderQuestions(currentIndices);
        }
    });

    btnNewSet.addEventListener('click', () => {
        if (mode !== 'set') return;
        currentIndices = pickRandomSet(setSize);
        renderQuestions(currentIndices);
        // small UX: jump to top of KCSE container
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    btnShowAll.addEventListener('click', () => setMode('all'));
    btnBackSet.addEventListener('click', () => setMode('set'));

    // Initial render: random set of 5
    setMode('set');
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadQuiz();
    loadKCSEDrill();
    setupTools();
    setupBackToTop();
    populateQuickJump();
    loadSubjectLibrary();
});
