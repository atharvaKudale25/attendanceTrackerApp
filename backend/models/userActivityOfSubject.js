import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
const app = express();

const userActivityOfSubject = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    subjectId: {
        type: String,
        required: true,
    },

    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    date: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10
    },


    attendedCount: {
        type: Number,
        required: true,

    },

    absentCount: {
        type: Number,
        required: true,

    },


})

export default mongoose.model("activityDataOfSubject", userActivityOfSubject);