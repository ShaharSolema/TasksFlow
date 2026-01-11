import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        // Basic input checks to avoid empty values.
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
        // Make sure email or username is not already taken.
        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername.toLowerCase() }]
        });
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
}

async function loginUser(req, res) {
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
        const token = jwt.sign({ sub: user._id, role: user.role || 'user' }, jwtSecret, { expiresIn: '7d' });
        // Store JWT in an HttpOnly cookie so JS cannot read it.
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        res.status(200).json({ message: 'Login successful.' });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}

async function logoutUser(req, res) {
    // Logout logic here
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        res.status(200).json({ message: 'Logout successful.' });
        
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}

async function updateUserProfile(req, res) {
    // Profile update logic
    try {
        const { newUsername, newEmail } = req.body;
        // Validate input
        if (!newUsername && !newEmail) {
            return res.status(400).json({ message: 'At least one field (username or email) is required to update.' });
        }
        const updates = {};
        if (newUsername) {
            updates.username = newUsername.trim();
        }
        if (newEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return res.status(400).json({ message: 'Invalid email address.' });
            }
            updates.email = newEmail.trim().toLowerCase();
        }
        if (updates.email || updates.username) {
            const existingUser = await User.findOne({
                _id: { $ne: req.user._id },
                $or: [
                    updates.email ? { email: updates.email } : null,
                    updates.username ? { username: updates.username.toLowerCase() } : null
                ].filter(Boolean)
            });
            if (existingUser) {
                return res.status(409).json({ message: 'User already in use.' });
            }
        }
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            message: 'Profile updated successfully.',
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });




    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}

async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user._id).select('username email role');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error loading current user:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}

export { registerUser, loginUser, logoutUser, updateUserProfile, getCurrentUser };
