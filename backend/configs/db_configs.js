const DB_config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
  console.log(process.env.DATABASE_URL)
  export default DB_config;
  