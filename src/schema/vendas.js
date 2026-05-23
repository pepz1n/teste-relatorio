// DDL enviado ao SQLCoder junto com cada pergunta.
// Ajuste os tipos/colunas conforme seu banco real.
const DDL = `
CREATE TABLE clientes (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(255) NOT NULL,
  email     VARCHAR(255),
  cidade    VARCHAR(100),
  estado    CHAR(2),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendedores (
  id     SERIAL PRIMARY KEY,
  nome   VARCHAR(255) NOT NULL,
  email  VARCHAR(255),
  regiao VARCHAR(100)
);

CREATE TABLE produtos (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  preco     NUMERIC(10,2) NOT NULL,
  estoque   INT DEFAULT 0
);

CREATE TABLE pedidos (
  id          SERIAL PRIMARY KEY,
  cliente_id  INT REFERENCES clientes(id),
  vendedor_id INT REFERENCES vendedores(id),
  status      VARCHAR(50) DEFAULT 'pendente',  -- pendente | pago | cancelado
  total       NUMERIC(10,2),
  criado_em   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE itens_pedido (
  id             SERIAL PRIMARY KEY,
  pedido_id      INT REFERENCES pedidos(id),
  produto_id     INT REFERENCES produtos(id),
  quantidade     INT NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL
);
`;

module.exports = { DDL };
