import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Strips markdown code block formatting (like ```json ... ```) from a string.
 */
function stripMarkdown(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Generate Interview Questions
 */
export async function generateQuestions({ role, level, type, count }) {
  const prompt = `You are an expert interviewer. Generate exactly ${count} interview questions for a ${level} ${role} candidate. Interview type: ${type}.
Return ONLY a JSON array of strings. No markdown, no extra text.
Example: ["Question 1", "Question 2"]`;

  if (!apiKey) {
    throw new Error('API key is missing.');
  }

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleanedText = stripMarkdown(responseText);

  try {
    const questions = JSON.parse(cleanedText);
    if (!Array.isArray(questions)) throw new Error("API did not return an array");
    return questions;
  } catch (error) {
    console.error("Failed to parse generateQuestions response:", cleanedText);
    throw new Error("Failed to parse questions from API");
  }
}

/**
 * Evaluate Candidate's Answer
 */
export async function evaluateAnswer({ role, level, question, answer }) {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.
Role: ${role}, Level: ${level}
Question: ${question}
Candidate's Answer: ${answer}

Return ONLY this JSON (no markdown):
{
  "score": <1-10>,
  "strength": "<what was good, 1-2 sentences>",
  "improvement": "<what to improve, 1-2 sentences>",
  "modelAnswer": "<ideal answer in 3-4 sentences>"
}`;

  if (!apiKey) {
    throw new Error('API key is missing.');
  }

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleanedText = stripMarkdown(responseText);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse evaluateAnswer response:", cleanedText);
    throw new Error("Failed to parse evaluation from API");
  }
}

/**
 * Get Final Report Summary
 */
export async function getFinalReport({ role, qaData }) {
  const prompt = `Based on these interview answers for a ${role} position:
${JSON.stringify(qaData, null, 2)}

Return ONLY this JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"]
}`;

  if (!apiKey) {
    throw new Error('API key is missing.');
  }

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleanedText = stripMarkdown(responseText);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse getFinalReport response:", cleanedText);
    throw new Error("Failed to parse final report from API");
  }
}
