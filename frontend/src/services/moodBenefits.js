/**
 * Helper to get mood-based spiritual and psychological benefits
 * tailored before a focus session based on recent mood score.
 * Mood is 0-100%
 */
export const getMoodBenefits = (moodHappiness) => {
    if (moodHappiness >= 80) {
        return {
            title: "Amplify Your Energy",
            text: "Your energy is high today. Use this session to deepen your state of flow and amplify your spiritual magnetism.",
            benefit: "Sustained peak performance and profound clarity."
        };
    }
    if (moodHappiness >= 60) {
        return {
            title: "Fortify Your Mind",
            text: "You are in a great state to absorb these teachings. This will fortify your mental resilience.",
            benefit: "Enhanced focus and lasting peace of mind."
        };
    }
    if (moodHappiness >= 40) {
        return {
            title: "Soothe Your Spirit",
            text: "Take it easy. Engage with this gently to soothe your nervous system tonight.",
            benefit: "Grounding energy and slight mood elevation."
        };
    }
    // < 40
    return {
        title: "Find Comfort",
        text: "You are going through a tough time. Don't force anything; just surrender to the process.",
        benefit: "Emotional release and deep inner comfort."
    };
};
