const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const UserModel = require('./models/user');
const RoomModel = require('./models/room');

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Define Models
const Room = RoomModel(sequelize);
const User = UserModel(sequelize);

// Define Relationships
Room.hasMany(User, { as: 'users', foreignKey: 'roomId' }); // A Room has many Users
User.belongsTo(Room, { foreignKey: 'roomId' }); // A User belongs to a Room


// Initialize Sequelize
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: './database.sqlite', // Use SQLite for simplicity
});



// REST Endpoints

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update({ name, email });
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync database and start server
sequelize.sync({ force: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
