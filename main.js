/* KCSE Revision Hub - main.js
   - Topic pages: Tabs, Quick Jump, Expand/Collapse, Back-to-top, MCQ Quiz, KCSE Drill (Spaced Review)
   - Dashboard (index.html): Subject library expands/collapses and injects topics from topics.js (window.KCSE_TOPICS)
*/

(function () {
  "use strict";

  /* ---------- Tabs (topic pages) ---------- */
  function setupTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    if (!tabs || tabs.length === 0) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".content-section").forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");

        const targetId = tab.getAttribute("data-target");
        const target = document.getElementById(targetId);
        if (target) target.classList.add("active");

        // Keep quick-jump in sync with the active tab
        populateQuickJump();
      });
    });
  }

  /* ---------- MCQ Quiz ---------- */
  function loadQuiz() {
    const container = document.getElementById("quiz-container");
    if (!container || typeof quizData === "undefined") return;

    container.innerHTML = "";

    quizData.forEach((item, index) => {
      const qDiv = document.createElement("div");
      qDiv.className = "question-block";

      const qTitle = document.createElement("p");
      qTitle.innerHTML = `<strong>${index + 1}. ${item.question}</strong>`;
      qDiv.appendChild(qTitle);

      const optionsDiv = document.createElement("div");
      item.options.forEach((opt, optIndex) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.type = "button";
        btn.innerText = opt;

        // Use addEventListener (cleaner than onclick; avoids accidental overwrites)
        btn.addEventListener("click", () =>
          checkAnswer(btn, optIndex, item.correct, item.explanation, qDiv)
        );

        optionsDiv.appendChild(btn);
      });
      qDiv.appendChild(optionsDiv);

      const feedbackDiv = document.createElement("div");
      feedbackDiv.className = "feedback";
      qDiv.appendChild(feedbackDiv);

      container.appendChild(qDiv);
    });
  }

  // FIX: feedback selection must be robust (nextSibling can be a text node)
  function checkAnswer(btn, selectedIndex, correctIndex, explanation, questionBlock) {
    const buttons = questionBlock.querySelectorAll(".option-btn");
    const feedback = questionBlock.querySelector(".feedback");

    buttons.forEach((b) => (b.disabled = true));

    if (selectedIndex === correctIndex) {
      btn.classList.add("correct");
      if (feedback) {
        feedback.innerHTML = `✅ Correct! ${explanation || ""}`.trim();
        feedback.style.color = "green";
      }
    } else {
      btn.classList.add("wrong");
      if (buttons[correctIndex]) buttons[correctIndex].classList.add("correct");
      if (feedback) {
        feedback.innerHTML = `❌ Incorrect. ${explanation || ""}`.trim();
        feedback.style.color = "red";
      }
    }
  }

  /* ---------- Topic tools: Quick jump + Expand/Collapse + Back to top ---------- */
  function getActiveSection() {
    return document.querySelector(".content-section.active") || null;
  }

  function getJumpTargetsForActiveSection() {
    const active = getActiveSection();
    if (!active) return [];

    const summaries = Array.from(active.querySelectorAll("summary[id]"));
    if (summaries.length > 0) {
      return summaries.map((el) => ({ id: el.id, text: el.textContent.trim() }));
    }

    const headings = Array.from(active.querySelectorAll("h2[id], h3[id]"));
    return headings.map((el) => ({ id: el.id, text: el.textContent.trim() }));
  }

  function populateQuickJump() {
    const select = document.getElementById("quick-jump");
    if (!select) return;

    const targets = getJumpTargetsForActiveSection();
    select.innerHTML = `<option value="">Select a section…</option>`;

    targets.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.text;
      select.appendChild(opt);
    });
  }

  function jumpToSelected() {
    const select = document.getElementById("quick-jump");
    if (!select || !select.value) return;

    const el = document.getElementById(select.value);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setAllDetails(open) {
    const notes = document.getElementById("writing-notes");
    const isNotesActive = notes && notes.classList.contains("active");
    if (!isNotesActive) return;

    document.querySelectorAll("#writing-notes details.note-section").forEach((d) => {
      d.open = open;
    });
  }

  function setupTools() {
    const jumpBtn = document.getElementById("jump-btn");
    if (jumpBtn) jumpBtn.addEventListener("click", jumpToSelected);

    const expandAll = document.getElementById("expand-all");
    if (expandAll) expandAll.addEventListener("click", () => setAllDetails(true));

    const collapseAll = document.getElementById("collapse-all");
    if (collapseAll) collapseAll.addEventListener("click", () => setAllDetails(false));
  }

  function setupBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;

    const toggle = () => {
      if (window.scrollY > 500) btn.style.display = "block";
      else btn.style.display = "none";
    };

    window.addEventListener("scroll", toggle);
    toggle();

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- KCSE Drill: Spaced Review (SM-2-ish) ---------- */

  const KCSE_SR_STORAGE_KEY = "kcse_spaced_review_v1";

  function nowMs() {
    return Date.now();
  }

  function daysToMs(days) {
    return days * 24 * 60 * 60 * 1000;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function roundToHalf(x) {
    return Math.round(x * 2) / 2;
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function loadSRState() {
    try {
      const raw = localStorage.getItem(KCSE_SR_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveSRState(state) {
    localStorage.setItem(KCSE_SR_STORAGE_KEY, JSON.stringify(state));
  }

  function resetSRState() {
    localStorage.removeItem(KCSE_SR_STORAGE_KEY);
  }

  function scoreToQuality(pct) {
    if (pct >= 0.9) return 5;
    if (pct >= 0.8) return 4;
    if (pct >= 0.65) return 3;
    if (pct >= 0.5) return 2;
    if (pct >= 0.3) return 1;
    return 0;
  }

  function updateSM2(entry, pctScore) {
    const quality = scoreToQuality(pctScore);

    let ef = entry.ef ?? 2.5;
    let reps = entry.reps ?? 0;
    let intervalDays = entry.intervalDays ?? 0;

    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ef = clamp(ef, 1.3, 2.7);

    const successful = quality >= 3;

    if (!successful) {
      reps = 0;
      intervalDays = 1;
    } else {
      reps += 1;
      if (reps === 1) intervalDays = 1;
      else if (reps === 2) intervalDays = 3;
      else intervalDays = Math.round(intervalDays * ef);
      intervalDays = clamp(intervalDays, 1, 60);
    }

    const dueAt = nowMs() + daysToMs(intervalDays);

    return {
      ef,
      reps,
      intervalDays,
      dueAt,
      lastScore: pctScore,
      lastSeenAt: nowMs(),
    };
  }

  function getDueIndices(srState, totalQuestions) {
    const t = nowMs();
    const due = [];

    for (let i = 0; i < totalQuestions; i++) {
      const e = srState[i];
      if (!e) continue;
      if (typeof e.dueAt !== "number") continue;
      if (e.dueAt <= t) due.push(i);
    }

    return due;
  }

  function pickSpacedSet(srState, totalQuestions, setSize) {
    const due = getDueIndices(srState, totalQuestions);
    const chosen = [];

    const dueShuffled = shuffleArray(due);
    for (const idx of dueShuffled) {
      if (chosen.length >= setSize) break;
      chosen.push(idx);
    }

    if (chosen.length < setSize) {
      const candidates = [];
      for (let i = 0; i < totalQuestions; i++) {
        if (chosen.includes(i)) continue;
        const e = srState[i];
        const lastSeenAt = e?.lastSeenAt ?? 0;
        candidates.push({ i, lastSeenAt });
      }

      candidates.sort((a, b) => a.lastSeenAt - b.lastSeenAt);

      const oldestSlice = candidates.slice(0, Math.min(30, candidates.length));
      const shuffledOldest = shuffleArray(oldestSlice);

      for (const c of shuffledOldest) {
        if (chosen.length >= setSize) break;
        chosen.push(c.i);
      }
    }

    return chosen;
  }

  function computeQuestionScore(cardEl) {
    const checks = cardEl.querySelectorAll("input.kcse-check");
    let earned = 0;
    let total = 0;

    checks.forEach((chk) => {
      const value = parseFloat(chk.getAttribute("data-value") || "0");
      total += value;
      if (chk.checked) earned += value;
    });

    total = roundToHalf(total);
    earned = roundToHalf(earned);

    const pct = total > 0 ? earned / total : 0;
    return { earned, total, pct };
  }

  function loadKCSEDrill() {
    const container = document.getElementById("kcse-container");
    if (!container || typeof kcseData === "undefined" || !Array.isArray(kcseData)) return;

    let srState = loadSRState();

    let mode = "spaced";
    let setSize = 5;
    let currentIndices = [];

    const totalQuestions = kcseData.length;

    function dueCount() {
      return getDueIndices(srState, totalQuestions).length;
    }

    container.innerHTML = `
      <div class="concept-box">
        <h3>KCSE Drill (Spaced Review)</h3>
        <ul>
          <li>Attempt on paper first. Then mark honestly.</li>
          <li>Use <strong>Review Due</strong> to hit weak spots.</li>
          <li>Press <strong>Save attempt</strong> per question to schedule it correctly.</li>
        </ul>

        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px;">
          <span class="badge" id="kcse-mode-badge">Mode: Spaced Review</span>
          <span class="score-pill" id="kcse-due-pill">Due: ${dueCount()}</span>

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
          <button class="reveal-btn" id="kcse-review-due" type="button">Review Due</button>
          <button class="reveal-btn" id="kcse-show-all" type="button">Show All</button>
          <button class="reveal-btn" id="kcse-back-set" type="button" style="display:none;">Back to Spaced Review</button>
          <button class="reveal-btn" id="kcse-reset" type="button" style="border-color:#ef4444; color:#7f1d1d;">Reset Progress</button>

          <span class="score-pill" id="kcse-score">Set Score: 0/0</span>
        </div>
      </div>

      <div id="kcse-questions"></div>
    `;

    const questionsHost = container.querySelector("#kcse-questions");
    const scoreEl = container.querySelector("#kcse-score");
    const duePill = container.querySelector("#kcse-due-pill");
    const modeBadge = container.querySelector("#kcse-mode-badge");

    const setSizeSelect = container.querySelector("#kcse-set-size");
    const btnNewSet = container.querySelector("#kcse-new-set");
    const btnReviewDue = container.querySelector("#kcse-review-due");
    const btnShowAll = container.querySelector("#kcse-show-all");
    const btnBackSet = container.querySelector("#kcse-back-set");
    const btnReset = container.querySelector("#kcse-reset");

    function refreshDuePill() {
      duePill.textContent = `Due: ${dueCount()}`;
    }

    function computeAndRenderSetScore() {
      const allChecks = questionsHost.querySelectorAll("input.kcse-check");
      let earned = 0;
      let total = 0;

      allChecks.forEach((chk) => {
        const value = parseFloat(chk.getAttribute("data-value") || "0");
        total += value;
        if (chk.checked) earned += value;
      });

      earned = roundToHalf(earned);
      total = roundToHalf(total);

      scoreEl.textContent = `Set Score: ${earned}/${total}`;
    }

    function renderQuestions(indices) {
      questionsHost.innerHTML = "";

      indices.forEach((idx, order) => {
        const q = kcseData[idx];
        const marks = Number(q.marks || 0);
        const points = Array.isArray(q.points) ? q.points : [];
        const perPoint = points.length > 0 && marks > 0 ? marks / points.length : 0;

        const card = document.createElement("div");
        card.className = "drill-card";
        card.setAttribute("data-qid", String(idx));

        const history = srState[idx];
        const historyLine = history
          ? `Last: ${(history.lastScore * 100).toFixed(0)}% • Next due in ${Math.max(
              0,
              Math.ceil((history.dueAt - nowMs()) / daysToMs(1))
            )} day(s)`
          : `New: not attempted yet`;

        card.innerHTML = `
          <div class="drill-top">
            <div>
              <span class="badge">Q${order + 1} • ${marks} marks</span>
              <span style="margin-left:10px; color:#64748b; font-weight:800; font-size:0.9rem;">${historyLine}</span>
            </div>
            <button class="reveal-btn" type="button">Reveal marking points</button>
          </div>

          <p style="margin: 10px 0 0 0;"><strong>${q.prompt || ""}</strong></p>

          <div class="marking" hidden>
            <div style="font-weight: 900; margin-bottom: 6px;">Marking points (tick what you got):</div>
            <div class="marking-points"></div>

            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px;">
              <span class="score-pill" id="q-score-${idx}">This Q: 0/${marks}</span>
              <button class="reveal-btn" type="button" id="save-attempt-${idx}">Save attempt</button>
              <span style="color:#64748b; font-weight:800; font-size:0.9rem;" id="save-status-${idx}"></span>
            </div>

            <div style="margin-top:10px; color:#64748b; font-weight:700; font-size:0.9rem;">
              Tip: Save attempt AFTER ticking. That’s what schedules it for spaced review.
            </div>
          </div>
        `;

        const revealBtn = card.querySelector(".reveal-btn");
        const markingBox = card.querySelector(".marking");
        const pointsBox = card.querySelector(".marking-points");

        const qScoreEl = card.querySelector(`#q-score-${idx}`);
        const saveBtn = card.querySelector(`#save-attempt-${idx}`);
        const saveStatus = card.querySelector(`#save-status-${idx}`);

        pointsBox.innerHTML = points
          .map((pt) => {
            const value = roundToHalf(perPoint);
            return `
              <label style="display:block; margin:6px 0; font-weight:700;">
                <input type="checkbox" class="kcse-check" data-value="${value}" />
                ${pt}
                <span style="color:#64748b; font-weight:800; font-size:0.85rem; margin-left:6px;">(${value}m)</span>
              </label>
            `;
          })
          .join("");

        function updateThisQuestionScoreUI() {
          const { earned, total } = computeQuestionScore(card);
          qScoreEl.textContent = `This Q: ${earned}/${total}`;
        }

        revealBtn.addEventListener("click", () => {
          const isHidden = markingBox.hasAttribute("hidden");
          if (isHidden) {
            markingBox.removeAttribute("hidden");
            revealBtn.textContent = "Hide marking points";
          } else {
            markingBox.setAttribute("hidden", "");
            revealBtn.textContent = "Reveal marking points";
          }
        });

        card.addEventListener("change", (e) => {
          if (e.target && e.target.classList.contains("kcse-check")) {
            updateThisQuestionScoreUI();
            computeAndRenderSetScore();
          }
        });

        saveBtn.addEventListener("click", () => {
          const { pct } = computeQuestionScore(card);

          const current = srState[idx] || {
            ef: 2.5,
            reps: 0,
            intervalDays: 0,
            dueAt: nowMs(),
          };

          srState[idx] = updateSM2(current, pct);
          saveSRState(srState);

          const pctText = (pct * 100).toFixed(0);
          saveStatus.textContent = `Saved: ${pctText}% • next due in ${srState[idx].intervalDays} day(s)`;
          refreshDuePill();

          if (pct < 0.65) {
            saveStatus.textContent += " • (Will come back soon — that’s good.)";
          }
        });

        updateThisQuestionScoreUI();
        questionsHost.appendChild(card);
      });

      computeAndRenderSetScore();
    }

    function setMode(newMode) {
      mode = newMode;

      if (mode === "all") {
        modeBadge.textContent = "Mode: Show All";
        btnBackSet.style.display = "inline-block";
        btnNewSet.disabled = true;
        btnReviewDue.disabled = true;
        setSizeSelect.disabled = true;

        currentIndices = Array.from({ length: totalQuestions }, (_, i) => i);
        renderQuestions(currentIndices);
        return;
      }

      modeBadge.textContent = mode === "due" ? "Mode: Review Due" : "Mode: Spaced Review";
      btnBackSet.style.display = "none";
      btnNewSet.disabled = false;
      btnReviewDue.disabled = false;
      setSizeSelect.disabled = false;

      if (mode === "due") {
        const due = getDueIndices(srState, totalQuestions);
        const take = Math.min(setSize, due.length || setSize);
        currentIndices = due.length
          ? shuffleArray(due).slice(0, take)
          : pickSpacedSet(srState, totalQuestions, setSize);
        renderQuestions(currentIndices);
      } else {
        currentIndices = pickSpacedSet(srState, totalQuestions, setSize);
        renderQuestions(currentIndices);
      }
    }

    setSizeSelect.addEventListener("change", () => {
      setSize = parseInt(setSizeSelect.value, 10) || 5;
      if (mode === "all") return;
      setMode(mode);
    });

    btnNewSet.addEventListener("click", () => {
      if (mode === "all") return;
      setMode("spaced");
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    btnReviewDue.addEventListener("click", () => {
      if (mode === "all") return;
      setMode("due");
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    btnShowAll.addEventListener("click", () => setMode("all"));
    btnBackSet.addEventListener("click", () => setMode("spaced"));

    btnReset.addEventListener("click", () => {
      const ok = confirm("Reset spaced review progress for ALL KCSE drill questions? This cannot be undone.");
      if (!ok) return;
      resetSRState();
      srState = loadSRState();
      refreshDuePill();
      setMode("spaced");
    });

    refreshDuePill();
    setMode("spaced");
  }

  /* ---------- Index: Subject library (dashboard) ---------- */
  function loadSubjectLibrary() {
    const grid = document.getElementById("subject-grid");
    const cards = document.querySelectorAll(".subject-card");
    if (!grid || !cards.length) return; // not on dashboard

    const topics = window.KCSE_TOPICS; // from topics.js
    // index.html loads topics.js before main.js :contentReference[oaicite:1]{index=1}

    cards.forEach((card) => {
      const subject = card.getAttribute("data-subject");
      const head = card.querySelector(".card-head");
      const box = card.querySelector(".topics");

      if (!subject || !head || !box) return;

      // Build topic list
      const list = topics && Array.isArray(topics[subject]) ? topics[subject] : [];

      box.innerHTML = "";

      if (!topics) {
        box.innerHTML = `<div style="padding:10px 0; color:#64748b; font-weight:700;">
          topics.js not loaded. Run: <code>python3 scripts/generate_topics_manifest.py</code> and commit <code>topics.js</code>.
        </div>`;
      } else if (!list.length) {
        box.innerHTML = `<div style="padding:10px 0; color:#64748b; font-weight:700;">
          No topics found yet for this subject.
        </div>`;
      } else {
        list.forEach((t) => {
          const a = document.createElement("a");
          a.href = t.path;
          a.className = "topic-link";
          a.textContent = t.title || t.path;
          box.appendChild(a);
        });
      }

      // Accordion toggle
      head.style.cursor = "pointer";
      head.addEventListener("click", () => {
        const isHidden = box.hasAttribute("hidden");

        // close all
        cards.forEach((c) => {
          const other = c.querySelector(".topics");
          if (other) other.setAttribute("hidden", "");
        });

        // toggle this
        if (isHidden) box.removeAttribute("hidden");
        else box.setAttribute("hidden", "");
      });
    });

    // Click outside closes all
    document.addEventListener("click", (e) => {
      const inside = e.target.closest && e.target.closest(".subject-card");
      if (inside) return;
      cards.forEach((c) => {
        const box = c.querySelector(".topics");
        if (box) box.setAttribute("hidden", "");
      });
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    loadQuiz();
    loadKCSEDrill();
    setupTools();
    setupBackToTop();
    populateQuickJump();
    loadSubjectLibrary();
  });
})();
