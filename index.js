const express = require("express");
const http = require("http");
const session = require("express-session");
const { Server } = require("socket.io");
const loginHandler = require("./Handlers/loginHandler");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//var and basic logic 
var roomIds = [];
var currentRoomId;
roomIds.push("1234");
var users = [];

//express-session middleware config
const sessionMiddleware = session({
  secret: "randomText",
  resave: true,
  saveUninitialized: true,
});

//implement express-session middleware in socket
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

//middleware inject
app.use(sessionMiddleware);

//landing page route
app.get("/", loginHandler.renderLogin);

// LoginHandler route
app.post(
  "/login",
  async (req, res) =>
    (currentRoomId = await loginHandler.handleLogin(
      req,
      res,
      roomIds,
      currentRoomId
    ))
);

//Sockets implementation
io.on("connection", async (socket) => {
  const session = socket.request.session;
  const username = session.username;

  //user join room event
  if (currentRoomId) {
    await socket.join(currentRoomId);
    if (!users.includes(username)) {
      io.sockets.in(currentRoomId).emit("user joined", username);
      console.log(username + " joined chat room: " + currentRoomId);
      users.push(username);
    }
  }
  socket.on("disconnect", () => {
    io.emit("user left", username);
  });

  // user send chat event
  socket.on("chat message", (msg) => {
    io.sockets
      .to(currentRoomId)
      .emit("chat message", { username, message: msg });
  });
});

//port
server.listen(3000, () => {
  console.log("listening on *:3000");
});
