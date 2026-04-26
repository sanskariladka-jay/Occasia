import dotenv from 'dotenv';
dotenv.config({ override: true });

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import collegeRoutes from './routes/collegeRoutes';

// Initialize DB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/college', collegeRoutes);

app.get('/', (req, res) => {
  res.send('Occasia API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
