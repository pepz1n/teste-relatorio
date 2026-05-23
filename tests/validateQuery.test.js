const { validateSQL } = require('../src/utils/validateQuery');

describe('validateSQL', () => {
  test('aceita SELECT simples', () => {
    expect(validateSQL('SELECT * FROM pedidos')).toEqual({ valid: true });
  });

  test('aceita SELECT com WHERE e funções de agregação', () => {
    expect(validateSQL('SELECT SUM(total) FROM pedidos WHERE criado_em > NOW() - INTERVAL \'1 hour\'')).toEqual({ valid: true });
  });

  test('aceita CTE (WITH)', () => {
    expect(validateSQL('WITH cte AS (SELECT id FROM pedidos) SELECT * FROM cte')).toEqual({ valid: true });
  });

  test('rejeita INSERT', () => {
    expect(validateSQL('INSERT INTO pedidos VALUES (1)')).toMatchObject({ valid: false });
  });

  test('rejeita UPDATE', () => {
    expect(validateSQL('UPDATE pedidos SET status = \'cancelado\'')).toMatchObject({ valid: false });
  });

  test('rejeita DELETE', () => {
    expect(validateSQL('DELETE FROM pedidos')).toMatchObject({ valid: false });
  });

  test('rejeita DROP', () => {
    expect(validateSQL('DROP TABLE pedidos')).toMatchObject({ valid: false });
  });

  test('rejeita múltiplos statements', () => {
    expect(validateSQL('SELECT * FROM pedidos; DROP TABLE pedidos')).toMatchObject({ valid: false });
  });

  test('rejeita string vazia', () => {
    expect(validateSQL('')).toMatchObject({ valid: false });
  });

  test('rejeita null', () => {
    expect(validateSQL(null)).toMatchObject({ valid: false });
  });
});
