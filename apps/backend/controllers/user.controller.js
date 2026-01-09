import {User} from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
        if (password.length < 6 || password.length > 40) {
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
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'Server misconfigured.' });
        }
        const token = jwt.sign({ sub: user._id }, jwtSecret, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
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
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        res.status(200).json({ message: 'Logout successful.' });
        
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
const updateUserProfile = async (req, res) => {
    // Profile update logic
    try {
        const { newUsername, newEmail } = req.body;
        // Validate input
        if (!newUsername && !newEmail) {
            return res.status(400).json({ message: 'At least one field (username or email) is required to update.' });
        }
        // Update logic here
        const user = await User.findByIdAndUpdate(req.user._id, { username: newUsername, email: newEmail }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.username = newUsername || user.username;
        user.email = newEmail || user.email;
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully.' });




    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
export { registerUser };
export { loginUser };
export { logoutUser };
export { updateUserProfile };
