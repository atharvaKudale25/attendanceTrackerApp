import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';  
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserLogin from './models/userLoginModel.js';
import subjectData from './models/userData.js';
import cors from "cors";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongodbURL = process.env.MONGODB_URI;
const jwtSecretKey = process.env.JWT_SECRET;
const clientKey = process.env.CLIENT_URL;

app.use(cors({
    origin: clientKey ,
    credentials:true
}));

app.use(express.json());

const authMiddleWare = (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(401).json({
            message: "Token missing"
        });
    }

    const token = auth.split(" ")[1];

    try {
        const decoded = jwt.verify(token, jwtSecretKey);
        req.decoded = decoded;
        next();

    } catch (err) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
}



mongoose.connect(mongodbURL)
    .then(() => console.log('Connected to MongoDB!'))  
    .catch(err => console.error('Connection error:', err));
     
app.post('/signup', async (req, res) => {
    const userLoginData = req.body;
    try {
        const userExists = await UserLogin.findOne({ email: userLoginData.email });
        if (userExists !== null) {
            throw new Error("User already exists");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(userLoginData.email)) {
            throw new Error("Please enter a valid email address.");

        }

        const hashedPass = await bcrypt.hash(userLoginData.password, 10);
        const user = await UserLogin.create({
            name: userLoginData.name,
            email: userLoginData.email,
            password: hashedPass
        })
        res.status(200).json({ message: "success" });

    } catch (err) {
        if (err.message === "User already exists" || err.message === "Please enter a valid email address.") {
            return res.status(409).json({ message: err.message });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

//signIn route
app.post('/', async (req, res) => {
    const userLoginData = req.body;
    try {
        const user = await UserLogin.findOne({ email: userLoginData.email });
        if (user === null) {
            return res.status(404).json({
                message: "User doesn't exist. Sign up first."
            });
        }
        const cor = await bcrypt.compare(userLoginData.password, user.password);
        if (cor === false) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign({ email: user.email }, jwtSecretKey, { expiresIn: "15d" });
        res.status(200).json({ token: token, email: user.email, name: user.name });
    }
    catch (err) {
        return res.status(500).json(err.message);
    }
})

app.post('/add', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const { subjectName, attended, absent, criteria } = req.body;

    if (
        typeof subjectName !== "string" ||
        subjectName.trim().length === 0 || subjectName.length > 50
    ) {
        return res.status(400).json({
            message: "Subject name is Invalid"
        });
    }

    if (
        !Number.isInteger(attended) ||
        attended < 0 ||
        attended > 999
    ) {
        return res.status(400).json({
            message: "Attended must be between 0 and 999"
        });
    }

    if (
        !Number.isInteger(absent) ||
        absent < 0 ||
        absent > 999
    ) {
        return res.status(400).json({
            message: "Absent must be between 0 and 999"
        });
    }

    if (
        !Number.isInteger(criteria) ||
        criteria < 0 ||
        criteria > 100
    ) {
        return res.status(400).json({
            message: "Criteria must be between 0 and 100"
        });
    }



    try {
        const alreadyExists = await subjectData.findOne({
            email: userEmail,
            subjectName: subjectName.trim()
        });

        if (alreadyExists) {
            return res.status(409).json({
                message: "Subject already exists"
            });
        }

        const added = await subjectData.create({ email: userEmail, subjectName: subjectName, attended: attended, absent: absent, criteria: criteria });
        res.status(200).json({ ...added, message: "success" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
})

app.get('/list', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    try {
        let arr = await subjectData.find({ email: userEmail });
        res.status(200).json({ subjects: arr, message: "success" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }

})

app.put('/manual/:id/:which/:what', authMiddleWare, async (req, res) => {
    const subjectId = req.params.id;
    const attendedOrAbsent = req.params.which;
    const increaseOrDecrease = req.params.what;
    const userEmail = req.decoded.email;
    if (attendedOrAbsent !== "attended" && attendedOrAbsent !== "absent") {
        return res.status(400).json({
            message: "Bad request"
        });
    }

    try {
        const reqSubject = await subjectData.findOne({ email: userEmail, _id: subjectId });
        if (!reqSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }
        let curr = reqSubject[attendedOrAbsent];
        if (increaseOrDecrease === "increase") {
            if (curr < 999)
                curr++;
        }
        else if (increaseOrDecrease === "decrease") {
            if (curr > 0) {
                curr--;
            }
        }
        else {
            throw new Error("something went wrong");
        }
        reqSubject[attendedOrAbsent] = curr;
        await reqSubject.save();
        res.status(200).json(reqSubject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

app.put('/edit/:id', authMiddleWare, async (req, res) => {
    const subjectId = req.params.id;
    const userEmail = req.decoded.email;
    const { subjectName, attended, absent, criteria } = req.body;

    if (
        typeof subjectName !== "string" ||
        subjectName.trim().length === 0 || subjectName.length > 50
    ) {
        return res.status(400).json({
            message: "Subject name is Invalid"
        });
    }

    if (
        !Number.isInteger(attended) ||
        attended < 0 ||
        attended > 999
    ) {
        return res.status(400).json({
            message: "Attended must be between 0 and 999"
        });
    }

    if (
        !Number.isInteger(absent) ||
        absent < 0 ||
        absent > 999
    ) {
        return res.status(400).json({
            message: "Absent must be between 0 and 999"
        });
    }

    if (
        !Number.isInteger(criteria) ||
        criteria < 0 ||
        criteria > 100
    ) {
        return res.status(400).json({
            message: "Criteria must be between 0 and 100"
        });
    }

    try {
        const alreadyExists = await subjectData.findOne({
            email: userEmail,
            subjectName: subjectName.trim(),
            _id: { $ne: subjectId }
        });

        if (alreadyExists) {
            return res.status(409).json({
                message: "Subject already exists"
            });
        }
        const reqSubject = await subjectData.findOne({ _id: subjectId, email: userEmail });
        if (!reqSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }
        reqSubject.subjectName = subjectName;
        reqSubject.attended = attended;
        reqSubject.absent = absent;
        reqSubject.criteria = criteria;
        await reqSubject.save();
        res.status(200).json(reqSubject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

app.get('/getASubject/:id', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const id = req.params.id;
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

})

app.delete('/delete/:id', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;
    const id = req.params.id;
    try {
        const result = await subjectData.deleteOne({
            _id: id,
            email: userEmail
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        res.status(200).json();
    }
    catch (err) {
        res.status(500).json(err.message);
    }
})

app.delete('/deleteAll', authMiddleWare, async (req, res) => {
    const userEmail = req.decoded.email;

    try {

        const result = await subjectData.deleteMany({ email: userEmail });
        res.status(200).json();
    }
    catch (err) {
        res.status(500).json(err.message);
    }
})

app.get('/verify', authMiddleWare, (req, res) => {
    res.status(200).json({ message: "sucess" });
})




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});