const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');

// Get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await storage.readData('groups.json');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Create new group
router.post('/', async (req, res) => {
    try {
        const { name, creatorId, members } = req.body;
        if (!name || !creatorId) {
            return res.status(400).json({ error: 'Group name and creator ID are required' });
        }

        const groups = await storage.readData('groups.json');
        const users = await storage.readData('users.json');

        // Validate creator exists
        if (!users.some(user => user.id === creatorId)) {
            return res.status(400).json({ error: 'Creator not found' });
        }

        const newGroup = {
            id: Date.now().toString(),
            name,
            creatorId,
            members: members || [creatorId],
            createdAt: new Date().toISOString()
        };

        groups.push(newGroup);
        await storage.writeData('groups.json', groups);
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Add member to group
router.post('/:groupId/members', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const groups = await storage.readData('groups.json');
        const users = await storage.readData('users.json');

        const group = groups.find(g => g.id === groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!users.some(user => user.id === userId)) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ error: 'User already in group' });
        }

        group.members.push(userId);
        await storage.writeData('groups.json', groups);
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add member to group' });
    }
});

module.exports = router;
