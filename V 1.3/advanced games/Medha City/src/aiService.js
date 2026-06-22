import { CONFIG } from './config.js';

// ===============================
// IMAGE-BASED SYLLABUS (LOCKED)
// ===============================
const SYLLABUS = {
    'Data Structures': [
        'Arrays & Complexity',
        'Linked Lists',
        'Stacks & Queues',
        'Trees & BST',
        'Heaps',
        'Hashing',
        'Graphs'
    ],
    'Operating Systems': [
        'Process Management',
        'CPU Scheduling',
        'Deadlocks',
        'Memory Management (Paging/Segmentation)',
        'File Systems'
    ],
    'C Programming': [
        'Pointers & Memory',
        'Structs & Unions',
        'File I/O',
        'Dynamic Memory Allocation',
        'Preprocessors'
    ],
    'Python': [
        'Lists & Dictionaries',
        'OOP Concepts',
        'Error Handling',
        'NumPy & Pandas Basics',
        'Decorators'
    ],
    'HTML & CSS': [
        'Flexbox & Grid',
        'Responsive Design',
        'DOM Manipulation',
        'Forms & Validation',
        'Semantic HTML5'
    ]
};

// ===============================
// AI SERVICE
// ===============================
export class AiService {
    constructor() {
        this.apiUrl =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        this.apiKey = CONFIG.GEMINI_API_KEY;

        // Subjects strictly from UI image
        this.allowedSubjects = Object.keys(SYLLABUS);
    }

    // ===============================
    // MAIN SCENARIO GENERATOR
    // ===============================
    async generateCrisisScenario(subject, level, masteryData = {}) {

        // 🔒 SUBJECT GUARD (Image Topics Only)
        if (!this.allowedSubjects.includes(subject)) {
            console.warn("Invalid subject detected. Defaulting to Data Structures.");
            subject = 'Data Structures';
        }

        // 🎯 DIFFICULTY GUARD (Easy → Medium)
        const safeLevel = Math.min(Math.max(level, 1), 3);

        const topics = SYLLABUS[subject] || ['General Concepts'];

        // ===============================
        // FALLBACK MODE (No API Key)
        // ===============================
        if (!this.apiKey) {
            console.warn("AI Key missing, using deterministic fallback.");
            return this.getFallbackScenario(subject);
        }

        // ===============================
        // PROMPT
        // ===============================
        const prompt = `
Act as the Simulation Engine for "Medha City", a futuristic learning playground.

Subject: ${subject}
Relevant Syllabus Topics: ${topics.join(', ')}
Difficulty Level: ${safeLevel}/5 (Easy to Medium)
Student Mastery: ${JSON.stringify(masteryData)}

Task:
Generate a SYSTEM FAILURE or CODING CHALLENGE based strictly on the syllabus topics.

Rules:
- Title: Creative technical title (max 5 words)
- Description: Problem scenario (max 30 words)
- Options: Exactly 3 technical solutions
- Correct Answer: Index 0, 1, or 2
- Rationale: Educational explanation tied to the concept

Constraint:
Return ONLY valid JSON in this format:

{
  "title": "...",
  "description": "...",
  "options": ["...", "...", "..."],
  "correctIndex": 0,
  "rationale": "..."
}
        `;

        // ===============================
        // API CALL
        // ===============================
        try {
            const response = await fetch(
                `${this.apiUrl}?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            const data = await response.json();
            const text =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            const cleanJson = text
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("AI Scenario Error:", error);
            return this.getFallbackScenario(subject);
        }
    }

    // ===============================
    // FALLBACK SCENARIOS
    // ===============================
    getFallbackScenario(subject) {
        const scenarios = {
            'Data Structures': {
                title: "Memory Leak in Linked List",
                description: "Nodes are deleted but memory is not freed, causing heap overflow.",
                options: [
                    "Use garbage collection",
                    "Call free() on deleted nodes",
                    "Increase RAM"
                ],
                correctIndex: 1,
                rationale:
                    "In manual memory management, allocated memory must be explicitly freed to avoid leaks."
            },

            'Operating Systems': {
                title: "Deadlock on Printer",
                description: "Two processes hold resources while waiting on each other.",
                options: [
                    "Kill one process",
                    "Force preemption",
                    "Wait indefinitely"
                ],
                correctIndex: 1,
                rationale:
                    "Preemption breaks circular wait, one of the four necessary conditions for deadlock."
            },

            'C Programming': {
                title: "Dangling Pointer Error",
                description: "A pointer accesses memory that has already been freed.",
                options: [
                    "Set pointer to NULL",
                    "Reuse the pointer",
                    "Ignore the warning"
                ],
                correctIndex: 0,
                rationale:
                    "Nullifying a freed pointer prevents undefined behavior and accidental access."
            },

            'Python': {
                title: "Mutable Default Trap",
                description: "A list is shared across function calls unexpectedly.",
                options: [
                    "Use None as default",
                    "Clear list manually",
                    "Convert list to tuple"
                ],
                correctIndex: 0,
                rationale:
                    "Default arguments are evaluated once; using None avoids shared mutable state."
            },

            'HTML & CSS': {
                title: "Flexbox Overflow",
                description: "Flex items overflow the container on smaller screens.",
                options: [
                    "flex-wrap: wrap",
                    "overflow: hidden",
                    "display: block"
                ],
                correctIndex: 0,
                rationale:
                    "flex-wrap allows items to move onto the next line when space is insufficient."
            }
        };

        return (
            scenarios[subject] || {
                title: "Syntax Error Storm",
                description: "The compiler rejects the code due to malformed syntax.",
                options: [
                    "Check brackets and semicolons",
                    "Restart the IDE",
                    "Reinstall the OS"
                ],
                correctIndex: 0,
                rationale:
                    "Most compiler errors originate from simple syntax mistakes."
            }
        );
    }
}

// ===============================
// SINGLETON EXPORT
// ===============================
export const aiService = new AiService();
