const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
import accommodationRoutes from './routes/accommodationRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Route de test
app.get('/', (req: any, res: any) => {
  res.send('Admin Dashboard API fonctionne correctement !');
});

// Route des utilisateurs
app.get('/users', async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});
app.use('/accommodations', accommodationRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Serveur admin lancé sur le port ${PORT}`);
});
