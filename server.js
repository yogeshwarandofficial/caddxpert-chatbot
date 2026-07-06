import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

const app    = express();
const PORT   = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── Load vectors into memory on startup ────────────────────────────────────
let vectorDB = [];
async function loadVectors() {
  try {
    const vectorsPath = path.resolve('data/vectors.json');
    const rawData = await fs.readFile(vectorsPath, 'utf-8');
    vectorDB = JSON.parse(rawData);
    console.log(`Loaded ${vectorDB.length} vectors into memory.`);
  } catch (error) {
    console.error('Failed to load vectors.json. Ensure you run the embedding script first.', error.message);
  }
}
loadVectors();

// ── Cosine similarity helper ───────────────────────────────────────────────
function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Exponential-backoff fetch wrapper ─────────────────────────────────────
// Retries on HTTP 429 (rate-limit) up to `maxRetries` times with jittered backoff.
async function fetchWithBackoff(url, options, maxRetries = 4) {
  let attempt = 0;
  while (true) {
    const res = await fetch(url, options);

    if (res.status !== 429) return res;          // success or non-retryable error

    attempt++;
    if (attempt > maxRetries) return res;        // give up, propagate 429 upstream

    // Honour Retry-After header when present; otherwise use exponential backoff
    const retryAfterSec = parseInt(res.headers.get('Retry-After') || '0', 10);
    const backoffMs = retryAfterSec > 0
      ? retryAfterSec * 1000
      : Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 500, 32000);

    console.warn(`[429] Rate-limited by Gemini. Attempt ${attempt}/${maxRetries}. Retrying in ${Math.round(backoffMs)}ms…`);
    await new Promise(resolve => setTimeout(resolve, backoffMs));
  }
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ── /chat endpoint ─────────────────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
    }

    // ── 1. Embed the incoming message ─────────────────────────────────────
    const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`;
    const embedRes = await fetchWithBackoff(embedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text: message }] } })
    });

    if (embedRes.status === 429) {
      return res.status(429).json({
        error: 'rate_limit',
        message: "You're sending messages too fast. Please wait a moment and try again."
      });
    }

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      console.error('Embedding API error:', errText);
      return res.status(502).json({ error: 'Failed to generate embedding for the query' });
    }

    const embedData      = await embedRes.json();
    const queryEmbedding = embedData.embedding.values;

    // ── 2. Cosine similarity → top 4 chunks ──────────────────────────────
    const similarities = vectorDB.map(chunk => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));
    similarities.sort((a, b) => b.score - a.score);
    const topChunks  = similarities.slice(0, 4);
    const contextText = topChunks.map(c => c.text).join('\n\n');

    // ── 3. System prompt ──────────────────────────────────────────────────
    const systemPromptText =
      `You are the official assistant for Caddxpert AI Innovations. ` +
      `Answer ONLY using the provided context. ` +
      `If the answer isn't in the context, say you don't have that information and suggest ` +
      `contacting the admissions team at +91 82484 90202 or cadpointthiruvarur@gmail.com. ` +
      `NEVER state or estimate course fees — always redirect fee questions to the admissions team.\n\n` +
      `Context:\n${contextText}`;

    // ── 4. Format conversation history ────────────────────────────────────
    const formattedHistory = history
      .filter(msg => msg && (msg.text || msg.content))
      .map(msg => ({
        role  : msg.role === 'user' ? 'user' : 'model',
        parts : [{ text: msg.text || msg.content || msg.parts?.[0]?.text || '' }]
      }));

    // ── 5. Call gemini-2.5-flash with backoff ─────────────────────────────
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const generateRes = await fetchWithBackoff(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPromptText }] },
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ]
      })
    });

    if (generateRes.status === 429) {
      return res.status(429).json({
        error: 'rate_limit',
        message: "Too many messages right now. Please wait about a minute and try again."
      });
    }

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error('Generation API error:', errText);
      return res.status(502).json({ error: 'Failed to generate chat response' });
    }

    const generateData = await generateRes.json();
    const reply = generateData.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ||
                  "I'm sorry, I couldn't generate a response at this time.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`caddxpert-chatbot server running on port ${PORT}`);
});
