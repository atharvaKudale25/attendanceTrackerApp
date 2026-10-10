import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserLogin from '../models/userLoginModel.js';
import authMiddleWare from '../middlewares/authMiddleWare.js';

const router = express.Router();

const jwtSecretKey = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
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

//signin route
router.post('/', async (req, res) => {
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

router.get('/verify', authMiddleWare, (req, res) => {
    res.status(200).json({ message: "sucess" });
})

export default router;
