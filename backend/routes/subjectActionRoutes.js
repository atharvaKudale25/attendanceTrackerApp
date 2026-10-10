import express from 'express';
import mongoose from 'mongoose';
import subjectData from '../models/userData.js';
import userActivityOfSubject from '../models/userActivityOfSubject.js';
import authMiddleWare from '../middlewares/authMiddleWare.js';

const router = express.Router();

router.post('/add', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const { subjectName, attended, absent, criteria, date } = req.body;

    if (typeof subjectName !== "string" || subjectName.trim().length === 0 || subjectName.trim().length > 50) {
        return res.status(400).json({
            message: "Subject name is Invalid"
        });
    }

    if (!Number.isInteger(attended) || attended < 0 || attended > 999) {
        return res.status(400).json({
            message: "Attended must be between 0 and 999"
        });
    }

    if (!Number.isInteger(absent) || absent < 0 || absent > 999) {
        return res.status(400).json({
            message: "Absent must be between 0 and 999"
        });
    }

    if (!Number.isInteger(criteria) || criteria < 0 || criteria > 100) {
        return res.status(400).json({
            message: "Criteria must be between 0 and 100"
        });
    }

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
        return res.status(400).json({
            message: "Date is invalid"
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const alreadyExists = await subjectData.findOne({
            email: userEmail,
            subjectName: subjectName.trim()
        }).session(session);

        if (alreadyExists) {
            await session.abortTransaction();
            return res.status(409).json({
                message: "Subject already exists"
            });
        }

        const added = await subjectData.create([{ email: userEmail, subjectName: subjectName.trim(), attended: attended, absent: absent, criteria: criteria }], { session });

        await userActivityOfSubject.create([{ email: userEmail, subjectId: added[0]._id, subject: subjectName.trim(), date: date, attendedCount: attended, absentCount: absent }], { session });

        await session.commitTransaction();
        res.status(200).json({ message: "success" });
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    }
    finally {
        session.endSession();
    }
});

router.get('/list', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;

    try {
        let arr = await subjectData.find({ email: userEmail });
        res.status(200).json({ subjects: arr, message: "success" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/manual/:id/:which/:what/:date', authMiddleWare, async (req, res) => {
    const subjectId = req.params.id;
    const attendedOrAbsent = req.params.which;
    const increaseOrDecrease = req.params.what;
    const date = req.params.date;
    const userEmail = req.decoded.email;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({
            message: "Invalid subject ID"
        });
    }

    if (attendedOrAbsent !== "attended" && attendedOrAbsent !== "absent") {
        return res.status(400).json({
            message: "Invalid attendance type"
        });
    }

    if (increaseOrDecrease !== "increase" && increaseOrDecrease !== "decrease") {
        return res.status(400).json({
            message: "Invalid operation"
        });
    }

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
        return res.status(400).json({
            message: "Invalid date"
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const reqSubject = await subjectData.findOne({ email: userEmail, _id: subjectId }).session(session);

        if (!reqSubject) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        let curr = reqSubject[attendedOrAbsent];
        let change = 0;

        if (increaseOrDecrease === "increase") {
            if (curr < 999) {
                curr++;
                change++;
            }
        }
        else if (increaseOrDecrease === "decrease") {
            if (curr > 0) {
                curr--;
                change--;
            }
        }

        reqSubject[attendedOrAbsent] = curr;
        await reqSubject.save({ session });

        const dataInActivity = await userActivityOfSubject.findOne({ subjectId: subjectId, email: userEmail, date: date }).session(session);

        if (change !== 0 && dataInActivity) {
            if (attendedOrAbsent === "attended") {
                dataInActivity.attendedCount += change;
                await dataInActivity.save({ session });
            }
            else if (attendedOrAbsent === "absent") {
                dataInActivity.absentCount += change;
                await dataInActivity.save({ session });
            }

            if (dataInActivity.attendedCount === 0 && dataInActivity.absentCount === 0) {
                await userActivityOfSubject.deleteOne(
                    { _id: dataInActivity._id },
                    { session }
                );
            }
        }
        else if (change !== 0) {
            if (attendedOrAbsent === "attended")
                await userActivityOfSubject.create([{ email: userEmail, subjectId: subjectId, subject: reqSubject.subjectName.trim(), date: date, attendedCount: change, absentCount: 0 }], { session });
            else
                await userActivityOfSubject.create([{ email: userEmail, subjectId: subjectId, subject: reqSubject.subjectName.trim(), date: date, attendedCount: 0, absentCount: change }], { session });
        }

        await session.commitTransaction();
        res.status(200).json(reqSubject);
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    }
    finally {
        session.endSession();
    }
});

router.put('/edit/:id', authMiddleWare, async (req, res) => {
    const subjectId = req.params.id;
    const userEmail = req.decoded.email;
    const { subjectName, attended, absent, criteria, date } = req.body;

    if (typeof subjectName !== "string" || subjectName.trim().length === 0 || subjectName.trim().length > 50) {
        return res.status(400).json({
            message: "Subject name is Invalid"
        });
    }

    if (!Number.isInteger(attended) || attended < 0 || attended > 999) {
        return res.status(400).json({
            message: "Attended must be between 0 and 999"
        });
    }

    if (!Number.isInteger(absent) || absent < 0 || absent > 999) {
        return res.status(400).json({
            message: "Absent must be between 0 and 999"
        });
    }

    if (!Number.isInteger(criteria) || criteria < 0 || criteria > 100) {
        return res.status(400).json({
            message: "Criteria must be between 0 and 100"
        });
    }

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
        return res.status(400).json({
            message: "Date is invalid"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(404).json({
            message: "Subject not found"
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const alreadyExists = await subjectData.findOne({
            email: userEmail,
            subjectName: subjectName.trim(),
            _id: { $ne: subjectId }
        }).session(session);

        if (alreadyExists) {
            await session.abortTransaction();
            return res.status(409).json({
                message: "Subject already exists"
            });
        }

        const reqSubject = await subjectData.findOne({ _id: subjectId, email: userEmail }).session(session);

        if (!reqSubject) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        const prevDataOfSubject = reqSubject.toObject();

        reqSubject.subjectName = subjectName.trim();
        reqSubject.attended = attended;
        reqSubject.absent = absent;
        reqSubject.criteria = criteria;

        const newDataOfsubject = await reqSubject.save({ session });

        if (prevDataOfSubject.subjectName !== newDataOfsubject.subjectName) {
            const allActivityOfSubject = await userActivityOfSubject.find({ email: userEmail, subjectId: subjectId }).session(session);

            for (let curr of allActivityOfSubject) {
                curr.subject = newDataOfsubject.subjectName;
                await curr.save({ session });
            }
        }

        const changeInAttended = newDataOfsubject.attended - prevDataOfSubject.attended;
        const changeInAbsent = newDataOfsubject.absent - prevDataOfSubject.absent;

        const dataInActivity = await userActivityOfSubject.findOne({ email: userEmail, date: date, subjectId: subjectId }).session(session);

        if ((changeInAbsent !== 0 || changeInAttended !== 0) && dataInActivity) {
            dataInActivity.attendedCount += changeInAttended;
            dataInActivity.absentCount += changeInAbsent;
            await dataInActivity.save({ session });

            if (dataInActivity.attendedCount === 0 && dataInActivity.absentCount === 0) {
                await userActivityOfSubject.deleteOne(
                    { _id: dataInActivity._id },
                    { session }
                );
            }
        }
        else if (changeInAbsent !== 0 || changeInAttended !== 0) {
            await userActivityOfSubject.create([{ email: userEmail, subjectId: subjectId, subject: subjectName.trim(), date: date, attendedCount: changeInAttended, absentCount: changeInAbsent }], { session });
        }

        await session.commitTransaction();
        res.status(200).json(reqSubject);
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    }
    finally {
        session.endSession();
    }
});

router.get('/getASubject/:id', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Invalid subject ID"
        });
    }

    try {
        const reqSubject = await subjectData.findOne({ _id: id, email: userEmail });

        if (!reqSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        res.status(200).json(reqSubject);
    }
    catch (err) {
        res.status(500).json(err.message);
    }
});

router.delete('/delete/:id', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Invalid subject ID"
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await subjectData.deleteOne({
            _id: id,
            email: userEmail
        }, { session });

        if (result.deletedCount === 0) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        await userActivityOfSubject.deleteMany({ subjectId: id, email: userEmail }, { session });

        await session.commitTransaction();
        res.status(200).json();
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json(err.message);
    }
    finally {
        session.endSession();
    }
});

router.delete('/deleteAll', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await subjectData.deleteMany({ email: userEmail }, { session });
        await userActivityOfSubject.deleteMany({ email: userEmail }, { session });

        await session.commitTransaction();
        res.status(200).json();
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json(err.message);
    }
    finally {
        session.endSession();
    }
});

export default router;