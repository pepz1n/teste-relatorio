const { DDL } = require('../schema/vendas');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'sqlcoder:7b';

// Formato de prompt oficial do SQLCoder (Defog)
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
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: buildPrompt(question),
      stream: false,
      options: {
        temperature: 0,      // zero = mais determinístico para SQL
        num_predict: 512,
        num_ctx: 4096,       // contexto maior para schema + query
        stop: ['[/SQL]', '\n\n\n\n'],
      },
    }),
    signal: AbortSignal.timeout(90_000), // AMD pode ser mais lento na primeira inferência
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama ${response.status}: ${text}`);
  }

  const data = await response.json();
  return extractSQL(data.response || '');
}

function extractSQL(raw) {
  let sql = raw
    .replace(/^\[SQL\]/i, '')        // remove marcador se o modelo o repetiu
    .replace(/```sql\n?/gi, '')       // remove bloco markdown
    .replace(/```/g, '')
    .split(';')[0]                    // descarta qualquer coisa após o primeiro ;
    .trim();
  return sql;
}

module.exports = { generateSQL };
