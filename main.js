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
