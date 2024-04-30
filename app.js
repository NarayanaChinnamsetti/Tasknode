const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_secret_key'; // Change this to a secure key in production

// In-memory database for simplicity
let tasks = [];
let users = [];

app.use(bodyParser.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. Token not provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Access denied. Invalid token.' });
    req.user = user;
    next();
  });
};

// Routes for CRUD operations on tasks
app.get('/tasks', authenticateToken, (req, res) => {
  res.json(tasks);
});

app.post('/tasks', authenticateToken, (req, res) => {
  const { title, description, assigned_to, status } = req.body;
  const newTask = { id: tasks.length + 1, title, description, assigned_to, status, created_at: new Date() };
  tasks.push(newTask);
  res.json(newTask);
});

app.get('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json(task);
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, assigned_to, status } = req.body;
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  tasks[index] = { id: taskId, title, description, assigned_to, status, updated_at: new Date() };
  res.json(tasks[index]);
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.sendStatus(204);
});

// User authentication and authorization
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET);
  res.json({ token });
});

// Example user registration (for demonstration only, should be done securely)
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password_hash: hashedPassword, role });
  res.json({ message: 'User registered successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
