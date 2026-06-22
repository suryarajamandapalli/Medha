import { addXP } from "../gamification.js";
import { auth } from "../firebase-config.js";

export class MemoryMatrix {
    constructor(containerId, onClose) {
        this.container = document.getElementById(containerId);
        this.onClose = onClose;
        this.cards = []; // Array of { id, content, type }
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.matchesFound = 0;
        this.totalPairs = 0;
        this.score = 0;

        // Audio
        this.flipSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        this.matchSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        this.missSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
        this.winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    }

    start(dataPairs) {
        // dataPairs = [{ term: "O(1)", def: "Constant Time" }, ...]
        this.cards = [];
        this.matchesFound = 0;
        this.totalPairs = dataPairs.length;
        this.score = 0;

        // Create card deck
        dataPairs.forEach((pair, index) => {
            // Card 1
            this.cards.push({ id: index, content: pair.term, type: 'term' });
            // Card 2
            this.cards.push({ id: index, content: pair.def, type: 'def' });
        });

        // Shuffle
        this.cards.sort(() => Math.random() - 0.5);

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-overlay" style="display: flex;">
                <button class="close-game-btn" id="mm-close"><i class="bi bi-x-lg"></i></button>
                <div class="game-container">
                    <div class="game-header">
                        <h2 class="fw-bold mb-2" style="color: white;">Memory Matrix</h2>
                        <p style="color: white;">Match the terms!</p>
                        <div class="badge bg-warning text-dark fs-5 mt-2" id="mm-score">Score: 0</div>
                    </div>
                    <div class="memory-grid">
                        ${this.cards.map((card, i) => `
                            <div class="memory-card" data-framework="${card.id}" data-index="${i}">
                                <div class="memory-face front-face">
                                    ${card.content}
                                </div>
                                <div class="memory-face back-face">
                                    <i class="bi bi-question-lg"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Bind events
        document.getElementById('mm-close').addEventListener('click', () => {
            this.container.innerHTML = '';
            if (this.onClose) this.onClose();
        });

        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    }

    flipCard(card) {
        if (this.lockBoard) return;
        if (card === this.firstCard) return;

        this.flipSound.currentTime = 0;
        this.flipSound.play().catch(e => { });

        card.classList.add('flip');

        if (!this.hasFlippedCard) {
            this.hasFlippedCard = true;
            this.firstCard = card;
            return;
        }

        this.secondCard = card;
        this.checkForMatch();
    }

    checkForMatch() {
        let isMatch = this.firstCard.dataset.framework === this.secondCard.dataset.framework;

        if (isMatch) {
            this.disableCards();
            this.matchSound.play().catch(e => { });
            this.matchesFound++;
            this.score += 20; // Points for match
            this.updateScore();
            if (this.matchesFound === this.totalPairs) {
                setTimeout(() => this.endGame(), 500);
            }
        } else {
            this.missSound.play().catch(e => { });
            this.unflipCards();
            this.score = Math.max(0, this.score - 5); // Penalty
            this.updateScore();
        }
    }

    disableCards() {
        this.firstCard.classList.add('matched');
        this.secondCard.classList.add('matched');
        // keep them flipped
        this.resetBoard();
    }

    unflipCards() {
        this.lockBoard = true;
        setTimeout(() => {
            this.firstCard.classList.remove('flip');
            this.secondCard.classList.remove('flip');
            this.resetBoard();
        }, 1000);
    }

    resetBoard() {
        [this.hasFlippedCard, this.lockBoard] = [false, false];
        [this.firstCard, this.secondCard] = [null, null];
    }

    updateScore() {
        const scoreEl = document.getElementById('mm-score');
        if (scoreEl) scoreEl.textContent = `Score: ${this.score}`;
    }

    async endGame() {
        this.winSound.play().catch(e => { });
        // Simple alert for now, can be a nice modal later
        alert(`Victory! You scored ${this.score} points.`);

        // Save XP using Firebase Auth user details
        const uid = auth?.currentUser?.uid;
        if (uid) {
            await addXP(uid, this.score);
        }

        this.container.innerHTML = '';
        if (this.onClose) this.onClose();
    }
}
