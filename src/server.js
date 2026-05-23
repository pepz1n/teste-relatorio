require('dotenv').config();
const express = require('express');
const path = require('path');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`Chatbot de Vendas rodando em http://localhost:${PORT}`);
  console.log(`Ollama: ${process.env.OLLAMA_URL || 'http://localhost:11434'} | Modelo: ${process.env.OLLAMA_MODEL || 'sqlcoder:7b'}`);
});

module.exports = app;
