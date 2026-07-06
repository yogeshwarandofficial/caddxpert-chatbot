import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

const KB_PATH = path.resolve('data/kb.json');
const VECTORS_PATH = path.resolve('data/vectors.json');
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not defined in the environment or .env file.');
  process.exit(1);
}

async function embedText(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: {
        parts: [
          {
            text: text
          }
        ]
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error('Unexpected API response structure (missing embedding.values)');
  }

  return data.embedding.values;
}

async function run() {
  try {
    console.log('Loading kb.json...');
    const rawKb = await fs.readFile(KB_PATH, 'utf-8');
    const kb = JSON.parse(rawKb);
    
    console.log(`Loaded ${kb.length} chunks. Starting embedding generation...`);
    const vectors = [];

    for (let i = 0; i < kb.length; i++) {
      const chunk = kb[i];
      console.log(`[${i + 1}/${kb.length}] Embedding chunk: ${chunk.id}...`);
      
      try {
        const embedding = await embedText(chunk.text);
        vectors.push({
          id: chunk.id,
          text: chunk.text,
          embedding: embedding
        });
        // Tiny sleep to respect API limits if any
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to embed chunk ${chunk.id}:`, error.message);
        throw error; // stop execution if any chunk fails
      }
    }

    console.log(`Writing vectors to ${VECTORS_PATH}...`);
    await fs.writeFile(VECTORS_PATH, JSON.stringify(vectors, null, 2), 'utf-8');
    console.log('Embedding generation complete!');
  } catch (error) {
    console.error('Embedding script failed:', error);
    process.exit(1);
  }
}

run();
