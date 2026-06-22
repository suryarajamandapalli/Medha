import { aiService } from './aiService.js';
import { knowledgeBase } from './knowledgeBase.js';
import { RadarChart } from './ui/radarChart.js';

export class SimulationManager {
    constructor(engine) {
        this.engine = engine;
        this.stability = 100;
        this.score = 0;
        this.activeCrisis = null;
        this.crisisInterval = null;
        this.currentLevel = knowledgeBase.level;

        this.elements = {
            stabilityBar: document.getElementById('stability-bar'),
            stabilityPercent: document.getElementById('stability-percent'),
            scoreVal: document.getElementById('opt-score'),
            terminal: document.getElementById('terminal-text'),
            panel: document.getElementById('interaction-panel'),
            title: document.getElementById('crisis-title'),
            desc: document.getElementById('crisis-desc'),
            options: document.getElementById('options-grid')
        };

        this.radar = new RadarChart();
        this.init();
    }

    init() {
        this.radar.update(knowledgeBase.getMasteryArray());

        document.getElementById('close-panel').addEventListener('click', () => {
            this.elements.panel.classList.add('hidden');
        });

        this.startCrisisLoop();
        this.logTerminal("Simulation Engine Online. Level " + knowledgeBase.level + " monitoring active.");
    }

    startCrisisLoop() {
        this.crisisInterval = setInterval(() => {
            // Check for new crisis if none active
            if (!this.activeCrisis) {
                // Reduced probability check but fast interval
                if (Math.random() > 0.7) {
                    this.triggerDynamicCrisis();
                }
            }

            if (this.activeCrisis) {
                this.updateStability(-1.2); // Faster decay during crisis
            }
        }, 3000);
    }

    async triggerDynamicCrisis() {
        const randomRack = this.engine.racks[Math.floor(Math.random() * this.engine.racks.length)];
        const subject = this.getRandomSubject();

        this.logTerminal(`ANALYZING ANOMALY IN ${randomRack.userData.id.toUpperCase()}...`, 'normal');

        // Scenario generation
        const scenario = await aiService.generateCrisisScenario(subject, knowledgeBase.level, knowledgeBase.mastery);

        this.activeCrisis = {
            rack: randomRack,
            subject: subject,
            data: scenario,
            startTime: Date.now()
        };

        this.engine.setRackAlarm(randomRack, true);
        this.logTerminal(`ALERT: ${scenario.title.toUpperCase()}! Recovery protocol required.`, 'danger');
    }

    getRandomSubject() {
        // Updated to match Medha V2 Syllabus
        const subjects = ['Data Structures', 'Operating Systems', 'C Programming', 'Python', 'HTML & CSS', 'DBMS'];
        return subjects[Math.floor(Math.random() * subjects.length)];
    }

    updateStability(delta) {
        this.stability = Math.max(0, Math.min(100, this.stability + delta));
        this.elements.stabilityBar.style.width = `${this.stability}%`;
        this.elements.stabilityPercent.innerText = `${Math.round(this.stability)}%`;

        if (this.stability <= 30) {
            this.elements.stabilityBar.style.background = 'var(--danger)';
        } else {
            this.elements.stabilityBar.style.background = 'linear-gradient(90deg, var(--success), #0575E6)';
        }

        // Trigger visual effects in engine
        this.engine.updateCollapsingState(this.stability);

        if (this.stability <= 0) this.gameOver();
    }

    logTerminal(text, type = 'normal') {
        this.elements.terminal.innerText = `> ${text}`;
        this.elements.terminal.style.color = type === 'danger' ? 'var(--danger)' : 'var(--primary)';
    }

    handleRackInteraction(rack) {
        if (this.activeCrisis && this.activeCrisis.rack === rack) {
            this.showCrisisPanel();
        } else {
            this.logTerminal(`System Check: ${rack.userData.id} operational. Status nominal.`, 'normal');
        }
    }

    showCrisisPanel() {
        const scenario = this.activeCrisis.data;
        this.elements.panel.classList.remove('hidden');
        this.elements.title.innerText = scenario.title;
        this.elements.desc.innerText = scenario.description;

        this.elements.options.innerHTML = '';
        scenario.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = opt;
            btn.onclick = () => this.resolveCrisis(idx === scenario.correctIndex);
            this.elements.options.appendChild(btn);
        });
    }

    resolveCrisis(isCorrect) {
        this.elements.panel.classList.add('hidden');
        const scenario = this.activeCrisis.data;

        if (isCorrect) {
            this.logTerminal(`Success: ${scenario.rationale}`, 'normal');
            this.score += 150;
            this.elements.scoreVal.innerText = this.score;
            this.updateStability(20);

            knowledgeBase.updateMastery(this.activeCrisis.subject, 8);
            this.radar.update(knowledgeBase.getMasteryArray());

            this.engine.setRackAlarm(this.activeCrisis.rack, false);
            this.activeCrisis = null;

            // Instantly check for next crisis to clear latency
            setTimeout(() => this.triggerDynamicCrisis(), 1000);

            // Level Up Check
            if (knowledgeBase.level > this.currentLevel) {
                this.currentLevel = knowledgeBase.level;
                this.engine.createEnvironment(this.currentLevel);
                this.logTerminal(`LEVEL UP! Workspace Expanded to Phase ${this.currentLevel}.`, 'normal');
            }
        } else {
            this.logTerminal(`FAILURE! Recovery protocols rejected. Integrity failing.`, 'danger');
            this.updateStability(-20);
            knowledgeBase.updateMastery(this.activeCrisis.subject, -5);
            this.radar.update(knowledgeBase.getMasteryArray());
        }
    }

    gameOver() {
        clearInterval(this.crisisInterval);
        knowledgeBase.logSession({ score: this.score });
        this.engine.updateCollapsingState(0);
        setTimeout(() => {
            alert(`CRITICAL FAILURE. Mission Objective Failed. Optimization Score: ${this.score}`);
            location.reload();
        }, 1000);
    }
}
