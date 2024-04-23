const generateRoomId = require("./roomIdGenerator");
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

//demo room id created
var roomIds = [];
var currentRoomId;
roomIds.push("1234");

const sessionMiddleware = session({
  secret: "randomText",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

// Login landing page render
app.get("/", (req, res) => {
  res.render(__dirname + "/Views/login.ejs");
});

// Handle login
app.post("/login", async (req, res) => {
  const username = req.body.username;

  // join existing chat room
  if (req.body.roomId) {
    const requestRoomId = req.body.roomId;
    // check if roomId exists
    if (roomIds.includes(requestRoomId)) {
      currentRoomId = requestRoomId;
      req.session.username = username; // Store username in session
      activeUsers[username] = true; // Mark user as active
      res.render(__dirname + "/Views/chatBody.ejs", {
        roomId: currentRoomId,
      });
    } else {
      // provided chat room does not exists
      res.render(__dirname+ "/Views/login.ejs", {
        failure: "The provided room Id does not exists. Try a valid one!"
      });
    }
  } 
  else {
    // generate a chat room and join
    currentRoomId = generateRoomId();
    console.log(currentRoomId);
    roomIds.push(currentRoomId);
    req.session.username = username; // Store username in session
    activeUsers[username] = true; // Mark user as active
    res.render(__dirname + "/Views/chatBody.ejs", {
      roomId: currentRoomId,
    });
  }
});

// Connection event listeners
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Connection event listeners
io.on("connection", async (socket) => {
  const session = socket.request.session;
  const username = session.username;

  if (currentRoomId) {
    // check user input room id in list
    socket.join(currentRoomId);
    // Notify all clients when user joins
    if (!usernames.includes(username)) {
      io.sockets.in(currentRoomId).emit("user joined", username);
      console.log(username + " joined chat room: "+ currentRoomId)
      usernames.push(username);
    }
  }

  // Disconnect
  socket.on("disconnect", () => {
    delete activeUsers[username]; // Remove user from active users
    io.emit("user left", username); // Notify clients about user leaving
  });

  // Client sends message
  socket.on("chat message", (msg) => {
    io.sockets
      .to(currentRoomId)
      .emit("chat message", { username, message: msg });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
