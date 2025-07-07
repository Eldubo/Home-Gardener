import dotenv from 'dotenv';
dotenv.config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

let DB_config;

if (DATABASE_URL) {
  // Si existe DATABASE_URL (ej. en producción)
  DB_config = {
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // Configuración local por variables individuales
  DB_config = {
    host: DB_HOST || 'localhost',
    port: DB_PORT ? Number(DB_PORT) : 5432,
    user: DB_USER || 'postgres',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'mi_base_de_datos',
    ssl: false // Localmente generalmente sin SSL
  };
}

console.log('DB Config cargada:', DB_config);

export default DB_config;
