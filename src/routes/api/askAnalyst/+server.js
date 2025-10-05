import { json } from '@sveltejs/kit';
import axios from 'axios';

const CEREBRAS_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;

export async function POST({ request }) {
  const { message, history } = await request.json();

  if (!message) {
    return json({ error: 'Message is required.' }, { status: 400 });
  }

  const systemPrompt = "You are 'Instant Analyst', an AI assistant powered by the Cerebras high-speed hardware. Your goal is to provide accurate, concise, and incredibly fast answers. Get straight to the point. Do not use conversational fluff.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  try {
    // --- THIS IS THE CORRECTED URL ---
    const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";
    const CEREBRAS_MODEL_NAME = "llama-4-scout-17b-16e-instruct";

    const response = await axios.post(CEREBRAS_API_URL, {
      model: CEREBRAS_MODEL_NAME,
      messages: messages,
    }, {
      headers: {
        "Authorization": `Bearer ${CEREBRAS_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const reply = response.data.choices[0].message.content;
    return json({ reply: reply });

  } catch (error) {
    console.error("Error calling Cerebras API:", error.response ? error.response.data : error.message);
    return json({ error: 'Failed to get a response from the Cerebras API.' }, { status: 500 });
  }
}