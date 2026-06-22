import { auth, onAuthStateChanged } from "./firebase-config.js";
import { addXP } from "./gamification.js";
import { QUIZ_DATA } from "../data/quiz-data.js";
import { generateAIQuestion } from "./ai-tutor.js";

// DOM Elements
const questionText = document.getElementById('question-text');
const questionContext = document.getElementById('question-context');
const optionsContainer = document.getElementById('options-container');
const feedbackArea = document.getElementById('feedback-area');
const feedbackMessage = document.getElementById('feedback-message');
const nextBtn = document.getElementById('next-btn');
const currentQSpan = document.getElementById('current-q');
const totalQSpan = document.getElementById('total-q');
const sessionProgress = document.getElementById('session-progress');
const sessionXPSpan = document.getElementById('session-xp');
const subjectBadge = document.getElementById('subject-badge');

const completionModal = new bootstrap.Modal(document.getElementById('completionModal'));
const finalXPSpan = document.getElementById('final-xp');
const finalAccuracySpan = document.getElementById('final-accuracy');

// Game State
let currentSubject = 'math'; // Default
let isChallengeMode = false;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let sessionXP = 0;
let streak = 0;
let userUid = null;
let isAnswered = false;

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const subjectParam = urlParams.get('subject');

    if (modeParam === 'challenge') {
        isChallengeMode = true;
        subjectBadge.innerHTML = `<i class="bi bi-lightning-fill me-1"></i> Daily AI Challenge`;
        subjectBadge.classList.replace('bg-primary', 'bg-warning');
        subjectBadge.classList.replace('text-primary', 'text-dark');
    } else if (subjectParam && QUIZ_DATA[subjectParam]) {
        currentSubject = subjectParam;
        updateSubjectUI();
    } else {
        updateSubjectUI();
    }
});

// Auth Check
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userUid = user.uid;
        // In a real app we'd fetch the profile here to pass to AI
        if (isChallengeMode) {
            await loadChallengeQuestion();
        } else {
            loadQuestions();
        }
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
});

function updateSubjectUI() {
    // Capitalize first letter
    const subjectName = currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1);
    subjectBadge.innerHTML = `<i class="bi bi-book me-1"></i> ${subjectName}`;
}

function loadQuestions() {
    // Get questions for subject
    const allQuestions = QUIZ_DATA[currentSubject] || QUIZ_DATA['math'];
    // Shuffle and pick 5 (Simple shuffle)
    questions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);

    totalQSpan.textContent = questions.length;
    renderQuestion();
}

async function loadChallengeQuestion() {
    questionText.textContent = "Consulting AI Tutor...";
    questionContext.textContent = "Generating a personalized challenge for you...";
    optionsContainer.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';

    try {
        // Just 1 question for daily challenge for now
        // Pass a mock profile or fetch real one
        const q = await generateAIQuestion({ class: '7' });
        questions = [q];
        totalQSpan.textContent = 1;
        renderQuestion();
    } catch (error) {
        questionText.textContent = "Error loading challenge.";
        console.error(error);
    }
}

function renderQuestion() {
    const q = questions[currentQuestionIndex];

    // Reset UI
    questionText.textContent = q.question;
    questionContext.textContent = q.context || '';
    optionsContainer.innerHTML = '';
    feedbackArea.classList.add('d-none');
    currentQSpan.textContent = currentQuestionIndex + 1;

    // Update Progress Bar
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    sessionProgress.style.width = `${progressPercent}%`;

    isAnswered = false;

    // Render Options
    q.options.forEach((opt, index) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6';

        const card = document.createElement('div');
        card.className = 'card bg-white bg-opacity-5 p-3 option-card h-100 d-flex align-items-center justify-content-center text-center';
        card.innerHTML = `<span class="fw-bold fs-5">${opt}</span>`;

        card.onclick = () => handleAnswer(index, card);

        col.appendChild(card);
        optionsContainer.appendChild(col);
    });
}

function handleAnswer(selectedIndex, cardElement) {
    if (isAnswered) return;
    isAnswered = true;

    const q = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === q.correct;
    const allCards = document.querySelectorAll('.option-card');

    // Highlight selected
    if (isCorrect) {
        cardElement.classList.add('correct');
        score++;
        streak++;
        sessionXP += 10 + (streak * 2); // Bonus for streak

        feedbackMessage.innerHTML = `
            <h5 class="fw-bold text-success mb-1"><i class="bi bi-check-circle-fill"></i> Correct!</h5>
            <small class="text-white-50">Streak: ${streak} 🔥 (+${10 + streak * 2} XP)</small>
        `;
    } else {
        cardElement.classList.add('incorrect');
        // Show correct one
        const correctCardBox = optionsContainer.children[q.correct].querySelector('.option-card');
        correctCardBox.classList.add('correct'); // Highlight correct answer

        streak = 0;
        feedbackMessage.innerHTML = `
            <h5 class="fw-bold text-danger mb-1"><i class="bi bi-x-circle-fill"></i> Incorrect</h5>
            <small class="text-white-50">The correct answer was: ${q.options[q.correct]}</small>
        `;
    }

    sessionXPSpan.textContent = sessionXP;
    feedbackArea.classList.remove('d-none');

    // Disable all clicks
    allCards.forEach(c => c.style.pointerEvents = 'none');
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        renderQuestion();
    } else {
        finishModule();
    }
});

async function finishModule() {
    // Final Progress Update
    sessionProgress.style.width = '100%';

    // Save XP
    if (userUid) {
        await addXP(userUid, sessionXP);
    }

    // Show Modal
    finalXPSpan.textContent = sessionXP;
    const accuracy = Math.round((score / questions.length) * 100);
    finalAccuracySpan.textContent = `${accuracy}%`;

    completionModal.show();
    triggerConfetti();
}

function triggerConfetti() {
    if (window.confetti) {
        window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}
