#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# 1. Define Project Name
PROJECT_NAME="kcse-revision"

echo "🚀 Initializing KCSE Revision Hub..."

# 2. Create Directory Structure
if [ -d "$PROJECT_NAME" ]; then
    echo "Directory $PROJECT_NAME already exists. Please remove it or rename it."
    exit 1
fi

mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Create Subject Folders
mkdir -p physics mathematics history chemistry biology computer english kiswahili images

echo "📂 Directories created."

# 3. Create style.css
cat > style.css <<'EOF'
:root {
    --primary: #2563eb;
    --secondary: #1e40af;
    --background: #f8fafc;
    --surface: #ffffff;
    --text: #334155;
    --success: #dcfce7;
    --success-text: #166534;
    --error: #fee2e2;
    --error-text: #991b1b;
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background-color: var(--background);
    color: var(--text);
    margin: 0;
    line-height: 1.6;
}

header {
    background: var(--primary);
    color: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
header a { color: white; text-decoration: none; font-weight: bold; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; }

/* Dashboard Grid */
.subject-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
}
.card {
    background: var(--surface);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    text-decoration: none;
    color: var(--text);
    border-left: 5px solid var(--primary);
    transition: transform 0.2s;
    display: block;
}
.card:hover { transform: translateY(-3px); }
.card h3 { margin: 0 0 10px 0; color: var(--primary); }

/* Topic Page: Tabs */
.tabs { display: flex; gap: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; }
.tab-btn {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #64748b;
}
.tab-btn.active {
    border-bottom: 3px solid var(--primary);
    color: var(--primary);
    font-weight: bold;
}
.content-section { display: none; }
.content-section.active { display: block; }

/* Note Content */
.notes-content ul { padding-left: 20px; }
.notes-content li { margin-bottom: 8px; }
blockquote {
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
    margin: 10px 0;
    padding: 10px;
}

/* Quiz UI */
.question-block {
    background: var(--surface);
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}
.option-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #cbd5e1;
    background: white;
    border-radius: 4px;
    cursor: pointer;
}
.option-btn:hover { background: #f1f5f9; }
.option-btn.correct { background: var(--success); border-color: var(--success-text); color: var(--success-text); }
.option-btn.wrong { background: var(--error); border-color: var(--error-text); color: var(--error-text); }
.feedback { margin-top: 10px; font-weight: bold; font-size: 0.9rem; }
EOF

# 4. Create main.js
cat > main.js <<'EOF'
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

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

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadQuiz();
});
EOF

# 5. Create index.html (Dashboard)
cat > index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KCSE Revision Hub</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>🇰🇪 KCSE Revision Hub</h1>
            <p>Form 4: Focused Revision & Active Recall</p>
        </div>
    </header>
    <div class="container">
        <h2>Subject Library</h2>
        <div class="subject-grid">
            <a href="physics/" class="card"><h3>⚛️ Physics</h3><p>Select Topic</p></a>
            <a href="mathematics/" class="card"><h3>📐 Mathematics</h3><p>Select Topic</p></a>
            <a href="history/" class="card"><h3>🌍 History</h3><p>Select Topic</p></a>
            <a href="chemistry/" class="card"><h3>🧪 Chemistry</h3><p>Select Topic</p></a>
            <a href="biology/" class="card"><h3>🧬 Biology</h3><p>Select Topic</p></a>
            <a href="computer/" class="card"><h3>💻 Computer</h3><p>Select Topic</p></a>
            <a href="english/" class="card"><h3>📖 English</h3><p>Select Topic</p></a>
            <a href="kiswahili/" class="card"><h3>🗣️ Kiswahili</h3><p>Select Topic</p></a>
        </div>
    </div>
</body>
</html>
EOF

# 6. Create template.html (Master Template)
cat > template.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Topic Revision</title>
    <link rel="stylesheet" href="../style.css">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
    <header>
        <div class="container">
            <a href="../index.html">&larr; Back to Dashboard</a>
            <h1 id="topic-title">Topic Name Here</h1>
        </div>
    </header>
    <div class="container">
        <div class="tabs">
            <button class="tab-btn active" data-target="notes-view">📖 Revision Notes</button>
            <button class="tab-btn" data-target="quiz-view">✍️ Interactive Quiz</button>
        </div>
        <div id="notes-view" class="content-section active notes-content">
            <p>Notes content will go here...</p>
        </div>
        <div id="quiz-view" class="content-section">
            <div id="quiz-container"></div>
            <button onclick="location.reload()" style="margin-top:20px; padding:10px;">Reset Quiz</button>
        </div>
    </div>
    <script>
        const quizData = [
            {
                question: "Sample Question?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct: 0,
                explanation: "Explanation goes here."
            }
        ];
    </script>
    <script src="../main.js"></script>
</body>
</html>
EOF

echo "📝 Core files generated."

# 7. Git Initialization and GH CLI Push
echo "⚙️ Initializing Git and creating remote repo..."
git init
git add .
git commit -m "Initial commit: KCSE Revision Hub MVP structure"

# Create the repo publicly (for GitHub Pages) and push
# --source=. uses current directory
# --remote=origin sets the remote name
# --push automatically pushes the commits
gh repo create "$PROJECT_NAME" --public --source=. --remote=origin --push

echo "✅ Success! Repository created at https://github.com/$(gh api user -q .login)/$PROJECT_NAME"
echo "👉 NEXT STEP: Go to Settings > Pages in your repo and set 'Branch' to 'main' to make it live."
