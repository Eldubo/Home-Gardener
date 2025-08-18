import dotenv from 'dotenv';
dotenv.config();

const { DB_URL } = process.env;

let DB_config;

if (DB_URL) {
  // Usamos la cadena de conexión completa si existe DB_URL
  DB_config = {
    connectionString: DB_URL,
    ssl: {
      rejectUnauthorized: false // Si estás usando un servicio como Supabase o Heroku, normalmente es necesario para SSL
    }
  };
} else {
  // Configuración local por variables individuales si no existe DB_URL
  DB_config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mi_base_de_datos',
    ssl: false
  };
}

console.log('DB Config cargada:', DB_config);

export default DB_config;
