const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await storage.readData('users.json');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const users = await storage.readData('users.json');
        
        // Check if username already exists
        if (users.some(user => user.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password, // In a real app, this should be hashed
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await storage.writeData('users.json', users);
        
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;
