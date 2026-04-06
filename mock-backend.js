const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = "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";

// Dynamic generation endpoint for healing plan
app.post('/api/healing/generate', async (req, res) => {
    try {
        console.log("Generating tailored plan for user input...");
        const userText = req.body.text;

        const prompt = `You are Dr. Aisha, an empathetic, premium AI wellness counselor for the app HopePath.
A user has submitted the following details about how they are feeling:
"${userText}"

Analyze the user's input and provide a deeply empathetic, structured JSON response containing exactly the following keys:
1. "emotion": The core emotion you detect (e.g. stress, anxiety, sadness, loneliness, overthinking, burnout, anger).
2. "category": A 2-3 word topic summarizing their issue (e.g. "academic pressure", "work stress").
3. "severity": "low", "medium", or "high".
4. "summary": A one-sentence empathetic summary of how they are feeling, speaking directly to them (e.g. "I hear how overwhelmed you are...").
5. "plan_title": A calming title for their healing plan (e.g. "Calm Focus Journey").
6. "steps": An array of 3 to 5 actionable, specific healing steps based on the relief options they requested. Each item MUST be an object with "title" and "description".

Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json or extra conversational text. Just the raw JSON object.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "system", "content": "You are Dr. Aisha, an empathetic system that outputs valid JSON only." },
                    { role: "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            console.error("OpenRouter API Error:", response.statusText);
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        const contentStr = data.choices[0].message.content;
        
        // Strip markdown backticks if the model accidentally included them
        const cleanJsonStr = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const resultJson = JSON.parse(cleanJsonStr);
        res.json(resultJson);

    } catch (error) {
        console.error("Failed to generate dynamic plan:", error);
        // Fallback to avoid completely breaking the frontend
        res.status(500).json({
            emotion: "overwhelmed",
            category: "general distress",
            severity: "medium",
            summary: "I see that you are feeling overwhelmed right now. You are not alone.",
            plan_title: "Emergency Grounding Plan",
            steps: [
                {
                    title: "Pause and Breathe",
                    description: "Take 5 deep breaths, counting to 4 on the inhale and 6 on the exhale."
                },
                {
                    title: "Rest",
                    description: "Step away from your screen for 10 minutes to reset your mind."
                }
            ]
        });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Live Dynamic AI Backend server listening on http://localhost:${PORT}`);
});
