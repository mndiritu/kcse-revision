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

        // Click card toggles topic list
        card.addEventListener('click', (e) => {
            // avoid accidental selection behaviour
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

/* ---------- KCSE Drill (new tab) ---------- */
function loadKCSEDrill() {
    const container = document.getElementById('kcse-container');
    if (!container || typeof kcseData === 'undefined') return;

    let total = 0;
    let earned = 0;

    function renderScore() {
        const scoreEl = document.getElementById('kcse-score');
        if (!scoreEl) return;
        scoreEl.textContent = `Score: ${earned}/${total}`;
    }

    total = kcseData.reduce((acc, q) => acc + (q.marks || 0), 0);
    earned = 0;

    container.innerHTML = `
        <div class="concept-box">
            <h3>How to use this tab (fast + effective)</h3>
            <ul>
                <li>Attempt the question on paper first (KCSE style).</li>
                <li>Click <strong>Reveal Marking Points</strong> to self-check.</li>
                <li>Tick points you got. The score updates.</li>
            </ul>
            <span class="score-pill" id="kcse-score">Score: 0/${total}</span>
        </div>
    `;

    kcseData.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'drill-card';

        card.innerHTML = `
            <div class="drill-top">
                <div>
                    <span class="badge">Q${idx + 1} • ${q.marks} marks</span>
                </div>
                <button class="reveal-btn" type="button">Reveal marking points</button>
            </div>
            <p style="margin: 10px 0 0 0;"><strong>${q.prompt}</strong></p>

            <div class="marking" hidden>
                <div style="font-weight: 900; margin-bottom: 6px;">Marking points:</div>
                <div class="marking-points"></div>
            </div>
        `;

        const revealBtn = card.querySelector('.reveal-btn');
        const markingBox = card.querySelector('.marking');
        const pointsBox = card.querySelector('.marking-points');

        // Build checkbox points
        const pointChecks = (q.points || []).map((pt, pIdx) => {
            return `
                <label style="display:block; margin:6px 0; font-weight:700;">
                    <input type="checkbox" data-marks="1" class="kcse-check" />
                    ${pt}
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

        // Score tracking
        card.addEventListener('change', (e) => {
            const target = e.target;
            if (!target.classList.contains('kcse-check')) return;

            if (target.checked) earned += 1;
            else earned -= 1;

            // clamp
            if (earned < 0) earned = 0;
            if (earned > total) earned = total;

            renderScore();
        });

        container.appendChild(card);
    });

    renderScore();
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
