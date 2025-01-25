const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups');
const chatsRouter = require('./routes/chats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/chats', chatsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
