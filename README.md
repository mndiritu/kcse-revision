# KCSE Revision Hub — Project Documentation

**Project Name:** KCSE Revision Hub  
**Version:** 1.1 (MVP + KCSE Drill + Spaced Review)  
**Target Audience:** Form 4 Students (KCSE)  
**Deployment:** GitHub Pages (Static Site)  
**Core Philosophy:** Distraction-free, offline-capable, active recall learning.

---

## 1) What this site is (and why it works)

This is a **static revision website** built with **HTML + CSS + Vanilla JavaScript**.

It’s designed for three things students actually need:

1) **Writing practice (muscle memory)** → structured notes that are copy-friendly  
2) **Fast revision** → 2-page style bullet summaries  
3) **Active recall** → quizzes + KCSE-style questions + spaced review

No logins. No servers. Works on slow internet. Can be used offline once cached by the browser.

---

## 2) Project Architecture

The project follows a **Subject-Folder Architecture**.

### Directory structure

```
root/
├── index.html                      # Dashboard (Subject Selector)
├── style.css                       # Global Stylesheet (Single Source of Truth)
├── main.js                         # Tabs + Quiz + KCSE Drill + Spaced Review
├── template.html                   # MASTER BLUEPRINT (Copy this for new topics)
├── topics.js                       # Auto-generated topic registry (DO NOT edit by hand)
├── scripts/
│   └── generate_topics_manifest.py # Generates topics.js
├── history/
│   └── cooperation-in-africa.html
├── physics/
├── chemistry/
├── biology/
├── mathematics/
├── english/
├── kiswahili/
└── computer/
```

> **Why do we generate `topics.js`?**  
> GitHub Pages is a static host, so the browser can’t reliably “read folders” at runtime.  
> We pre-generate a topic registry (`topics.js`) and commit it.

---

## 3) Core Files & What They Do

### A) `style.css`
Theme: professional, calm academic theme (Navy + Soft Blue).  
Reusable components:
- `.tabs`, `.tab-btn`, `.content-section` — tab system
- `.concept-box` — definitions / key points
- `.question-block`, `.option-btn` — quiz UI
- (optional) `.drill-card` — KCSE Drill cards (if used)

### B) `main.js`
Controls:
- Tab switching
- Interactive Quiz rendering (reads `quizData` defined in topic pages)
- (New) KCSE Drill tab (reads `kcseData` defined in topic pages)
- (New) Spaced Review scheduling (stores progress in `localStorage`)

### C) `template.html`
Blueprint for every topic page:
- Tab 1: **📝 Notes for Writing**
- Tab 2: **⚡ Quick Revision**
- Tab 3: **🎯 KCSE Drill (Interactive)**
- Tab 4: **✍️ Interactive Quiz (MCQ)**

---

## 4) Topic Page “Data” Requirements

Each topic page can define one or both datasets.

### A) `quizData` (MCQ Quiz)
Used by the **Interactive Quiz** tab.

```js
const quizData = [
  {
    question: "When was the OAU formed?",
    options: ["1958", "1963", "2002", "1945"],
    correct: 1,
    explanation: "The OAU was formed in May 1963 in Addis Ababa."
  }
];
```

Rules:
- 5–10 questions minimum (where possible)
- Explanations are mandatory (help the student learn, not guess)

### B) `kcseData` (KCSE Drill + Spaced Review)
Used by the **KCSE Drill** tab.

```js
const kcseData = [
  {
    marks: 8,
    prompt: "Explain why the Manchester Conference (1945) was important. (8 marks)",
    points: [
      "It was dominated/led by Africans and African nationalists.",
      "Demanded immediate independence and political power.",
      "Supported mass action: strikes, boycotts, protests.",
      "Trade unions were represented; stronger mass mobilization.",
      "Inspired future nationalist leaders (e.g., Nkrumah, Kenyatta, Banda)."
    ]
  }
];
```

---

## 5) KCSE Drill (Interactive)

The KCSE Drill tab is meant to simulate exam revision:

- Student reads a question
- Attempts it on paper
- Clicks **Show Marking Points**
- Checks what they got right
- Saves the attempt

This moves revision from “reading” to “recall”.

---

## 6) Spaced Review (Student Memory Engine)

Spaced Review is a lightweight “bring back weak questions” system.

### How it works
- If a student scores low on a KCSE Drill question, it returns sooner.
- If a student scores well repeatedly, it returns later.

### Where progress is stored
In the browser using `localStorage`:
- **Offline friendly**
- **Device-specific** (a different phone/laptop won’t share progress)

### Resetting progress
There is a reset button in the drill UI (if enabled).  
Or clear site data in the browser settings.

---

## 7) Avoiding “Endless Scrolling” (Recommended Page Pattern)

Long topics should still feel usable. Use:
- Clear headings (`<h3>`, `<h4>`)
- `<hr>` to break sections
- Keep “Quick Revision” short and punchy
- Put exam-style prompts and key dates in boxes

(If you want even more control later, we can add a “Quick Jump” dropdown and collapsible sections—still pure HTML.)

---

## 8) How to Add a New Topic (The Correct Workflow)

### Step 1 — Copy the template
Example:
```bash
cp template.html history/african-nationalism.html
```

### Step 2 — Fill the content
In the new topic page:
- Replace the notes content (Tab 1)
- Replace quick revision content (Tab 2)
- Add/Update `kcseData` (Tab 3)
- Add/Update `quizData` (Tab 4)

### Step 3 — Ensure shared asset links are correct
Topic pages inside folders should reference assets like:
```html
<link rel="stylesheet" href="../style.css">
<script src="../main.js"></script>
```

### Step 4 — Regenerate the topic registry
Run at repo root:
```bash
python3 scripts/generate_topics_manifest.py
```

This overwrites:
- `topics.js` (auto-generated)

### Step 5 — Commit and push
```bash
git add history/african-nationalism.html topics.js
git commit -m "Add History topic: African Nationalism"
git push
```

> **Do not hand-edit `topics.js`.**  
> It is generated automatically.

---

## 9) Topic Titles & Tags (Dashboard Display)

The generator builds each topic entry using:

1) Page `<title>` (if present)  
2) Otherwise, it derives a title from the filename

You can optionally add tags in the topic HTML head:

```html
<meta name="tags" content="Form 4, KCSE, Paper 1">
```

Those tags will appear in the manifest (useful later for search/filtering).

---

## 10) Deployment (GitHub Pages)

1. Push to `main`
2. GitHub repo → **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` / root

Site will load from:
`https://<username>.github.io/<repo>/`

---

## 11) Content Builder / Agent Instructions (SKILLS)

**Role:** Curriculum Developer for Kenyan syllabus (Form 4).

### Rule 1 — Content Fidelity
- Do not invent facts.
- Use provided notes/slides.
- Ensure key dates, names, and definitions are included.

### Rule 2 — Formatting Rules
**Notes for Writing (Tab 1)**
- Use `<h3>` main headings
- Use `<h4>` sub-headings
- Use `<table>` for comparisons
- Use `<div class="concept-box">` for definitions / must-know lists

**Quick Revision (Tab 2)**
- Bullet points
- Include Key Dates + “10-mark prompts”

**KCSE Drill (Tab 3)**
- Provide marking points (bullet list)
- Include marks per question

**Interactive Quiz (Tab 4)**
- 5–10 MCQs minimum
- Explanation required for every MCQ

---

## 12) Quick Commands

Regenerate topic registry:
```bash
python3 scripts/generate_topics_manifest.py
```

Preview locally:
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
