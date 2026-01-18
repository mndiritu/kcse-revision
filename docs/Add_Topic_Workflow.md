# Adding a New Topic (Teacher Workflow) — KCSE Revision Hub

This guide shows how to add new KCSE topics (e.g., Physics, History, Chemistry) into the **KCSE Revision Hub** GitHub Pages site, using the existing template + auto-generated `topics.js`.

The goal is to produce a topic page that:
- Matches the site look-and-feel
- Has all required tabs (Writing Notes, Quick Revision, KCSE Drill, MCQ Quiz)
- Shows up automatically on the dashboard after regenerating `topics.js`

---

## 1) What you will create

You will create **one HTML file per topic** inside the subject folder.

Example:
- Subject folder: `physics/`
- Topic file: `physics/refraction-and-lenses.html`
- Page title: `Refraction and Lenses (Form 4)`

---

## 2) What I (ChatGPT) need from you to generate a topic page

To generate a topic page accurately (KCSE-level, not invented), you must provide enough context.

### A) Your raw notes (required)
Provide **any** of the following:
- Paste text notes
- Upload a PDF/DOCX
- Upload photos/screenshots of handwritten notes
- Provide an outline + key definitions
- Provide KCSE marking scheme excerpts (if you have them)

**Tip:** Don’t over-polish. Dump the notes as-is. The system will structure them.

### B) Scope + exam priorities (required, short)
In 1–3 lines, tell me:
- Confirm it is **Form 4 KCSE level**
- What to emphasize (e.g., ray diagrams, definitions, formulas, comparisons)
- What to exclude (if anything)

### C) Teacher voice (pick one)
- Beginner-friendly
- Normal KCSE class
- High-performing class (more challenge)

### D) Classroom reality (optional but useful)
This changes the examples and practicals I include:
- “We have lenses and ray box”
- “No lab equipment”
- “We can use phone flashlight”

### E) Question targets (optional)
Defaults if not specified:
- KCSE Drill: 8–12 questions
- MCQ Quiz: 10 questions

---

## 3) What the generated topic page will include

Your topic page will have **four tabs**:

### Tab 1: 📝 Notes for Writing (copy-friendly)
- Clean headings + subheadings
- Definitions in concept boxes
- Key formulas
- Worked examples (KCSE style)
- Diagrams described clearly (text-based guidance)

### Tab 2: ⚡ Quick Revision (2-page style)
- Bullet summaries
- Key definitions + key formulas
- Common mistakes
- “10-mark prompts” + short-answer prompts

### Tab 3: 🎯 KCSE Drill (interactive + spaced review)
- `kcseData = [...]` questions with:
  - Marks per question
  - Marking points (tickable)
  - Works with spaced review

### Tab 4: ✍️ MCQ Quiz (interactive)
- `quizData = [...]` with:
  - MCQs (default 10)
  - Explanations for each answer

### Plus metadata for dashboard display
- `<title>...</title>` (preferred for nice dashboard titles)
- Optional tags:
  ```html
  <meta name="tags" content="Form 4, KCSE, Physics, Paper 2">
  ```

---

## 4) How to add the new topic file to the repo

### Step 1 — Pick a filename and title
Use **kebab-case** for filenames:
- ✅ `refraction-and-lenses.html`
- ❌ `Refraction And Lenses.html`

### Step 2 — Create the file
Option A (copy template then replace content):
```bash
cp template.html physics/refraction-and-lenses.html
```

Option B (create empty file, paste generated HTML):
```bash
touch physics/refraction-and-lenses.html
```

Then paste the generated full HTML content into the file.

---

## 5) Regenerate the dashboard topic list

After adding the topic file, regenerate `topics.js`:

```bash
python3 scripts/generate_topics_manifest.py
```

This will overwrite **topics.js** with an updated topic registry.

**Important:** Do not hand-edit `topics.js`. Always regenerate it.

---

## 6) Commit and push

```bash
git add physics/refraction-and-lenses.html topics.js
git commit -m "Add Physics topic: Refraction and Lenses"
git push
```

Your new topic should now appear on the dashboard.

---

## 7) Prompt template (copy-paste) for generating new topics

Use this prompt each time you want a new topic created.

Replace the bracketed parts:

```text
You are helping me add a new topic to my KCSE Revision Hub (GitHub Pages).

SUBJECT FOLDER: physics
TOPIC FILENAME (kebab-case): [e.g. refraction-and-lenses.html]
PAGE TITLE: [e.g. Refraction and Lenses (Form 4)]
TAGS (comma-separated): Form 4, KCSE, Physics, [optional tags]

STUDENT LEVEL: Form 4 KCSE
TEACHER VOICE: [beginner-friendly / normal KCSE / high-performing]
SCOPE: Include [....] and exclude [....]
CLASSROOM REALITY: [what equipment I have / low-resource constraints]

CONTENT SOURCE (paste or attach):
[Paste your notes / excerpts / photos / marking scheme content here]

OUTPUT REQUIREMENTS:
- Return ONE complete HTML file content matching our site style and tabs.
- Tabs required: Notes for Writing, Quick Revision, KCSE Drill, MCQ Quiz.
- Include kcseData (8–12 KCSE questions with marking points + marks).
- Include quizData (10 MCQs with explanations).
- Use headings with ids and/or <details><summary id=...> so quick-jump works.
- Use <title> and <meta name="tags"...> so dashboard shows a good title.
- Keep it KCSE accurate; do not invent facts not supported by my notes.
```

---

## 8) Common problems (quick fixes)

### A) Topic doesn’t show on dashboard
1. Confirm the file exists in the correct folder (e.g. `physics/`).
2. Regenerate:
   ```bash
   python3 scripts/generate_topics_manifest.py
   ```
3. Confirm you committed `topics.js` and pushed.

### B) Dashboard loads but no topics appear
- Ensure `index.html` loads `topics.js` **before** `main.js`:
  ```html
  <script src="topics.js"></script>
  <script src="main.js"></script>
  ```

### C) Quick Jump dropdown is empty
- Ensure headings have IDs OR use:
  ```html
  <details class="note-section">
    <summary id="section-id">Section title</summary>
    ...
  </details>
  ```

---

## 9) Recommended topic quality checklist (teacher)

Before you publish a topic, check:
- [ ] Definitions are correct and simple
- [ ] Key formulas included
- [ ] Quick Revision tab is short enough to revise fast
- [ ] KCSE Drill has marking points and marks
- [ ] MCQs have explanations
- [ ] Title is meaningful (not just the filename)
