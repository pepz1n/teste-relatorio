const { DDL } = require('../schema/vendas');

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || 'local-model';

// SQLCoder é um modelo de completion — /v1/completions preserva o prompt exato
// como foi treinado e dá resultados melhores que chat/completions
function buildPrompt(question) {
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

async function generateSQL(question) {
  const response = await fetch(`${LM_STUDIO_URL}/v1/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LM_STUDIO_API_KEY || 'lm-studio'}`,
    },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL,
      prompt: buildPrompt(question),
      max_tokens: 512,
      temperature: 0,
      stop: ['[/SQL]', '\n\n\n\n'],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LM Studio ${response.status}: ${text}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.text || '';
  return extractSQL(raw);
}

function extractSQL(raw) {
  let sql = raw
    .replace(/^\[SQL\]/i, '')
    .replace(/```sql\n?/gi, '')
    .replace(/```/g, '')
    .split(';')[0]
    .trim();
  return sql;
}

module.exports = { generateSQL };
