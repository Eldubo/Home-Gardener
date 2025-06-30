import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

import AuthRoutes from './controllers/auth-controller.js';
import PlantasRoutes from './controllers/plantas-controller.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', AuthRoutes);
app.use('/api/plantas', PlantasRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
