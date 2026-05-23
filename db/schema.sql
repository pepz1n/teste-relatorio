-- Execute no seu banco PostgreSQL antes de iniciar o servidor
-- psql -U postgres -d vendas -f db/schema.sql

CREATE TABLE IF NOT EXISTS clientes (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(255) NOT NULL,
  email     VARCHAR(255),
  cidade    VARCHAR(100),
  estado    CHAR(2),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendedores (
  id     SERIAL PRIMARY KEY,
  nome   VARCHAR(255) NOT NULL,
  email  VARCHAR(255),
  regiao VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS produtos (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  preco     NUMERIC(10,2) NOT NULL,
  estoque   INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pedidos (
  id          SERIAL PRIMARY KEY,
  cliente_id  INT REFERENCES clientes(id),
  vendedor_id INT REFERENCES vendedores(id),
  status      VARCHAR(50) DEFAULT 'pendente',
  total       NUMERIC(10,2),
  criado_em   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id             SERIAL PRIMARY KEY,
  pedido_id      INT REFERENCES pedidos(id),
  produto_id     INT REFERENCES produtos(id),
  quantidade     INT NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em   ON pedidos(criado_em);
CREATE INDEX IF NOT EXISTS idx_pedidos_status      ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id  ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_id     ON itens_pedido(pedido_id);
