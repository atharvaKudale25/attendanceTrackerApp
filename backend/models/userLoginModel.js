import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
const app = express();

const loginSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
})

export default mongoose.model("user",loginSchema);