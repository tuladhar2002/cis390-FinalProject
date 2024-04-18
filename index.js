const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const session = require("express-session");
const { Server } = require("socket.io");
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static("public"));
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Users
var usernames = [];
const activeUsers = {}; // Object to store active users

const sessionMiddleware = session({
  secret: "randomText",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

// Login landing page render
app.get("/", (req, res) => {
  res.render(__dirname + "/Views/index.ejs");
});

// Handle login
app.post("/login", async (req, res) => {
  const username = req.body.username;
  req.session.username = username; // Store username in session
  activeUsers[username] = true; // Mark user as active
  res.render(__dirname + "/Views/chatBody.ejs");
});

// Connection event listeners
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Connection event listeners
io.on("connection", async (socket) => {
  const session = socket.request.session;
  const username = session.username;
  

  // Notify all clients when user joins
  if(!usernames.includes(username)){
    io.emit("user joined", username);
    usernames.push(username);
  };

  // Disconnect
  socket.on("disconnect", () => {
    delete activeUsers[username]; // Remove user from active users
    
    io.emit("user left", username); // Notify clients about user leaving
  });

  // Client sends message
  socket.on("chat message", (msg) => {
    io.emit("chat message", { username, message: msg });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
