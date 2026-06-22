import { addXP } from "../gamification.js";
import { auth } from "../firebase-config.js";

export class RapidFire {
    constructor(containerId, onClose) {
        this.container = document.getElementById(containerId);
        this.onClose = onClose;
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.strikes = 0;
        this.maxStrikes = 3;
        this.timerInterval = null;
        this.timeLeft = 0;
        this.maxTime = 5000; // 5 seconds per question
        this.isGameOver = false;

        // Audio
        this.clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        this.correctSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        this.wrongSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
        this.gameOverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    }

    start(dataQuestions) {
        this.questions = dataQuestions.sort(() => Math.random() - 0.5);
        this.currentIndex = 0;
        this.score = 0;
        this.strikes = 0;
        this.isGameOver = false;

        this.renderFrame();
        this.nextQuestion();
    }

    renderFrame() {
        this.container.innerHTML = `
            <div class="game-overlay" style="display: flex;">
                <button class="close-game-btn" id="rf-close"><i class="bi bi-x-lg"></i></button>
                <div class="game-container">
                    <div class="game-header d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="fw-bold mb-0" style="color: white;">Rapid Fire</h2>
                            <small style="color: white;">Don't blink!</small>
                        </div>
                        <div class="text-end">
                            <div class="fs-4 fw-bold text-warning" id="rf-score">0 XP</div>
                            <div class="text-danger" id="rf-strikes">❤️❤️❤️</div>
                        </div>
                    </div>
                    
                    <div class="rapid-timer-container">
                        <div class="rapid-timer-bar" id="rf-timer-bar"></div>
                    </div>

                    <div id="rf-content-area">
                        <!-- Question content goes here -->
                    </div>
                </div>
            </div>
        `;

        document.getElementById('rf-close').addEventListener('click', () => {
            this.stopGame();
            this.container.innerHTML = '';
            if (this.onClose) this.onClose();
        });
    }

    nextQuestion() {
        if (this.isGameOver) return;
        if (this.currentIndex >= this.questions.length) {
            this.endGame(true); // Win/Finished
            return;
        }

        const q = this.questions[this.currentIndex];
        const correctIndex = q.correct !== undefined ? q.correct : q.answer;
        const content = document.getElementById('rf-content-area');

        content.innerHTML = `
            <div class="rapid-question animate__animated animate__fadeIn">${q.question}</div>
            <div class="rapid-options">
                ${q.options.map((opt, i) => `
                    <button class="rapid-btn" data-index="${i}">${opt}</button>
                `).join('')}
            </div>
        `;

        // Bind clicks
        content.querySelectorAll('.rapid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.clickSound.currentTime = 0;
                this.clickSound.play().catch(e => { });
                this.handleAnswer(parseInt(e.target.dataset.index), correctIndex);
            });
        });

        // Start Timer
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = this.maxTime;
        const bar = document.getElementById('rf-timer-bar');

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 100;
            const pct = (this.timeLeft / this.maxTime) * 100;
            if (bar) bar.style.width = `${pct}%`;

            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 100);
    }

    handleAnswer(selectedIndex, correctIndex) {
        clearInterval(this.timerInterval);
        const btns = document.querySelectorAll('.rapid-btn');

        if (selectedIndex === correctIndex) {
            // Correct
            this.correctSound.play().catch(e => { });
            btns[selectedIndex].classList.add('correct');
            this.score += 50; // High reward for speed
            document.getElementById('rf-score').innerText = `${this.score} XP`;
            setTimeout(() => {
                this.currentIndex++;
                this.nextQuestion();
            }, 500);
        } else {
            // Wrong
            this.wrongSound.play().catch(e => { });
            btns[selectedIndex].classList.add('wrong');
            btns[correctIndex].classList.add('correct'); // Show right answer
            this.takeStrike();
        }
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        this.wrongSound.play().catch(e => { });
        // Show correct answer? Or just fail
        const q = this.questions[this.currentIndex];
        const correctIndex = q.correct !== undefined ? q.correct : q.answer;
        const btns = document.querySelectorAll('.rapid-btn');
        if (btns[correctIndex]) btns[correctIndex].classList.add('correct');

        this.takeStrike();
    }

    takeStrike() {
        this.strikes++;
        const hearts = "❤️".repeat(this.maxStrikes - this.strikes) + "🖤".repeat(this.strikes);
        const strikesEl = document.getElementById('rf-strikes');
        if (strikesEl) strikesEl.innerText = hearts;

        if (this.strikes >= this.maxStrikes) {
            setTimeout(() => this.endGame(false), 1000);
        } else {
            setTimeout(() => {
                this.currentIndex++;
                this.nextQuestion();
            }, 1000);
        }
    }

    stopGame() {
        clearInterval(this.timerInterval);
        this.isGameOver = true;
    }

    async endGame(completed) {
        this.stopGame();
        this.gameOverSound.play().catch(e => { });

        let msg = completed ? "Course Complete!" : "Game Over!";
        alert(`${msg} Final Score: ${this.score}`);

        const uid = auth?.currentUser?.uid;
        if (uid && this.score > 0) {
            await addXP(uid, this.score);
        }

        this.container.innerHTML = '';
        if (this.onClose) this.onClose();
    }
}
