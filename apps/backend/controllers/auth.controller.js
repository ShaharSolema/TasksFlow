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
        if (password.length < 6 || password.length > 60) {
            return res.status(400).json({ message: 'Password must be 6-40 characters.' });
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
const loginUser = async (req, res) => {
    // Login logic here
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        // Successful login
        res.status(200).json({ message: 'Login successful.' });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
const logoutUser = async (req, res) => {
    // Logout logic here
    try {
        const{ email }=req.body;
        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        // Here you would typically handle session invalidation or token revocation
        res.status(200).json({ message: 'Logout successful.' });
        
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
export { registerUser };
export { loginUser };
export { logoutUser };