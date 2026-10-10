import express from 'express';
import userActivityOfSubject from '../models/userActivityOfSubject.js';

import authMiddleWare from '../middlewares/authMiddleWare.js';

const router = express.Router();

router.get('/activity/:requiredDate', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const requiredDate = req.params.requiredDate;
    if (
        typeof requiredDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(requiredDate) ||
        !Number.isFinite(Date.parse(requiredDate)) ||
        new Date(requiredDate).toISOString().slice(0, 10) !== requiredDate
    ) {
        return res.status(400).json({
            message: "Date is invalid"
        });
    }
    try {
        let arr = await userActivityOfSubject.find({ email: userEmail, date: requiredDate });
        res.status(200).json({ subjects: arr, message: "success" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
})

export default router;