const express = require('express');
const { generateSQL } = require('../services/llmService');
const { executeQuery } = require('../services/dbService');
const { validateSQL } = require('../utils/validateQuery');

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Campo "question" é obrigatório.' });
  }

  let sql;
  try {
    sql = await generateSQL(question.trim());
  } catch (err) {
    console.error('[LM Studio]', err.message);
    return res.status(503).json({
      error: 'Não foi possível conectar ao LM Studio. Verifique se o servidor local está ativo em ' +
             (process.env.LM_STUDIO_URL || 'http://localhost:1234'),
    });
  }

  const { valid, error } = validateSQL(sql);
  if (!valid) {
    return res.status(422).json({ error, sql });
  }

  let rows;
  try {
    rows = await executeQuery(sql);
  } catch (err) {
    console.error('[DB]', err.message);
    return res.status(500).json({ error: `Erro ao executar query: ${err.message}`, sql });
  }

  res.json({ question, sql, rows, count: rows.length });
});

module.exports = router;
