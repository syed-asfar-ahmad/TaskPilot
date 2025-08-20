const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const blobUploadRoute = require('./routes/blobUploadRoute');
const http = require('http');
const socketIo = require('socket.io');
const { setupChatSocket } = require('./socket/chatSocket');





dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://taskpilot-dashboard.vercel.app",
  "https://taskpilot-website.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chats', require('./routes/chats'));

app.use('/api/upload-profile-image', blobUploadRoute);


app.get('/', (req, res) => {
  res.send('API is working...');
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io globally available
global.io = io;

// Setup chat socket
setupChatSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
