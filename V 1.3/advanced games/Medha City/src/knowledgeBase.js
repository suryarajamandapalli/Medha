export class KnowledgeBase {
    constructor() {
        this.mastery = JSON.parse(localStorage.getItem('crisis_lab_mastery')) || {
            'Data Structures': 10,
            'Operating Systems': 10,
            'DBMS': 10,
            'Computer Networks': 10
        };
        this.level = parseInt(localStorage.getItem('crisis_lab_level')) || 1;
        this.history = JSON.parse(localStorage.getItem('crisis_lab_history')) || [];
    }

    updateMastery(subject, delta) {
        this.mastery[subject] = Math.max(0, Math.min(100, this.mastery[subject] + delta));

        // Real-time leveling check
        const avgMastery = Object.values(this.mastery).reduce((a, b) => a + b) / 4;
        if (avgMastery > this.level * 20 && this.level < 5) {
            this.level++;
        }

        this.save();
    }

    logSession(session) {
        this.history.push({
            ...session,
            timestamp: Date.now()
        });
        this.save();
    }

    save() {
        localStorage.setItem('crisis_lab_mastery', JSON.stringify(this.mastery));
        localStorage.setItem('crisis_lab_level', this.level.toString());
        localStorage.setItem('crisis_lab_history', JSON.stringify(this.history));
    }

    getMasteryArray() {
        return Object.values(this.mastery);
    }
}

export const knowledgeBase = new KnowledgeBase();
