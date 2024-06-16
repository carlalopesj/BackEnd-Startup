import pg from 'pg';
const { Pool } = pg;

// Configuração da conexão com o banco de dados PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'roundhouse.proxy.rlwy.net',
    database: 'railway',
    password: 'XOsmfKDdWXELqdEMsmDlUlwqIXGqPZoV',
    port: 17097,
  });

export const db = {
    query: (text, params) => pool.query(text, params),
};
