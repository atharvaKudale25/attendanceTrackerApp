import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
const app = express();

const subjectDataSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    subjectName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    attended: {
        type: Number,
        required: true,
        min: 0,
        max: 999
    },

    absent: {
        type: Number,
        required: true,
        min: 0,
        max: 999
    },

    criteria: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }

})

export default mongoose.model("subjectData", subjectDataSchema);