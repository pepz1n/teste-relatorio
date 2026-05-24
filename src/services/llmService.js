const { DDL } = require('../schema/vendas');

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || 'local-model';
const LM_STUDIO_API_KEY = process.env.LM_STUDIO_API_KEY || 'lm-studio';
// 'completion' para SQLCoder e modelos base; 'chat' para modelos de instrução (Mistral, Llama, etc.)
const LM_STUDIO_MODE = process.env.LM_STUDIO_MODE || 'completion';

function buildCompletionPrompt(question) {
  return `### Task
Generate a SQL query to answer [QUESTION]${question}[/QUESTION]

### Database Schema
The query will run on a database with the following schema:
${DDL}

### Answer
Given the database schema, here is the SQL query that answers [QUESTION]${question}[/QUESTION]
[SQL]
`;
}

function buildChatMessages(question) {
  return [
    {
      role: 'system',
      content: `You are a SQL expert. Generate only a valid PostgreSQL SELECT query based on the user's question and the schema below. Return only the SQL query, no explanation, no markdown fences.

Database schema:
${DDL}`,
    },
    {
      role: 'user',
      content: question,
    },
  ];
}

async function generateSQL(question) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LM_STUDIO_API_KEY}`,
  };

  let url, body;

  if (LM_STUDIO_MODE === 'chat') {
    url = `${LM_STUDIO_URL}/v1/chat/completions`;
    body = {
      model: LM_STUDIO_MODEL,
      messages: buildChatMessages(question),
      max_tokens: 512,
      temperature: 0,
    };
  } else {
    url = `${LM_STUDIO_URL}/v1/completions`;
    body = {
      model: LM_STUDIO_MODEL,
      prompt: buildCompletionPrompt(question),
      max_tokens: 512,
      temperature: 0,
      stop: ['[/SQL]', '\n\n\n\n'],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LM Studio ${response.status}: ${text}`);
  }

  const data = await response.json();

  let raw;
  if (LM_STUDIO_MODE === 'chat') {
    raw = data.choices?.[0]?.message?.content || '';
  } else {
    raw = data.choices?.[0]?.text || '';
  }

  return extractSQL(raw);
}

function extractSQL(raw) {
  return raw
    .replace(/^\[SQL\]/i, '')
    .replace(/```sql\n?/gi, '')
    .replace(/```/g, '')
    .split(';')[0]
    .trim();
}

async function checkLMStudio() {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/v1/models`, {
      headers: { 'Authorization': `Bearer ${LM_STUDIO_API_KEY}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    const data = await response.json();
    const models = data.data?.map(m => m.id) || [];
    return { ok: true, url: LM_STUDIO_URL, model: LM_STUDIO_MODEL, mode: LM_STUDIO_MODE, models };
  } catch (err) {
    return { ok: false, url: LM_STUDIO_URL, error: err.message };
  }
}

module.exports = { generateSQL, checkLMStudio };
