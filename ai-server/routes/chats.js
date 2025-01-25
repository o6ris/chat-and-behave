const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');

// Get chat messages for a group
router.get('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const chats = await storage.readData('chats.json');
        const groupChats = chats.filter(chat => chat.groupId === groupId);
        res.json(groupChats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
});

// Send a message in a group
router.post('/group/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'User ID and message are required' });
        }

        const groups = await storage.readData('groups.json');
        const users = await storage.readData('users.json');
        const chats = await storage.readData('chats.json');

        // Validate group exists
        const group = groups.find(g => g.id === groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Validate user exists and is member of the group
        if (!users.some(user => user.id === userId)) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!group.members.includes(userId)) {
            return res.status(403).json({ error: 'User is not a member of this group' });
        }

        const newMessage = {
            id: Date.now().toString(),
            groupId,
            userId,
            message,
            timestamp: new Date().toISOString()
        };

        chats.push(newMessage);
        await storage.writeData('chats.json', chats);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
