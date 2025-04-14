import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateTestToken = (applicationId) => {
    return jwt.sign(
        { applicationId },
        process.env.TEST_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

export const verifyTestToken = (token) => {
    try {
        return jwt.verify(token, process.env.TEST_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};