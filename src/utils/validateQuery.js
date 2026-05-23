const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|EXEC|EXECUTE|CALL|MERGE|GRANT|REVOKE)\b/;

function validateSQL(sql) {
  if (!sql || typeof sql !== 'string' || !sql.trim()) {
    return { valid: false, error: 'Nenhuma query foi gerada. Tente reformular a pergunta.' };
  }

  const upper = sql.trim().toUpperCase();

  if (!/^(SELECT|WITH)\b/.test(upper)) {
    return { valid: false, error: 'Apenas consultas SELECT são permitidas.' };
  }

  if (FORBIDDEN.test(upper)) {
    return { valid: false, error: 'Query contém operação não permitida.' };
  }

  // Remove literais de string antes de checar múltiplos statements
  const stripped = upper.replace(/'[^']*'/g, "''");
  if (stripped.split(';').filter(s => s.trim()).length > 1) {
    return { valid: false, error: 'Múltiplos statements não são permitidos.' };
  }

  return { valid: true };
}

module.exports = { validateSQL };
