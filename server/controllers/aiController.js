const { Groq } = require('groq-sdk');
const Problem = require('../models/Problem');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key'
});

exports.getHint = async (req, res) => {
  try {
    const { problemId, code, languageName, runResults } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'AI Tutor is currently unavailable. API key not configured.' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const systemPrompt = `You are an expert AI Coding Tutor. Your goal is to guide the user to the correct solution without giving them the direct answer or writing the final code for them.
You will be provided with:
1. The Problem Description
2. The user's current code
3. The language they are using
4. (Optional) Their last test case results

Analyze their code and provide a helpful hint. 
If they have a syntax error, point it out.
If their approach is too slow (e.g. O(n^2) instead of O(n)), explain why it's slow and hint at a better data structure or algorithm.
If they are missing an edge case, give them an example input that fails.
Always be encouraging. Keep your response concise (max 2-3 short paragraphs). Use markdown for formatting.`;

    const userPrompt = `
Problem: ${problem.title}
Description: ${problem.description}

Language: ${languageName}
Current Code:
\`\`\`${languageName}
${code}
\`\`\`

${runResults ? `Last Run Results: ${JSON.stringify(runResults)}` : 'No run results provided.'}

Please give me a hint on how to proceed.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 500,
    });

    const hint = completion.choices[0]?.message?.content || "I couldn't generate a hint right now. Keep trying!";
    
    res.json({ hint });
  } catch (err) {
    console.error('Groq AI Error:', err);
    res.status(500).json({ message: 'Failed to generate hint. Please try again later.' });
  }
};
