import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn('WARNING: GROQ_API_KEY is missing from environment variables.');
}

export const groq = new Groq({
  apiKey: groqApiKey || 'placeholder-key',
});

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
