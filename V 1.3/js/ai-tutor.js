// Mock AI Service (Replace with actual OpenAI call)

export async function generateAIQuestion(userProfile) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Dynamic question generation based on profile
    // In real app, we would send userProfile to OpenAI API

    // Mock response
    return {
        id: 'ai_' + Date.now(),
        question: `Here is a challenge for a Class ${userProfile.class || '7'} student: If a train travels 60 km in 45 minutes, what is its speed in km/h?`,
        options: ["60 km/h", "75 km/h", "80 km/h", "90 km/h"],
        correct: 2,
        context: "AI Generated - Speed & Distance"
    };
}
