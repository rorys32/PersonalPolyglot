// Personal Polyglot Core Logic
// 1.0.007
// Enhanced Russian grammar support

let languages = [];
let currentLanguage = "German";
let languageData = {};
let progress = {
    German: { daysStudied: 0, materialCovered: 0, quizzesPassed: 0, scores: [], lastDay: null },
    Russian: { daysStudied: 0, materialCovered: 0, quizzesPassed: 0, scores: [], lastDay: null },
    Spanish: { daysStudied: 0, materialCovered: 0, quizzesPassed: 0, scores: [], lastDay: null }
};
let dailyGoal = 10;
let dailyProgress = { German: 0, Russian: 0, Spanish: 0 };

// Fallback data if JSON fails
const fallbackData = {
    German: { phrases: [{"phrase": "Hallo", "translation": "Hello", "phonetics": "HAH-lo", "category": "Greetings"}], grammar: [] },
    Russian: { phrases: [{"phrase": "Привет", "translation": "Hello", "phonetics": "Pree-VYET", "category": "Greetings"}], grammar: [] },
    Spanish: { phrases: [{"phrase": "Hola", "translation": "Hello", "phonetics": "OH-la", "category": "Greetings"}], grammar: [] }
};

// Load language config and phrases
fetch('languages.json')
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch languages.json: ${response.status}`);
        return response.json();
    })
    .then(data => {
        languages = data.languages;
        Promise.all([
            fetch('universal_phrases.json').then(r => {
                if (!r.ok) throw new Error(`Failed to fetch universal_phrases.json: ${r.status}`);
                return r.json();
            }),
            fetch('personal_phrases.json').then(r => {
                if (!r.ok) throw new Error(`Failed to fetch personal_phrases.json: ${r.status}`);
                return r.json();
            })
        ]).then(([universal, personal]) => {
            languageData = {
                German: { phrases: [...universal.German, ...personal.German], grammar: [] },
                Russian: { phrases: [...universal.Russian, ...personal.Russian], grammar: [] },
                Spanish: { phrases: [...universal.Spanish, ...personal.Spanish], grammar: [] }
            };
            languages.forEach(lang => {
                fetch(lang.grammarPath)
                    .then(r => {
                        if (!r.ok) throw new Error(`Failed to fetch ${lang.grammarPath}: ${r.status}`);
                        return r.json();
                    })
                    .then(g => languageData[lang.name].grammar = g.rules)
                    .catch(err => console.error(err));
            });
            initApp();
        }).catch(err => {
            console.error("Promise.all failed:", err);
            languageData = fallbackData;
            initApp();
        });
    })
    .catch(err => {
        console.error("Failed to load languages.json:", err);
        languageData = fallbackData;
        initApp();
    });

// Initialize app
function initApp() {
    renderLanguageContainers();
    document.getElementById('quizzesBtn').addEventListener('click', showQuizzes);
    document.getElementById('progressBtn').addEventListener('click', showProgress);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('resetProgressBtn').addEventListener('click', resetDailyProgress);
    loadProgress();
}

// Render language containers
function renderLanguageContainers() {
    const container = document.getElementById('languageContainers');
    container.innerHTML = '';
    languages.forEach(lang => {
        const div = document.createElement('div');
        div.className = 'language-box';
        div.dataset.lang = lang.name;
        div.innerHTML = `
            <h2>${lang.name}</h2>
            <div class="phrase-container" id="${lang.name}-phrase"></div>
            <button onclick="prevPhrase('${lang.name}')">Back</button>
            <button onclick="nextPhrase('${lang.name}')">Next</button>
        `;
        container.appendChild(div);
        renderPhrase(lang.name, 0);
    });
    new Sortable(container, {
        animation: 150,
        onEnd: () => console.log("Language order updated")
    });
}

// Render phrase for a language
let currentIndices = { German: 0, Russian: 0, Spanish: 0 };
function renderPhrase(lang, index) {
    const container = document.getElementById(`${lang}-phrase`);
    const phrases = languageData[lang].phrases;
    if (index < 0 || index >= phrases.length) return;
    currentIndices[lang] = index;
    const phrase = phrases[index];
    container.innerHTML = `
        <p>${phrase.phrase} (<a href="#" onclick="playAudio('${phrase.phrase}')">${phrase.phonetics || 'N/A'}</a>)</p>
        <p id="${lang}-translation" class="hidden">${phrase.translation}</p>
        <button onclick="document.getElementById('${lang}-translation').classList.toggle('hidden')">Flip</button>
    `;
}

// Navigation
function nextPhrase(lang) {
    const newIndex = currentIndices[lang] + 1;
    if (newIndex < languageData[lang].phrases.length) {
        renderPhrase(lang, newIndex);
        updateProgress(lang, 'materialCovered', 1);
        dailyProgress[lang]++;
        updateDailyProgress();
    }
}
function prevPhrase(lang) {
    const newIndex = currentIndices[lang] - 1;
    if (newIndex >= 0) renderPhrase(lang, newIndex);
}

// Quizzes
function showQuizzes() {
    showSection('quizzes');
    const container = document.getElementById('quizContainer');
    const rule = languageData[currentLanguage].grammar[Math.floor(Math.random() * languageData[currentLanguage].grammar.length)];
    const quizType = rule.question.includes("Conjugate") ? "Conjugation" : rule.question.includes("What is the") ? "Declension" : "Translation";
    container.innerHTML = `
        <p>${currentLanguage} Quiz (${quizType}): ${rule.question}</p>
        <input type="text" id="quizAnswer">
    `;
    document.getElementById('submitQuiz').onclick = () => {
        const answer = document.getElementById('quizAnswer').value;
        const correct = answer.toLowerCase() === rule.answer.toLowerCase();
        alert(correct ? "Great job!" : `Try again! Correct answer: ${rule.answer}\n${rule.explanation}`);
        if (correct) updateProgress(currentLanguage, 'quizzesPassed', 1, { type: 'quiz', score: 100 });
    };
}

// Progress
function showProgress() {
    showSection('progress');
    const stats = document.getElementById('progressStats');
    stats.innerHTML = languages.map(lang => `
        <h3>${lang.name}</h3>
        <p>Days Studied: ${progress[lang.name].daysStudied}</p>
        <p>Phrases Reviewed: ${progress[lang.name].materialCovered}</p>
        <p>Quizzes Passed: ${progress[lang.name].quizzesPassed}</p>
        <p>Recent Scores: ${progress[lang.name].scores.slice(-5).join(', ')}</p>
    `).join('');
}

// Show section helper
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// Update progress
function updateProgress(lang, key, value, scoreObj = null) {
    progress[lang][key] += value;
    if (scoreObj) progress[lang].scores.push(scoreObj.score);
    if (!progress[lang].lastDay || progress[lang].lastDay !== new Date().toDateString()) {
        progress[lang].daysStudied++;
        progress[lang].lastDay = new Date().toDateString();
    }
    localStorage.setItem('progress', JSON.stringify(progress));
}

// Update daily progress
function updateDailyProgress() {
    const total = Object.values(dailyProgress).reduce((sum, val) => sum + val, 0);
    const progressBar = document.getElementById('dailyProgress');
    progressBar.value = total;
    if (total === dailyGoal) alert("Great job! Goal achieved—keep going or see you tomorrow!");
}

// Reset daily progress
function resetDailyProgress() {
    dailyProgress = { German: 0, Russian: 0, Spanish: 0 };
    document.getElementById('dailyProgress').value = 0;
    alert("Daily progress reset—start fresh!");
}

// Audio placeholder
function playAudio(word) {
    alert(`Imagine hearing: ${word}`);
}

// Export data
function exportData() {
    const blob = new Blob([JSON.stringify({ languageData, progress })], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polyglot_data.json';
    a.click();
}

// Load saved progress
function loadProgress() {
    const saved = localStorage.getItem('progress');
    if (saved) progress = JSON.parse(saved);
}