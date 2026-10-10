import jwt from 'jsonwebtoken';

const jwtSecretKey = process.env.JWT_SECRET;


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

export default authMiddleWare;