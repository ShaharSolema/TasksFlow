import {User} from '../models/user.model.js';
import bcrypt from 'bcrypt';

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'User already in use.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
export { registerUser };
