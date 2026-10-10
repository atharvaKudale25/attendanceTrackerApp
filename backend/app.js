import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import authRoutes from './routes/authRoutes.js';
import subjectActionRoutes from './routes/subjectActionRoutes.js'
import activityRoutes from './routes/activityRoutes.js'

import subjectData from './models/userData.js';
import userActivityOfSubject from './models/userActivityOfSubject.js';
import authMiddleWare from './middlewares/authMiddleWare.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongodbURL = process.env.MONGODB_URI;
const clientKey = process.env.CLIENT_URL;

app.use(cors({
    origin: clientKey,
    credentials: true
}));

app.use(express.json());

mongoose.connect(mongodbURL)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Connection error:', err));

app.use('/', authRoutes);
app.use('/', subjectActionRoutes);
app.use('/', activityRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});