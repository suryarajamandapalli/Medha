import { startCamera, stopCamera, initCV } from "./cv-controller.js";
import { COURSE_DATA } from "./course-data.js";
import { addXP, saveGameResult } from "./gamification.js"; // Reuse existing
import { auth } from "./firebase-config.js";

// DOM
const overlay = document.getElementById('cv-game-overlay');
const questionText = document.getElementById('cv-question-text');
const optionsContainer = document.getElementById('cv-options-container');
const qNumSpan = document.getElementById('cv-q-num');
const qTotalSpan = document.getElementById('cv-q-total');
const feedbackOverlay = document.getElementById('cv-feedback-overlay');
const feedbackIcon = feedbackOverlay ? feedbackOverlay.querySelector('i') : null;
const closeBtn = document.getElementById('close-cv-game');

// State
let questions = [];
let currentIndex = 0;
let score = 0;
let selectedOption = null; // 0-3
let isLocked = false;
let currentCourseId = null;

// Audio
const correctAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
const wrongAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
const selectAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // Click sound

export async function startInteractiveQuiz(courseId, chapterId = null, useAI = false) {
    console.log("Starting Interactive Quiz for:", courseId, "Chapter:", chapterId, "AI:", useAI);
    currentCourseId = courseId;

    // 1. Show Overlay
    if (overlay) overlay.style.display = 'flex';
    else {
        alert("Error: Game overlay not found! Please refresh.");
        return;
    }

    // 2. Load Questions
    try {
        questions = [];

        // Attempt AI Load first if requested
        if (useAI) {
            if (questionText) questionText.textContent = "AI is generating questions...";
            questions = await fetchAIQuestions(courseId);
        }

        // If AI failed (empty) or wasn't requested, use Local Data (Silent Fallback)
        if (!questions || questions.length === 0) {
            if (useAI) console.log("AI fetch failed or returned empty. Falling back to local data.");

            const courses = COURSE_DATA["UG"] || Object.values(COURSE_DATA)[0];
            const course = courses.find(c => c.id === courseId) || courses[0];

            if (chapterId) {
                const chapter = course.chapters.find(c => c.id === chapterId);
                if (chapter && chapter.questions && chapter.questions.length > 0) {
                    questions = chapter.questions;
                    console.log(`Loaded ${questions.length} questions from chapter: ${chapter.title}`);
                } else {
                    questions = course.quizQuestions || [];
                }
            } else {
                questions = course.quizQuestions || [];
            }

            // Shuffle local questions
            if (questions.length > 0) {
                questions = [...questions].sort(() => Math.random() - 0.5);
            }
        }

        if (!questions || questions.length === 0) {
            throw new Error("No questions found.");
        }

        console.log("Quiz Questions Loaded:", questions);

    } catch (e) {
        console.warn("Quiz Load Error", e);
        questions = [
            { question: "Error loading questions. Try again later.", options: ["OK"], answer: 0 }
        ];
    }

    currentIndex = 0;
    score = 0;
    if (qTotalSpan) qTotalSpan.textContent = questions.length;

    // 3. Init CV
    try {
        if (questionText) questionText.textContent = "Initializing Camera & AI...";
        await initCV(handleGesture);
        await startCamera();
        renderQuestion();
    } catch (err) {
        console.error("CV Init Error:", err);
        alert("Failed to initialize Computer Vision: " + err.message + "\nCheck camera permissions or HTTPS.");
        stopInteractiveQuiz();
    }
}

async function fetchAIQuestions(courseId) {
    try {
        // Map courseId to a subject name mostly
        let subject = "general knowledge";
        if (courseId && courseId.includes('ds')) subject = "data structures";
        if (courseId && courseId.includes('c-prog')) subject = "c programming";
        if (courseId && courseId.includes('python')) subject = "python programming";
        if (courseId && courseId.includes('os')) subject = "operating systems";
        if (courseId && courseId.includes('html')) subject = "html css web development";

        console.log("Fetching AI questions for subject:", subject);

        // Short timeout for AI to allow quick fallback
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

        const response = await fetch(`http://localhost:5000/api/questions?subject=${encodeURIComponent(subject)}&count=5`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        return data.questions || [];
    } catch (e) {
        console.error("AI Fetch Failed:", e);
        return []; // Return empty to trigger fallback
    }
}

function stopInteractiveQuiz() {
    stopCamera();
    if (overlay) overlay.style.display = 'none';
}

if (closeBtn) closeBtn.addEventListener('click', stopInteractiveQuiz);

function renderQuestion() {
    isLocked = false;
    selectedOption = null;
    const q = questions[currentIndex];

    if (qNumSpan) qNumSpan.textContent = currentIndex + 1;
    if (questionText) questionText.textContent = q.question;

    if (optionsContainer) {
        optionsContainer.innerHTML = q.options.map((opt, idx) => `
            <div class="option-box p-3 border border-white border-opacity-25 rounded-3 bg-white bg-opacity-5 d-flex align-items-center transition-all" style="color:black;" id="opt-${idx}">
                <span class="badge bg-light text-dark me-3 rounded-pill" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">${idx + 1}</span>
                <span class="fs-5">${opt}</span>
            </div>
        `).join('');
    }
}

function handleGesture(gesture) {
    if (isLocked) return;
    if (gesture === "None") return;

    // Selection Gestures (1-4)
    if (["1", "2", "3", "4"].includes(gesture)) {
        const index = parseInt(gesture) - 1;
        if (questions[currentIndex] && index < questions[currentIndex].options.length) {
            highlightOption(index);
        }
    }

    // Confirmation Gesture (Thumb Up)
    if (gesture === "Thumb_Up" && selectedOption !== null) {
        submitAnswer();
    }
}

function highlightOption(index) {
    if (selectedOption === index) return;

    // Play sound
    selectAudio.currentTime = 0;
    selectAudio.play().catch(e => { });

    // Remove previous highlight
    document.querySelectorAll('.option-box').forEach(el => {
        el.classList.remove('bg-primary', 'bg-opacity-50', 'border-primary');
        el.classList.add('bg-opacity-5', 'border-white');
    });

    // Add new highlight
    const el = document.getElementById(`opt-${index}`);
    if (el) {
        el.classList.remove('bg-opacity-5', 'border-white');
        el.classList.add('bg-primary', 'bg-opacity-50', 'border-primary');
        selectedOption = index;
    }
}

function submitAnswer() {
    if (selectedOption === null) return;

    isLocked = true;
    const q = questions[currentIndex];

    // FIX: Check both 'correct' (from AI/server path) and 'answer' (from local course-data.js)
    let correctIndex = -1;
    if (q.correct !== undefined) correctIndex = q.correct;
    else if (q.answer !== undefined) correctIndex = q.answer;

    const isCorrect = selectedOption === correctIndex;

    const el = document.getElementById(`opt-${selectedOption}`);

    if (isCorrect) {
        score++;
        if (el) {
            el.classList.replace('bg-primary', 'bg-success');
            el.classList.replace('border-primary', 'border-success');
        }
        showFeedback(true);
        correctAudio.play().catch(e => { });
    } else {
        if (el) {
            el.classList.replace('bg-primary', 'bg-danger');
            el.classList.replace('border-primary', 'border-danger');
        }

        // Show correct
        if (correctIndex !== -1) {
            const correctEl = document.getElementById(`opt-${correctIndex}`);
            if (correctEl) correctEl.classList.add('bg-success', 'bg-opacity-50', 'border-success');
        }

        showFeedback(false);
        wrongAudio.play().catch(e => { });
    }

    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

function showFeedback(isCorrect) {
    if (!feedbackOverlay) return;

    feedbackOverlay.style.display = 'block';
    if (isCorrect && feedbackIcon) {
        feedbackIcon.className = 'bi bi-check-circle-fill text-success display-1 drop-shadow animate-bounce';
    } else if (feedbackIcon) {
        feedbackIcon.className = 'bi bi-x-circle-fill text-danger display-1 drop-shadow animate-shake';
    }

    setTimeout(() => {
        feedbackOverlay.style.display = 'none';
    }, 1500);
}

function nextQuestion() {
    currentIndex++;
    if (questions && currentIndex < questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    if (questionText) questionText.textContent = "Quiz Complete!";
    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <div class="text-center py-5">
                <h2 class="display-3 fw-bold mb-3">${score}/${questions.length}</h2>
                <p class="h4 text-white-50">Excellent Work!</p>
                <div class="d-flex justify-content-center gap-3 mt-4">
                     <button class="btn btn-light rounded-pill px-4 fw-bold" id="restart-btn">Menu</button>
                     <button class="btn btn-primary rounded-pill px-4 fw-bold" onclick="location.reload()">Play Again</button>
                </div>
            </div>
        `;
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) restartBtn.addEventListener('click', stopInteractiveQuiz);
    }

    // Save XP & Progress
    if (auth.currentUser) {
        // Infer subject from currentCourseId
        let topic = currentCourseId || 'general';

        addXP(auth.currentUser.uid, score * 20);
        saveGameResult(auth.currentUser.uid, topic, score, questions.length);
    }
}
