import { db, doc, updateDoc, increment, getDoc, setDoc } from "./firebase-config.js";

// Constants
const XP_PER_LEVEL = 100;

/**
 * Adds XP to the user's profile and checks for level up.
 * @param {string} uid - User ID
 * @param {number} amount - XP amount to add
 * @returns {Promise<Object>} - { newXP, newLevel, levelUp: boolean }
 */
export async function addXP(uid, amount) {
    if (!uid) return;

    const userRef = doc(db, "users", uid);

    try {
        // atomic increment
        await updateDoc(userRef, {
            xp: increment(amount)
        });

        // Check for level up
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            const currentXP = data.xp || 0;
            const currentLevel = data.level || 1;

            const expectedLevel = 1 + Math.floor(currentXP / XP_PER_LEVEL);

            if (expectedLevel > currentLevel) {
                // Level Up!
                await updateDoc(userRef, {
                    level: expectedLevel
                });
                return { newXP: currentXP, newLevel: expectedLevel, levelUp: true };
            }

            return { newXP: currentXP, newLevel: currentLevel, levelUp: false };
        }
    } catch (error) {
        console.error("Error updating XP:", error);
        return null;
    }
}

/**
 * Saves game results to Firestore for progress tracking.
 * @param {string} uid - User ID
 * @param {string} topic - Game topic (e.g., 'math', 'science')
 * @param {number} score - Score achieved
 * @param {number} totalQuestions - Total questions in quiz
 */
export async function saveGameResult(uid, topic, score, totalQuestions) {
    if (!uid) return;

    const timestamp = new Date();
    const percentage = Math.round((score / totalQuestions) * 100);

    try {
        // 1. Save to History (Log of all games)
        const historyRef = doc(db, "users", uid, "history", `${Date.now()}`);
        await setDoc(historyRef, {
            type: 'quiz',
            topic: topic,
            score: score,
            total: totalQuestions,
            percentage: percentage,
            timestamp: timestamp
        });

        // 2. Update Performance Stats (Aggregate mastery)
        const statsRef = doc(db, "users", uid, "performance", topic);
        const statsSnap = await getDoc(statsRef);

        let newGamesPlayed = 1;
        let newTotalScore = score;
        let newTotalPossible = totalQuestions;

        if (statsSnap.exists()) {
            const data = statsSnap.data();
            newGamesPlayed = (data.gamesPlayed || 0) + 1;
            newTotalScore = (data.totalScore || 0) + score;
            newTotalPossible = (data.totalPossible || 0) + totalQuestions;
        }

        const newMastery = Math.round((newTotalScore / newTotalPossible) * 100);

        await setDoc(statsRef, {
            gamesPlayed: newGamesPlayed,
            totalScore: newTotalScore,
            totalPossible: newTotalPossible,
            masteryPercentage: newMastery,
            lastPlayed: timestamp
        }, { merge: true });

        console.log(`Game result saved. Mastery in ${topic}: ${newMastery}%`);

    } catch (error) {
        console.error("Error saving game result:", error);
    }
}
